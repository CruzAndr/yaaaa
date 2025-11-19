import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FingerprintScreen({ navigation, route }) {
  // Recibe el correo institucional del usuario desde la navegación
  const correo_institucional = route?.params?.correo_institucional;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificación por huella digital</Text>
      <Text style={styles.description}>Coloca tu dedo en el sensor para continuar.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreatePassword', { correo_institucional })}>
        <Text style={styles.buttonText}>Simular verificación</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#222',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5C5CFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
