import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.bgShape1} />
      <View style={styles.bgShape2} />
      <Text style={styles.title}>Se ha realizado el registro exitoso.</Text>
      <Text style={styles.subtitle}>Te vamos a dirigir al inicio de sesión.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgShape1: {
    position: 'absolute',
    left: -80,
    bottom: -120,
    width: 300,
    height: 300,
    backgroundColor: '#0050FF',
    borderRadius: 200,
    opacity: 1,
    zIndex: 0,
  },
  bgShape2: {
    position: 'absolute',
    right: -60,
    top: 0,
    width: 220,
    height: 220,
    backgroundColor: '#DDE6FF',
    borderRadius: 120,
    opacity: 1,
    zIndex: 0,
  },
  title: {
    color: '#5C5CFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 60,
    zIndex: 1,
  },
  subtitle: {
    color: '#222',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    zIndex: 1,
  },
  button: {
    backgroundColor: '#5C5CFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: 220,
    zIndex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
