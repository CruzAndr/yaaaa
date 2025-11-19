import React, { useState } from "react";
import { 
  View, Text, TextInput, ActivityIndicator, StyleSheet,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from "../../Supabase/supabaseClient";
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useResponsive } from '../hooks/useResponsive';

export default function LoginScreen({ onLogin }) {
  const navigation = useNavigation();
  const responsive = useResponsive();

  const [form, setForm] = useState({ correo_institucional: "", contrasena: "" });
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const goToRegister = () => navigation.navigate('Register');
  const goToProviderRegister = () => navigation.navigate('ProviderRegister');

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const correo = form.correo_institucional.trim();
    const password = form.contrasena;

    if (!correo || !password) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }

    try {
      // ======================================================
      // 1️⃣ PRIMERO SE BUSCA EN USERS (CUENTAS NORMALES)
      // ======================================================
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('hashed_password, is_active, is_verified, rol_id')
        .eq('correo_institucional', correo)
        .single();

      if (userData) {
        if (!userData.is_active) {
          setError("Tu cuenta está desactivada. Contacta soporte.");
          setLoading(false);
          return;
        }

        if (!userData.is_verified) {
          setError("Debes verificar tu correo antes de iniciar sesión.");
          setLoading(false);
          return;
        }

        const hashed = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          password
        );

        if (hashed !== userData.hashed_password) {
          setError("Usuario o contraseña incorrectos.");
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem('userRol', String(userData.rol_id));
        if (onLogin) onLogin();
        navigation.navigate('Welcome');
        setLoading(false);
        return;
      }

      // ======================================================
      // 2️⃣ SI NO EXISTE EN USERS → SE BUSCA EN PROVIDERS
      // ======================================================
      let { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('direccion, hashed_password, is_verified, estado')
        .eq('direccion', correo)
        .single();

      if (!providerData) {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      // Estado del proveedor (aprobado, pendiente, rechazado)
      if (providerData.estado !== 'aprobado') {
        setError("Tu cuenta de proveedor debe estar aprobada.");
        setLoading(false);
        return;
      }

      const hashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      if (hashed !== providerData.hashed_password) {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('userRol', "4"); // Rol proveedor = 4
      if (onLogin) onLogin();
      navigation.navigate('Welcome');
      setLoading(false);

    } catch (e) {
      console.log(e);
      setError("Error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.loginContainer, { maxWidth: responsive.maxWidth.md, width: '100%' }]}>
          <View style={[styles.loginCard, { paddingVertical: responsive.spacing.lg, paddingHorizontal: responsive.spacing.lg }]}>

            <Text style={[styles.loginTitle, { fontSize: responsive.fontSize.xxl }]}>Bienvenido</Text>

            <View style={[styles.inputGroup, { marginBottom: responsive.spacing.md }]}>
              <Text style={styles.inputLabel}>Correo</Text>
              <TextInput
                style={styles.input}
                placeholder="correo"
                placeholderTextColor="#aaa"
                value={form.correo_institucional}
                onChangeText={(t) => handleChange("correo_institucional", t)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputGroup, { marginBottom: responsive.spacing.md }]}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={form.contrasena}
                onChangeText={(t) => handleChange("contrasena", t)}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: 10, top: 28 }}
              >
                <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#bbb" />
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity 
              style={[styles.button, loading && { backgroundColor: '#a0cfff' }]}
              disabled={loading}
              onPress={handleLogin}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 16 }} onPress={goToRegister}>
              <Text style={{ color: '#276EF1', fontWeight: 'bold' }}>¿No tienes cuenta? Regístrate aquí</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.providerButton} onPress={goToProviderRegister}>
              <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.providerGradient}>
                <Text style={styles.providerButtonText}>Registrar proveedor</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginCard: { width: '92%', backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 6 },
  loginTitle: { textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  inputGroup: { width: '100%' },
  inputLabel: { fontSize: 14, color: '#444', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  error: { color: "red", textAlign: "center", marginBottom: 10, fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  providerButton: { marginTop: 18, alignSelf: 'center', width: '80%', borderRadius: 12, overflow: 'hidden' },
  providerGradient: { paddingVertical: 14, alignItems: 'center' },
  providerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
