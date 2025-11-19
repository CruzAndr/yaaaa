import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function LocalResetCodeScreen({ route, navigation }) {
  const { email, code } = route.params;
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = () => {
    if (inputCode === code) {
      navigation.navigate('LocalChangePassword', { email });
    } else {
      setError("El código es incorrecto.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.info}>Correo con el código: <Text style={{ fontWeight: 'bold' }}>{code}</Text></Text>
      <Text style={styles.desc}>Ingresa el código recibido para continuar.</Text>
      <TextInput
        style={styles.input}
        placeholder="Código"
        value={inputCode}
        onChangeText={setInputCode}
        keyboardType="numeric"
        maxLength={6}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verificar código</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  info: { fontSize: 16, color: "#276EF1", marginBottom: 10, textAlign: 'center' },
  desc: { fontSize: 15, color: "#555", marginBottom: 18, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 18, width: "80%", marginBottom: 10 },
  button: { backgroundColor: "#276EF1", padding: 14, borderRadius: 10, alignItems: "center", width: "80%" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  error: { color: "red", marginBottom: 8 },
});
