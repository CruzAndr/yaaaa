import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topShape} />
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}><Text style={{ color: '#6C63FF' }}>Sabor</Text> U</Text>
      <Text style={styles.subtitle}>Sistema Integral para la Gestión de Alimentación Saludable y Personalizada {'\n'}(Sabor U)</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>¡Bienvenido!</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>Prototipo de Grupo 05 {' '}<Text style={styles.arrow}>→</Text></Text>
      <View style={styles.bottomShape} />
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
  topShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 150,
    height: 200,
    backgroundColor: '#6C63FF33',
    borderBottomRightRadius: 100,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#444',
  },
  button: {
    backgroundColor: '#276EF1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  arrow: {
    fontSize: 18,
    color: '#276EF1',
  },
  bottomShape: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 180,
    height: 180,
    backgroundColor: '#6C63FF22',
    borderTopLeftRadius: 100,
  },
});
