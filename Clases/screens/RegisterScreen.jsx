import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../Supabase/supabaseClient";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nombre_completo: "",
    apellidos: "",
    cedula: "",
    correo_institucional: "",
    correo_personal: "",
    rol_id: "",
    nombre_emprendimiento: "",
    contacto_telefono: "",
    direccion_habitacion: "",
    permiso_municipal: "",
    autorizacion_salud: "",
    permisos_sanitarios: "",
    categoria_id: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categorias, setCategorias] = useState([]);

  // Obtener categorías de proveedor desde Supabase
  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from("provider_categories")
        .select("id, name");

      if (!error && data) {
        setCategorias(data);
      } else {
        console.log("Error cargando categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  const roles = [
    { id: 1, label: "Estudiante" },
    { id: 2, label: "Docente" },
    { id: 3, label: "Administrativo" },
    { id: 4, label: "Proveedor local" },
    { id: 5, label: "Emprendimiento estudiantil" },
  ];

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Validación de campos obligatorios generales
    if (!form.nombre_completo || form.nombre_completo.trim().length < 2) {
      setError("El nombre completo es obligatorio y debe tener al menos 2 caracteres.");
      return false;
    }
    if (!form.apellidos || form.apellidos.trim().length < 2) {
      setError("Los apellidos son obligatorios y deben tener al menos 2 caracteres.");
      return false;
    }
    if (!form.cedula) {
      setError("El número de cédula/carnet es obligatorio.");
      return false;
    }
    if (!form.correo_institucional) {
      setError("El correo institucional es obligatorio.");
      return false;
    }
    if (!form.direccion_habitacion) {
      setError("La dirección de habitación es obligatoria.");
      return false;
    }
    if (!form.rol_id) {
      setError("Debes seleccionar un rol.");
      return false;
    }

    // Validar formato de correo institucional
    const correo = form.correo_institucional.trim().toLowerCase();
    if (!correo.endsWith("@ucr.ac.cr")) {
      setError("El correo institucional debe terminar en @ucr.ac.cr");
      return false;
    }

    // Validaciones para proveedor local
    if (form.rol_id == 4) {
      if (!form.nombre_emprendimiento || form.nombre_emprendimiento.length > 20) {
        setError("El nombre del proveedor es obligatorio y debe tener máximo 20 caracteres.");
        return false;
      }
      if (!form.contacto_telefono || form.contacto_telefono.length !== 8) {
        setError("El número de contacto debe tener exactamente 8 dígitos.");
        return false;
      }
      if (!form.permiso_municipal) {
        setError("El número de permiso municipal es obligatorio.");
        return false;
      }
      if (!form.autorizacion_salud) {
        setError("La autorización del Ministerio de Salud es obligatoria.");
        return false;
      }
      if (!form.permisos_sanitarios) {
        setError("Los permisos sanitarios son obligatorios.");
        return false;
      }
      if (!form.categoria_id) {
        setError("Debes seleccionar una categoría de proveedor.");
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleRegister = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    const correoNormalizado = form.correo_institucional.trim().toLowerCase();
    const now = new Date().toISOString();

    try {
      // Verificar si ya existe un usuario con ese correo
      const { data: existing, error: existingError } = await supabase
        .from("users")
        .select("correo_institucional")
        .eq("correo_institucional", correoNormalizado);

      if (existingError) {
        console.log("Existing user check error:", existingError);
        setError("Error al verificar el correo institucional.");
        return;
      }

      if (existing && existing.length > 0) {
        setError("El correo institucional ya está registrado.");
        return;
      }

      const userData = {
        cedula: parseInt(form.cedula, 10),
        nombre_completo: (form.nombre_completo + " " + form.apellidos).trim(),
        correo_institucional: correoNormalizado,
        hashed_password: null, // más seguro
        rol_id: Number(form.rol_id),
        is_active: true,
        is_verified: false,
        created_at: now,
        updated_at: now,
      };

      const { data, error: insertError } = await supabase
        .from("users")
        .insert([userData])
        .select();

      if (insertError) {
        console.log("Insert error:", insertError);
        setError("Error al registrar usuario.");
        return;
      }

      if (!data || data.length === 0) {
        setError("Error interno. No se pudo registrar el usuario.");
        return;
      }

      setSuccess(true);

      navigation.navigate("VerificationMethod", {
        correo_institucional: correoNormalizado,
        nombre_completo: (form.nombre_completo + " " + form.apellidos).trim(),
      });
    } catch (e) {
      console.log("Unexpected error:", e);
      setError("Ha ocurrido un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>{"<"}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Crear cuenta.</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={form.nombre_completo}
          onChangeText={(t) => handleChange("nombre_completo", t)}
          placeholderTextColor="#A9A9A9"
        />
        <TextInput
          style={styles.input}
          placeholder="Número de cédula o carnet"
          value={form.cedula}
          onChangeText={(t) => handleChange("cedula", t.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          maxLength={15}
          placeholderTextColor="#A9A9A9"
        />

        <TextInput
          style={styles.input}
          placeholder="Apellidos"
          value={form.apellidos}
          onChangeText={(t) => handleChange("apellidos", t)}
          placeholderTextColor="#A9A9A9"
        />

        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Dirección de correo universitario (@ucr.ac.cr)"
          autoCapitalize="none"
          value={form.correo_institucional}
          onChangeText={(t) => handleChange("correo_institucional", t)}
          placeholderTextColor="#A9A9A9"
        />

        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Correo personal (opcional)"
          autoCapitalize="none"
          value={form.correo_personal}
          onChangeText={(t) => handleChange("correo_personal", t)}
          placeholderTextColor="#A9A9A9"
        />

        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Dirección de habitación"
          value={form.direccion_habitacion}
          onChangeText={(t) => handleChange("direccion_habitacion", t)}
          placeholderTextColor="#A9A9A9"
        />

        <Text style={styles.label}>Rol</Text>
        <Picker
          selectedValue={form.rol_id}
          style={styles.input}
          onValueChange={(v) => handleChange("rol_id", v)}
        >
          <Picker.Item label="Selecciona un rol" value="" />
          {roles.map((r) => (
            <Picker.Item key={r.id} label={r.label} value={r.id} />
          ))}
        </Picker>

        {form.rol_id == 4 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nombre del emprendimiento (máx. 20 caracteres)"
              value={form.nombre_emprendimiento}
              onChangeText={(t) => handleChange("nombre_emprendimiento", t)}
              maxLength={20}
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              style={styles.input}
              placeholder="Número de contacto (8 dígitos)"
              value={form.contacto_telefono}
              onChangeText={(t) =>
                handleChange("contacto_telefono", t.replace(/[^0-9]/g, ""))
              }
              keyboardType="numeric"
              maxLength={8}
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              style={styles.input}
              placeholder="Número de permiso municipal"
              value={form.permiso_municipal}
              onChangeText={(t) => handleChange("permiso_municipal", t)}
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              style={styles.input}
              placeholder="Autorización del Ministerio de Salud"
              value={form.autorizacion_salud}
              onChangeText={(t) => handleChange("autorizacion_salud", t)}
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              style={styles.input}
              placeholder="Permisos sanitarios"
              value={form.permisos_sanitarios}
              onChangeText={(t) => handleChange("permisos_sanitarios", t)}
              placeholderTextColor="#A9A9A9"
            />
            <Text style={styles.label}>Categoría de proveedor</Text>
            <Picker
              selectedValue={form.categoria_id}
              style={styles.input}
              onValueChange={(v) => handleChange("categoria_id", v)}
            >
              <Picker.Item label="Selecciona una categoría" value="" />
              {categorias.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>¡Usuario registrado correctamente!</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Registrando..." : "Continue"}</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <View style={styles.rowTextLink}>
          <Text style={styles.infoText}>¿Tienes una cuenta ya? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.infoText, styles.linkText]}>Inicia sesión acá.</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoTitle}>¿Por qué pedimos tu dirección?</Text>
        <Text style={styles.infoDescription}>
          Se utiliza para mejorar recomendaciones de servicios cerca de tu vivienda.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: { alignSelf: "flex-start", marginBottom: 10 },
  backArrow: { fontSize: 28, color: "#888", fontWeight: "bold" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24, color: "#222" },
  formContainer: { width: "100%", maxWidth: 420, marginBottom: 24 },
  input: {
    width: "100%",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 14,
    color: "#222",
  },
  inputSmall: { fontSize: 13 },
  label: { marginBottom: 4, fontSize: 14, color: "#222" },
  button: {
    backgroundColor: "#5C5CFF",
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    marginBottom: 18,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  error: { color: "red", marginBottom: 10 },
  success: { color: "green", marginBottom: 10 },
  infoContainer: {
    width: "100%",
    maxWidth: 420,
    marginTop: 8,
    marginBottom: 8,
  },
  rowTextLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: { fontSize: 13, color: "#222" },
  linkText: { color: "#276EF1", fontWeight: "bold", textDecorationLine: "underline" },
  infoTitle: { fontSize: 15, fontWeight: "bold", color: "#222", marginBottom: 6 },
  infoDescription: { fontSize: 13, color: "#444", marginBottom: 4, lineHeight: 18 },
});
