import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../Supabase/supabaseClient';

const estados = [
  { label: 'Todos', value: '' },
  { label: 'Aprobado', value: 'aprobado' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Rechazado', value: 'rechazado' }
];

export default function ProveedorGestionScreen() {
  const [proveedores, setProveedores] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarProveedores = async () => {
    setLoading(true);
    let query = supabase.from('providers').select('id, direccion, nombre_emprendimiento, estado');
    if (filtroEstado) query = query.eq('estado', filtroEstado);
    const { data, error } = await query;
    if (!error) setProveedores(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarProveedores();
  }, [filtroEstado]);

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoading(true);
    await supabase.from('providers').update({ estado: nuevoEstado }).eq('id', id);
    cargarProveedores();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Proveedores</Text>
      <View style={styles.filterRow}>
        <Text style={styles.label}>Filtrar por estado:</Text>
        <Picker
          selectedValue={filtroEstado}
          style={styles.picker}
          onValueChange={setFiltroEstado}
        >
          {estados.map(e => (
            <Picker.Item key={e.value} label={e.label} value={e.value} />
          ))}
        </Picker>
      </View>
      <FlatList
        data={proveedores}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={cargarProveedores}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.info}><Text style={styles.bold}>Correo:</Text> {item.direccion}</Text>
            <Text style={styles.info}><Text style={styles.bold}>Emprendimiento:</Text> {item.nombre_emprendimiento}</Text>
            <Text style={styles.info}><Text style={styles.bold}>Estado:</Text> {item.estado}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.btn, styles.aprobado]} onPress={() => cambiarEstado(item.id, 'aprobado')}>
                <Text style={styles.btnText}>Aprobar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.pendiente]} onPress={() => cambiarEstado(item.id, 'pendiente')}>
                <Text style={styles.btnText}>Pendiente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.rechazado]} onPress={() => cambiarEstado(item.id, 'rechazado')}>
                <Text style={styles.btnText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay proveedores para mostrar.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1976D2', textAlign: 'center' },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 16, marginRight: 8 },
  picker: { flex: 1, height: 40 },
  card: { backgroundColor: '#f4f6f8', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 1 },
  info: { fontSize: 15, marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  btn: { flex: 1, marginHorizontal: 4, padding: 10, borderRadius: 6, alignItems: 'center' },
  aprobado: { backgroundColor: '#43cea2' },
  pendiente: { backgroundColor: '#ffd600' },
  rechazado: { backgroundColor: '#ff5252' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 }
});
