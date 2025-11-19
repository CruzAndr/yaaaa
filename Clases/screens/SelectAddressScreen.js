import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const DIRECCIONES = [
  { id: 1, nombre: 'Comedor Estudiantil' },
  { id: 2, nombre: 'Biblioteca Carlos Monge' },
  { id: 3, nombre: 'Edificio de Aulas' },
  { id: 4, nombre: 'Parqueo Principal' },
  { id: 5, nombre: 'Laboratorios' },
];

export default function SelectAddressScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);
  const { cart } = route.params || {};

  const handleContinue = () => {
    if (!selected) return;
    const direccionNombre = DIRECCIONES.find(d => d.id === selected)?.nombre || '';
    navigation.navigate('OrderConfirmationScreen', { direccion: direccionNombre, cart });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona la dirección de entrega</Text>
      <FlatList
        data={DIRECCIONES}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={selected === item.id ? styles.addressBtnActive : styles.addressBtn}
            onPress={() => setSelected(item.id)}
          >
            <Text style={selected === item.id ? styles.addressTextActive : styles.addressText}>{item.nombre}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={[styles.continueBtn, !selected && { backgroundColor: '#ccc' }]}
        onPress={handleContinue}
        disabled={!selected}
      >
        <Text style={styles.continueText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 18,
    color: '#276EF1',
    textAlign: 'center',
  },
  addressBtn: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  addressBtnActive: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#276EF1',
    marginBottom: 10,
  },
  addressText: {
    color: '#222',
    fontSize: 16,
  },
  addressTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueBtn: {
    backgroundColor: '#276EF1',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
