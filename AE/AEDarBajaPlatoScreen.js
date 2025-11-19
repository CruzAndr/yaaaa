import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../Supabase/supabaseClient';

const AEDarBajaPlatoScreen = () => {
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState('');

  const [platos, setPlatos] = useState([]);
  const [selectedPlatoId, setSelectedPlatoId] = useState('');
  const [motivo, setMotivo] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar proveedores aprobados
  useEffect(() => {
    const loadProveedores = async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('id, nombre_emprendimiento')
        .eq('estado', 'aprobado');

      if (!error) setProveedores(data);
    };
    loadProveedores();
  }, []);

  // Cargar platos del proveedor seleccionado
  const loadPlatosProveedor = async (provId) => {
    setSelectedProveedor(provId);
    setSelectedPlatoId('');
    setMotivo('');
    setPlatos([]);

    if (!provId) return;

    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('provider_id', provId)
      .eq('is_active', true);

    if (!error) setPlatos(data);
  };

  const handleDarBaja = async () => {
    setMensaje('');

    if (!selectedPlatoId) {
      setMensaje('Seleccione un plato.');
      return;
    }
    if (!motivo.trim()) {
      setMensaje('Ingrese un motivo de baja.');
      return;
    }

    setLoading(true);

    try {
      const platoOriginal = platos.find(p => p.id === selectedPlatoId);

      // 1. Actualizamos el plato → inactivo
      const { error } = await supabase
        .from('dishes')
        .update({
          is_active: false
        })
        .eq('id', selectedPlatoId)
        .eq('provider_id', selectedProveedor);

      if (error) {
        setMensaje('Error al dar de baja: ' + error.message);
        setLoading(false);
        return;
      }

      // 2. Guardar registro en audit_log
      await supabase.from('audit_log').insert([
        {
          tabla: 'dishes',
          accion: 'deactivate',
          registro_id: selectedPlatoId,
          usuario_id: selectedProveedor,
          campo_modificado: 'is_active',
          valor_anterior: JSON.stringify(platoOriginal),
          valor_nuevo: JSON.stringify({ is_active: false, motivo_baja: motivo }),
          metadatos: { motivo }
        }
      ]);

      setMensaje('Plato dado de baja correctamente.');

      // recargar platos (ya no debe aparecer)
      loadPlatosProveedor(selectedProveedor);

    } catch (e) {
      setMensaje('Error inesperado: ' + e.message);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>RF-AE-01-7: Dar de baja platos</Text>

      {/* Seleccionar proveedor */}
      <Text style={styles.label}>Proveedor</Text>
      <Picker
        selectedValue={selectedProveedor}
        onValueChange={loadPlatosProveedor}
        style={styles.input}
      >
        <Picker.Item label="Seleccione un proveedor" value="" />
        {proveedores.map((prov) => (
          <Picker.Item
            key={prov.id}
            label={prov.nombre_emprendimiento}
            value={prov.id}
          />
        ))}
      </Picker>

      {/* Seleccionar plato */}
      <Text style={styles.label}>Plato activo</Text>
      <Picker
        selectedValue={selectedPlatoId}
        onValueChange={setSelectedPlatoId}
        style={styles.input}
      >
        <Picker.Item label="Seleccione un plato" value="" />
        {platos.map((pl) => (
          <Picker.Item key={pl.id} label={pl.nombre} value={pl.id} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Motivo de baja"
        value={motivo}
        onChangeText={setMotivo}
      />

      <TouchableOpacity style={styles.btn} onPress={handleDarBaja} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Procesando...' : 'Dar de baja'}</Text>
      </TouchableOpacity>

      {mensaje ? <Text style={styles.success}>{mensaje}</Text> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1976D2' },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#1976D2' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 10 },
  btn: { backgroundColor: '#D32F2F', borderRadius: 8, padding: 12, alignItems: 'center', marginVertical: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  success: { color: 'green', marginTop: 10, fontWeight: 'bold' },
});

export default AEDarBajaPlatoScreen;
