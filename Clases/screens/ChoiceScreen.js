import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function ChoiceScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>¿Algo en mente hoy?</Text>
      <Text style={styles.subtitle}>Pedí tu comida favorita entre las cientos de opciones que tenemos para ti en los menús.</Text>
      <Text style={styles.reminder}>Recorda: Utiliza el Chat para saber más detalles de lo que deseas.</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerBtnText}>Registrarse  →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoBox: {
    backgroundColor: '#F6FAF9',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 8,
  },
  reminder: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  loginBtn: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  loginBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerBtn: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  registerBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
