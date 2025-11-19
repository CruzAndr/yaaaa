import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../Supabase/supabaseClient';

export default function AuditLogScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('id, nombre_completo');
      if (!error && data) setUsers(data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      let query = supabase.from('audit_log').select('id, tabla, accion, registro_id, usuario_id, campo_modificado, valor_anterior, valor_nuevo, cuando');
      if (selectedUserId) query = query.eq('registro_id', selectedUserId);
      const { data, error } = await query.order('cuando', { ascending: false });
      if (!error && data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, [selectedUserId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bitácora de Auditoría de Perfiles</Text>
      <Text style={styles.label}>Filtrar por usuario modificado:</Text>
      <Picker
        selectedValue={selectedUserId}
        onValueChange={setSelectedUserId}
        style={styles.picker}
      >
        <Picker.Item label="Todos los usuarios" value="" />
        {users.map(u => (
          <Picker.Item key={u.id} label={u.nombre_completo} value={u.id} />
        ))}
      </Picker>
      <FlatList
        data={logs}
        keyExtractor={item => String(item.id)}
        refreshing={loading}
        onRefresh={() => setSelectedUserId(selectedUserId)}
        ListEmptyComponent={<Text style={styles.empty}>No hay registros de auditoría.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.info}><Text style={styles.bold}>Fecha:</Text> {item.cuando}</Text>
            <Text style={styles.info}><Text style={styles.bold}>Usuario que modificó:</Text> {item.usuario_id}</Text>
            <Text style={styles.info}><Text style={styles.bold}>Perfil modificado:</Text> {item.registro_id}</Text>
            <Text style={styles.info}><Text style={styles.bold}>Campo:</Text> {item.campo_modificado}</Text>
            <Text style={styles.info}><Text style={styles.bold}>Valor anterior:</Text> {item.valor_anterior}</Text>
            <Text style={styles.info}><Text style={styles.bold}>Valor nuevo:</Text> {item.valor_nuevo}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1976D2', textAlign: 'center' },
  label: { fontSize: 16, marginTop: 12 },
  picker: { backgroundColor: '#f3f3f3', borderRadius: 8, marginBottom: 8 },
  card: { backgroundColor: '#f4f6f8', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 1 },
  info: { fontSize: 15, marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 }
});
