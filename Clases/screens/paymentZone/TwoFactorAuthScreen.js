import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../../../Supabase/supabaseClient';

const TwoFactorAuthScreen = ({ navigation }) => {
  const [method, setMethod] = useState('');

  // Paso 1: Validar cédula y nombre
  const handleValidateUser = async () => {
    if (!cedula || !nombre) {
      Alert.alert('Error', 'Debes ingresar cédula y nombre completo.');
      return;
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('cedula', cedula.trim())
      .ilike('nombre_completo', nombre.trim())
      .single();
    if (error || !data) {
      Alert.alert('Error', 'Usuario no encontrado o datos incorrectos.');
      return;
    }
    if (!data.is_active || !data.is_verified) {
      Alert.alert('Error', 'Usuario inactivo o no verificado.');
      return;
    }
    setUser(data);
    setStep(2);
  };

  // Paso 2: Validar segundo factor
  const handleSendCode = async () => {
    // Simulación: Generar código y enviarlo al correo institucional
    if (!user || !user.correo_institucional) {
      Alert.alert('Error', 'No se encontró el correo institucional.');
      return;
    }
    // Aquí deberías llamar a tu backend para enviar el código
    Alert.alert('Código enviado', `Se ha enviado un código temporal a ${user.correo_institucional}`);
  };

  const handleSecondFactor = async () => {
    if (method === 'code') {
      if (!code) {
        Alert.alert('Error', 'Ingresa el código temporal.');
        return;
      }
      // Simulación de validación
      if (code === '123456') {
        Alert.alert('Acceso concedido', 'Autenticación exitosa.');
        navigation.replace('SecurePaymentScreen', { product: user.product });
      } else {
        Alert.alert('Error', 'Código incorrecto.');
      }
    } else if (method === 'biometric') {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirma tu identidad' });
      if (result.success) {
        Alert.alert('Acceso concedido', 'Autenticación biométrica exitosa.');
        navigation.replace('SecurePaymentScreen', { product: user.product });
      } else {
        Alert.alert('Error', 'Autenticación biométrica fallida.');
      }
    } else {
      Alert.alert('Error', 'Selecciona un método de doble factor.');
    }
  };

  // Nueva función para manejar la acción según el método seleccionado
  const handleMethodAction = async (selected) => {
    setMethod(selected);
    if (selected === 'biometric') {
      try {
        const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirma tu identidad' });
        if (result.success) {
          Alert.alert('Acceso concedido', 'Autenticación biométrica exitosa.');
          navigation.replace('SecurePaymentScreen');
        } else {
          Alert.alert('Error', 'Autenticación biométrica fallida.');
        }
      } catch {
        Alert.alert('Error', 'No se pudo iniciar la autenticación biométrica.');
      }
    } else if (selected === 'code') {
      Alert.alert('Actualmente, fuera de servicio.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <Image source={require('../../../assets/logo.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Método de verificación.</Text>
      <Text style={styles.subtitle}>Debemos verificar tu información digitada. ¿Qué método eliges?</Text>
      <View style={styles.optionsWrapper}>
        <TouchableOpacity
          style={[styles.optionBtn, method === 'biometric' && styles.optionBtnActive]}
          onPress={() => handleMethodAction('biometric')}
        >
          <Text style={[styles.optionText, method === 'biometric' && styles.optionTextActive]}>Huella digital.</Text>
          <View style={[styles.circle, method === 'biometric' && styles.circleActive]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionBtn, styles.optionBtnAlt, method === 'code' && styles.optionBtnActiveAlt]}
          onPress={() => handleMethodAction('code')}
        >
          <Text style={[styles.optionText, styles.optionTextAlt, method === 'code' && styles.optionTextActiveAlt]}>Correo universitario.</Text>
          <View style={[styles.circle, styles.circleAlt, method === 'code' && styles.circleActiveAlt]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  optionsWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 18,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A8DFF',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: 260,
    justifyContent: 'space-between',
  },
  optionBtnActive: {
    backgroundColor: '#3A8DFF',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#3A8DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActive: {
    backgroundColor: '#fff',
    borderColor: '#3A8DFF',
  },
  optionBtnAlt: {
    backgroundColor: '#ffe9ec',
  },
  optionBtnActiveAlt: {
    backgroundColor: '#ffe9ec',
    borderWidth: 2,
    borderColor: '#FF6B81',
  },
  optionTextAlt: {
    color: '#222',
    fontWeight: 'bold',
  },
  optionTextActiveAlt: {
    color: '#FF6B81',
    fontWeight: 'bold',
  },
  circleAlt: {
    backgroundColor: '#ffe9ec',
    borderColor: '#fff',
  },
  circleActiveAlt: {
    backgroundColor: '#FF6B81',
    borderColor: '#FF6B81',
  },
});

export default TwoFactorAuthScreen;
