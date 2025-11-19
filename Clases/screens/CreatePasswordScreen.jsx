import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../../Supabase/supabaseClient";
import * as Crypto from 'expo-crypto';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CreatePasswordScreen({ navigation, route }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Recibe el correo institucional del usuario desde la navegación
  const correo_institucional = route?.params?.correo_institucional;

  const handleCreate = async () => {
    setError(null);
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, números y letras.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const hashed_password = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      // Actualiza el usuario con la contraseña
      const { error: updateError } = await supabase
        .from('users')
        .update({ hashed_password })
        .eq('correo_institucional', correo_institucional);
      if (updateError) {
        setError('Error al guardar la contraseña.');
      } else {
        navigation.navigate('Success');
      }
    } catch (e) {
      setError('Error inesperado.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Crear contraseña</Text>
      <Text style={styles.subtitle}>Crea una contraseña para poder iniciar sesión.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contraseña <Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#A9A9A9"
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeButton}>
            <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirma la contraseña <Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            placeholderTextColor="#A9A9A9"
          />
          <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeButton}>
            <Icon name={showConfirm ? 'visibility' : 'visibility-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: { alignSelf: 'flex-start', marginBottom: 10 },
  backArrow: { fontSize: 28, color: '#888', fontWeight: 'bold' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    alignSelf: 'flex-start',
    width: '100%',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
    alignSelf: 'flex-start',
    width: '100%',
  },
  inputGroup: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    color: '#222',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  asterisk: {
    color: '#C00',
    fontWeight: 'bold',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E4F7',
    marginBottom: 0,
    paddingHorizontal: 10,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: '#5C5CFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    marginBottom: 18,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
});
