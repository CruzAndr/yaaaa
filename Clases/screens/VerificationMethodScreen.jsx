import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";

export default function VerificationMethodScreen({ navigation, route }) {
  const correo_institucional = route?.params?.correo_institucional;
  const [selected, setSelected] = useState('fingerprint');

  const handleNext = () => {
    if (selected === 'fingerprint') {
      navigation.navigate('Fingerprint', { correo_institucional });
    } else {
      navigation.navigate('EmailCode', { correo_institucional });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>Método de verificación.</Text>
        <Text style={styles.subtitle}>Debemos verificar tu información digitada. ¿Qué método eliges?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, selected === 'fingerprint' ? styles.toggleSelected : styles.toggleUnselected]}
            onPress={() => {
              setSelected('fingerprint');
              navigation.navigate('Fingerprint', { correo_institucional });
            }}
          >
            <Text style={[styles.toggleText, selected === 'fingerprint' ? styles.toggleTextSelected : styles.toggleTextUnselected]}>Huella digital</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, selected === 'email' ? styles.toggleSelected : styles.toggleUnselected]}
            onPress={() => {
              setSelected('email');
              navigation.navigate('EmailCode', { correo_institucional });
            }}
          >
            <Text style={[styles.toggleText, selected === 'email' ? styles.toggleTextSelected : styles.toggleTextUnselected]}>Correo universitario</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ...existing code...

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    backgroundColor: '#fff',
    paddingVertical: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 36,
    width: '100%',
    minHeight: 520,
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
    marginTop: 32,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 8,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  toggleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  toggleButton: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  toggleSelected: {
    backgroundColor: '#3D3DFF',
  },
  toggleUnselected: {
    backgroundColor: '#EDEEFF',
  },
  toggleSelectedEmail: {
    backgroundColor: '#FDE7EA',
  },
  toggleUnselectedEmail: {
    backgroundColor: '#FFF2F4',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleTextSelected: {
    color: '#fff',
  },
  toggleTextUnselected: {
    color: '#3D3DFF',
  },
  // El color seleccionado ahora es igual para ambos métodos
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 4,
    alignItems: 'center',
  },
  cancelText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
  },
});
