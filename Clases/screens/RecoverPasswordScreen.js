import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function RecoverPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleRecover = async () => {
    setLoading(true);
    setMsg("");
    // Generar código local de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('LocalResetCode', { email, code });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.desc}>Ingresa tu correo institucional para recibir el enlace de recuperación.</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo institucional"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleRecover} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Enviando..." : "Enviar enlace"}</Text>
      </TouchableOpacity>
      {msg ? <Text style={styles.success}>{msg}</Text> : null}
      <TouchableOpacity style={{ marginTop: 18 }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#276EF1', fontWeight: 'bold' }}>Volver al login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  desc: { fontSize: 15, color: "#555", marginBottom: 18, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 18, width: "80%", marginBottom: 10 },
  button: { backgroundColor: "#276EF1", padding: 14, borderRadius: 10, alignItems: "center", width: "80%" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  success: { color: "green", marginTop: 12, textAlign: 'center' },
});
