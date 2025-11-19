import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../../../Supabase/supabaseClient';

const TwoFactorAuthScreen = ({ navigation }) => {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [code, setCode] = useState('');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Autenticación de Doble Factor</Text>
      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Cédula"
            value={cedula}
            onChangeText={setCedula}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
          />
          <TouchableOpacity style={styles.button} onPress={handleValidateUser}>
            <Text style={styles.buttonText}>Validar usuario</Text>
          </TouchableOpacity>
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.subtitle}>Selecciona método de doble factor:</Text>
          <View style={styles.methodRow}>
            <TouchableOpacity
              style={[styles.methodButton, method === 'code' && styles.selected]}
              onPress={() => setMethod('code')}
            >
              <Text>Código temporal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodButton, method === 'biometric' && styles.selected]}
              onPress={() => setMethod('biometric')}
            >
              <Text>Biométrico</Text>
            </TouchableOpacity>
          </View>
          {method === 'code' && (
            <>
              <TouchableOpacity style={[styles.button, { marginBottom: 8 }]} onPress={handleSendCode}>
                <Text style={styles.buttonText}>Enviar código al correo</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Código temporal"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={6}
              />
            </>
          )}
          <TouchableOpacity style={styles.button} onPress={handleSecondFactor}>
            <Text style={styles.buttonText}>Validar segundo factor</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: '90%',
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2d98da',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 15,
  },
  methodButton: {
    flex: 1,
    backgroundColor: '#d1d8e0',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#2d98da',
  },
});

export default TwoFactorAuthScreen;
