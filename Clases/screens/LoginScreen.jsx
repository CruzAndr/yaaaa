import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, ActivityIndicator, StyleSheet,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // =====================
  // Recuperar estado
  // =====================
  useEffect(() => {
    (async () => {
      const lock = await AsyncStorage.getItem('lockUntil');
      if (lock) setLockUntil(Number(lock));
    })();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // =====================
  // LOGIN PRINCIPAL
  // =====================
  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (lockUntil && Date.now() < lockUntil) {
      const secondsLeft = Math.ceil((lockUntil - Date.now()) / 1000);
      setCountdown(secondsLeft);
      setError("Has superado el límite. Espera para volver a intentar.");
      setLoading(false);
      return;
    }

    const correo = form.correo_institucional.trim();
    const password = form.contrasena.trim();

    if (!correo || !password) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }

    if (!correo.endsWith("@ucr.ac.cr")) {
      setError("El correo debe ser institucional (@ucr.ac.cr)");
      setLoading(false);
      return;
    }

    try {
      // ===========================
      // BUSCAR EN USERS
      // ===========================
      const { data: userData } = await supabase
        .from("users")
        .select("id, hashed_password, is_active, is_verified, rol_id, correo_institucional")
        .eq("correo_institucional", correo)
        .single();

      if (userData) {
        if (!userData.is_active) {
          setError("Cuenta desactivada.");
          setLoading(false);
          return;
        }

        if (!userData.is_verified) {
          setError("Verifica tu correo antes de iniciar sesión.");
          setLoading(false);
          return;
        }

        // Comparar contraseña
        const hashed = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          password
        );

        if (hashed !== userData.hashed_password) {
          setError("Usuario o contraseña incorrectos.");
          setLoading(false);
          return;
        }

        // Guardar datos del usuario
        await AsyncStorage.setItem("user_id", String(userData.id));
        await AsyncStorage.setItem("rol_id", String(userData.rol_id));
        await AsyncStorage.setItem("correo_institucional", correo);

        // Redirigir a Home, las opciones de admin se muestran en HomeScreen
        navigation.navigate("Home");

        setLoading(false);
        return;
      }

      // ===========================
      // BUSCAR EN PROVIDERS
      // ===========================
      const { data: providerData } = await supabase
        .from("providers")
        .select("direccion, hashed_password, estado")
        .eq("direccion", correo)
        .single();

      if (!providerData) {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      if (providerData.estado !== "aprobado") {
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

      await AsyncStorage.setItem("rol_id", "4");
      await AsyncStorage.setItem("correo_institucional", correo);

      navigation.navigate("Home");
      setLoading(false);

    } catch (err) {
      console.log("Error:", err);
      setError("Error inesperado.");
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.loginContainer, { width: '100%' }]}>

          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Bienvenido</Text>

            <Text style={styles.inputLabel}>Correo institucional</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ucr.ac.cr"
              value={form.correo_institucional}
              onChangeText={(t) => handleChange("correo_institucional", t)}
            />

            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry={!showPassword}
              value={form.contrasena}
              onChangeText={(t) => handleChange("contrasena", t)}
            />

            <TouchableOpacity
              style={{ position: "absolute", right: 35, top: 165 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "visibility" : "visibility-off"} size={24} color="#777" />
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              disabled={loading}
              onPress={handleLogin}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.providerButton} onPress={() => navigation.navigate('ProviderRegister')}>
              <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.providerGradient}>
                <Text style={styles.providerButtonText}>Registrar proveedor</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>

          {/* Botón para registrarse */}
          <TouchableOpacity style={{ marginTop: 24, alignSelf: 'center' }} onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: '#276EF1', fontWeight: 'bold', fontSize: 16 }}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>
          {/* Botón para recuperar contraseña */}
          <TouchableOpacity style={{ marginTop: 10, alignSelf: 'center' }} onPress={() => navigation.navigate('RecoverPassword')}>
            <Text style={{ color: '#276EF1', fontWeight: 'bold', fontSize: 16 }}>Recuperar contraseña</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginCard: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 22, elevation: 6 },
  loginTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputLabel: { fontSize: 14, marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#aaa", borderRadius: 10, padding: 12, fontSize: 16 },
  error: { color: "red", textAlign: "center", marginTop: 10 },
  button: { backgroundColor: "#007AFF", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 16 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  providerButton: { marginTop: 20, borderRadius: 12, overflow: "hidden" },
  providerGradient: { paddingVertical: 14, alignItems: "center" },
  providerButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});
