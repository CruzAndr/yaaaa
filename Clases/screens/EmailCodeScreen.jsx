import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { supabase } from "../../Supabase/supabaseClient";

export default function EmailCodeScreen({ navigation, route }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Normalizar correo
  const correo_institucional = (route?.params?.correo_institucional || "")
    .trim()
    .toLowerCase();

  // Teclado numérico
  const handleKeyPress = (val) => {
    if (val === "<-") {
      setCode(code.slice(0, -1));
    } else if (val === "C") {
      setCode("");
    } else if (code.length < 6 && /^[0-9]$/.test(val)) {
      setCode(code + val);
    }
  };

  // Generar y guardar código
  const sendVerificationCode = async () => {
    setLoading(true);
    setError("");
    setInfo("");

    // Normalizamos de nuevo para evitar errores
    const correo = (route?.params?.correo_institucional || "")
      .trim()
      .toLowerCase();

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("📤 Intentando guardar código para:", correo);
    console.log("🔢 Código generado:", generatedCode);

    // Aquí viene la parte crítica: HACEMOS SELECT después del update
    const { data, error: updateError } = await supabase
      .from("users")
      .update({ verification_code: generatedCode })
      .eq("correo_institucional", correo)
      .select(); // <--- NECESARIO para obtener si actualizó o no

    if (updateError) {
      console.log("❌ Error al actualizar en Supabase:", updateError);
      setError("No se pudo guardar el código.");
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      console.log("⚠ No se actualizó ninguna fila. El correo NO existe:", correo);
      setError("Este correo no existe en el sistema.");
      setLoading(false);
      return;
    }

    console.log("✅ Código guardado en la DB:", generatedCode);

    setInfo(`Código enviado: ${generatedCode}`); // Lo muestras temporalmente
    setLoading(false);
  };

  // Enviar código al iniciar
  useEffect(() => {
    sendVerificationCode();
  }, []);

  // Verificar código
  const handleVerify = async () => {
    setError("");
    setLoading(true);

    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      setLoading(false);
      return;
    }

    const { data, error: selectError } = await supabase
      .from("users")
      .select("verification_code")
      .eq("correo_institucional", correo_institucional)
      .single();

    if (selectError || !data) {
      console.log("❌ Error al leer el código:", selectError);
      setError("No se pudo verificar el código.");
      setLoading(false);
      return;
    }

    console.log("🎯 Código guardado:", data.verification_code);
    console.log("🎯 Código ingresado:", code);

    if (data.verification_code !== code) {
      setError("El código ingresado no es correcto.");
      setLoading(false);
      return;
    }

    // Marcar usuario como verificado
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_verified: true })
      .eq("correo_institucional", correo_institucional);
    if (updateError) {
      setError("No se pudo actualizar el estado de verificación.");
      setLoading(false);
      return;
    }

    console.log("🎉 Código correcto, usuario verificado, navegando...");
    navigation.navigate("CreatePassword", { correo_institucional });
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.notification}>
        <Text style={styles.notificationText}>
          Hemos enviado un código de verificación a tu correo universitario.
        </Text>
      </View>

      {info ? <Text style={{ color: "#5C5CFF", marginBottom: 8 }}>{info}</Text> : null}

      <Text style={styles.title}>Verificación</Text>
      <Text style={styles.subtitle}>
        Por favor, ingresa tu código de verificación para seguir con el proceso
      </Text>

      <View style={styles.codeInputsContainer}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.codeInputBox}>
            {code[i] ? <Text style={styles.codeInputText}>{code[i]}</Text> : null}
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={sendVerificationCode} disabled={loading}>
        <Text style={styles.resend}>{loading ? "Enviando..." : "Reenviar"}</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.acceptButton} onPress={handleVerify} disabled={loading}>
        <Text style={styles.acceptButtonText}>
          {loading ? "Verificando..." : "Aceptar"}
        </Text>
      </TouchableOpacity>

      <View style={styles.keyboardContainer}>
        {[
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          ["<-", "0", "C"],
        ].map((row, idx) => (
          <View key={idx} style={styles.keyboardRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.keyButton}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 24,
    minHeight: 600,
    width: "100%",
  },
  notification: {
    backgroundColor: "#F6F8FF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    color: "#222",
    fontSize: 14,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5C5CFF",
    marginBottom: 8,
    width: "100%",
  },
  subtitle: {
    fontSize: 15,
    color: "#444",
    marginBottom: 18,
    width: "100%",
  },
  codeInputsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    width: "100%",
  },
  codeInputBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#F6F8FF",
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E4F7",
  },
  codeInputText: {
    fontSize: 20,
    color: "#222",
    fontWeight: "bold",
  },
  resend: {
    color: "#5C5CFF",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 18,
    width: "100%",
  },
  acceptButton: {
    backgroundColor: "#5C5CFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    marginBottom: 18,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  keyboardContainer: {
    width: "100%",
    maxWidth: 340,
    marginTop: 8,
  },
  keyboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  keyButton: {
    backgroundColor: "#F6F8F7",
    borderRadius: 10,
    width: 70,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 20,
    color: "#222",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 10,
    width: "100%",
  },
});
