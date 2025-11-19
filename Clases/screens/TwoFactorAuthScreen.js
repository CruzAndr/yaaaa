import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function TwoFactorAuthScreen({ onVerify }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = () => {
    if (code.length === 6) {
      onVerify(code);
    } else {
      setError("El código debe tener 6 dígitos.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificación en dos pasos</Text>
      <Text style={styles.desc}>Ingresa el código enviado a tu correo electrónico.</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        placeholder="Código de 6 dígitos"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verificar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  desc: { fontSize: 15, color: "#555", marginBottom: 18 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 18, width: "80%", textAlign: "center", marginBottom: 10 },
  error: { color: "red", marginBottom: 8 },
  button: { backgroundColor: "#276EF1", padding: 14, borderRadius: 10, alignItems: "center", width: "80%" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});
