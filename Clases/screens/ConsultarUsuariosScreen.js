import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../../Supabase/supabaseClient';

export default function ConsultarUsuariosScreen() {
  const [criterio, setCriterio] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');

  const buscarUsuarios = async () => {
    setBuscando(true);
    setError('');
    let query = supabase.from('users').select('id, nombre_completo, correo_institucional, rol_id');
    if (criterio) {
      // Buscar solo por un campo a la vez
      if (!isNaN(Number(criterio))) {
        query = query.eq('rol_id', criterio);
      } else if (criterio.includes('@')) {
        query = query.ilike('correo_institucional', `%${criterio}%`);
      } else {
        query = query.ilike('nombre_completo', `%${criterio}%`);
      }
    }
    const { data, error } = await query;
    if (error) {
      setError('Error al buscar usuarios');
      setUsuarios([]);
    } else {
      setUsuarios(data || []);
    }
    setBuscando(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultar Usuarios</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre, email o rol"
        value={criterio}
        onChangeText={setCriterio}
      />
      <TouchableOpacity style={styles.button} onPress={buscarUsuarios} disabled={buscando}>
        <Text style={styles.buttonText}>{buscando ? 'Buscando...' : 'Buscar'}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={usuarios}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{item.nombre_completo}</Text>
            <Text style={styles.userEmail}>{item.correo_institucional}</Text>
            <Text style={styles.userRol}>Rol: {item.rol_id}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No se encontraron usuarios.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 8 },
  userCard: { backgroundColor: '#f2f2f2', padding: 12, borderRadius: 8, marginBottom: 10 },
  userName: { fontWeight: 'bold', fontSize: 16 },
  userEmail: { color: '#555' },
  userRol: { color: '#333', fontStyle: 'italic' },
  empty: { color: '#777', textAlign: 'center', marginTop: 20 },
});
