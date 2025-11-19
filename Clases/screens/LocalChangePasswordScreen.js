import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../../Supabase/supabaseClient";
import * as Crypto from 'expo-crypto';

export default function LocalChangePasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setError("");
    setMsg("");
    if (!password || !confirm) {
      setError("Completa ambos campos.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    // Verificar que el correo exista
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('correo_institucional', email)
      .single();
    if (findError || !user) {
      setLoading(false);
      setError("El correo no está registrado.");
      return;
    }
    // Hash SHA256 igual que login
    const hashed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    const { error: dbError } = await supabase
      .from('users')
      .update({ hashed_password: hashed })
      .eq('correo_institucional', email);
    setLoading(false);
    if (dbError) {
      setError("Error al cambiar la contraseña.");
    } else {
      setMsg("Contraseña cambiada correctamente. Puedes iniciar sesión.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar contraseña</Text>
      <Text style={styles.desc}>Ingresa tu nueva contraseña.</Text>
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {msg ? <Text style={styles.success}>{msg}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleChange} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Guardando..." : "Cambiar contraseña"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 18 }} onPress={() => navigation.navigate('Login')}>
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
  error: { color: "red", marginBottom: 8 },
  success: { color: "green", marginBottom: 8 },
});
