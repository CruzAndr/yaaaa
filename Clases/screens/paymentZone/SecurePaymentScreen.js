import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { supabase } from '../../../Supabase/supabaseClient';
import { CartContext } from '../../contexts/CartContext';

const PAYMENT_CHECKOUT_URL = 'https://buy.stripe.com/test_14AeV5cyU1zC9teau25AQ00'; // Reemplaza por tu URL real

const SecurePaymentScreen = ({ navigation, route }) => {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const { clearCart } = useContext(CartContext);

  // Validar usuario
  const handleValidateUser = async () => {
    if (!cedula || !nombre) {
      Alert.alert('Error', 'Debes ingresar cédula y nombre completo.');
      return false;
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('cedula', cedula)
      .eq('nombre_completo', nombre)
      .single();
    if (error || !data) {
      Alert.alert('Error', 'Usuario no encontrado o datos incorrectos.');
      return false;
    }
    if (!data.is_active || !data.is_verified) {
      Alert.alert('Error', 'Usuario inactivo o no verificado.');
      return false;
    }
    return true;
  };

  // Procesar pago
  const handlePayment = async () => {
    setLoading(true);
    const valid = await handleValidateUser();
    if (!valid) {
      setLoading(false);
      return;
    }
    if (!monto || !cardNumber || !cardExp || !cardCVC) {
      Alert.alert('Error', 'Completa todos los datos de la tarjeta y el monto.');
      setLoading(false);
      return;
    }
    // Antes de procesar el pago, navegar a selección de dirección
    navigation.navigate('SelectAddressScreen', { cart: route.params?.cart });
    setLoading(false);
  };

  // Detectar éxito en WebView
  const handleWebViewNavigationStateChange = (navState) => {
    // Cambia esta URL por la de éxito real de tu checkout
    if (navState.url.includes('success')) {
      setShowWebView(false);
      Alert.alert('Pago exitoso', 'El pago se ha procesado correctamente.');
      navigation.goBack();
    }
    if (navState.url.includes('cancel')) {
      setShowWebView(false);
      Alert.alert('Pago cancelado', 'El pago fue cancelado.');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoSabor}>Sabor</Text>
        <Text style={styles.logoU}> U</Text>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.welcomeTitle}>Hola.</Text>
        <Text style={styles.welcomeSubtitle}>Serás redirigido a la web de pago.</Text>
        <TouchableOpacity
          style={[styles.startButton, hasPaid && { backgroundColor: '#ccc' }]}
          onPress={() => {
            if (!hasPaid) {
              Linking.openURL(PAYMENT_CHECKOUT_URL);
              setHasPaid(true);
            }
          }}
          disabled={hasPaid}
        >
          <Text style={styles.startButtonText}>
            {hasPaid ? 'Ya redirigido al pago' : 'Ir a la web de pago.'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            clearCart();
            navigation.replace('Home');
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar y volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 0,
  },
  logoSabor: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#5f6bf2',
    letterSpacing: 1,
  },
  logoU: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 1,
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
    left: 0,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 18,
    color: '#444',
    marginBottom: 2,
    marginLeft: 8,
    fontWeight: '500',
    textAlign: 'left',
    width: '90%',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 18,
    marginLeft: 8,
    textAlign: 'left',
    width: '90%',
  },
  startButton: {
    backgroundColor: '#0057ff',
    borderRadius: 8,
    width: '90%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cancelButtonText: {
    color: '#0057ff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

export default SecurePaymentScreen;
