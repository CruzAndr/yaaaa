import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function ProfileIntroScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/avatar1.png')} style={styles.logo} />
      <Text style={styles.title}><Text style={styles.sabor}>Sabor</Text> <Text style={styles.u}>U</Text></Text>
      <View style={styles.infoBox}>
        <Text style={styles.attention}>¡Atención!</Text>
        <Text style={styles.infoText}>
          Entrará al menú con todas las funciones disponibles de Sabor U. Esta simulación obedece a un usuario con roles para tener acceso a estas funciones. Un usuario normal, no tendrá acceso a todas las opciones.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Profile')}>
        <Text style={styles.buttonText}>Prototipo Sabor U.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 18,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  sabor: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  u: {
    color: '#222',
    fontWeight: 'normal',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  attention: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '90%',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
