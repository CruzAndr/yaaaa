import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const menuOptions = [
  { label: 'Acuerdos con proveedores', screen: 'AEModule' },
  { label: 'Gestión de menús saludables', screen: 'AEMenuGestion' },
  { label: 'Optimización de recorrido', screen: 'AERecorridoOpt' },
  { label: 'Registro de platos', screen: 'AERegistroPlato' },
  { label: 'Búsqueda de platos', screen: 'AEBusquedaPlato' },
  { label: 'Actualizar plato', screen: 'AEActualizarPlato' },
  { label: 'Dar de baja plato', screen: 'AEDarBajaPlato' },
  { label: 'Inventario y pedidos', screen: 'AEInventarioPedidos' },
];

const AEModuleMenuScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Módulo AE</Text>
      {menuOptions.map(opt => (
        <TouchableOpacity
          key={opt.screen}
          style={styles.btn}
          onPress={() => navigation.navigate(opt.screen)}
        >
          <Text style={styles.btnText}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  btn: { backgroundColor: '#1976D2', padding: 16, borderRadius: 10, marginBottom: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AEModuleMenuScreen;
