import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../Supabase/supabaseClient';

export default function RoleChangeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('id, nombre_completo, rol_id');
      if (!error && data) {
        setUsers(data);
        setAdminUsers(data.filter(u => u.rol_id === 3));
      }
    };
    const fetchRoles = async () => {
      const { data, error } = await supabase.from('roles').select('id, name');
      if (!error && data) setRoles(data);
    };
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find(u => u.id === selectedUserId);
      setCurrentRole(user?.rol_id || '');
    }
  }, [selectedUserId, users]);

  const handleRoleChange = async () => {
    if (!selectedUserId || !selectedRoleId || !responsableId) {
      Alert.alert('Error', 'Selecciona usuario, nuevo rol y responsable.');
      return;
    }
    if (motivo.length > 100) {
      Alert.alert('Error', 'El motivo no puede superar 100 caracteres.');
      return;
    }
    setLoading(true);
    // Validación de requisitos para roles superiores (ejemplo: proveedor o admin)
    const selectedRole = roles.find(r => r.id === selectedRoleId);
    if (selectedRole?.name === 'proveedor' || selectedRole?.name === 'administrador') {
      // Aquí podrías agregar validaciones extra, como verificar permisos/documentos
      // Ejemplo: const { data: docs } = await supabase.from('provider_documents').select('...').eq('provider_id', selectedUserId);
    }
    // Registrar el cambio de rol
    const { error } = await supabase.from('user_role_changes').insert({
      user_id: selectedUserId,
      rol_anterior: currentRole,
      rol_nuevo: selectedRoleId,
      motivo,
      autorizado_por: responsableId,
    });
    if (error) {
      Alert.alert('Error', 'No se pudo registrar el cambio de rol.');
    } else {
      Alert.alert('Éxito', 'Cambio de rol registrado correctamente.');
      navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asignar / Modificar / Revocar Rol</Text>
      <Text style={styles.label}>Usuario:</Text>
      <Picker
        selectedValue={selectedUserId}
        onValueChange={setSelectedUserId}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona usuario" value="" />
        {users.map(u => (
          <Picker.Item key={u.id} label={u.nombre_completo} value={u.id} />
        ))}
      </Picker>
      <Text style={styles.label}>Rol actual: {currentRole}</Text>
      <Text style={styles.label}>Nuevo rol:</Text>
      <Picker
        selectedValue={selectedRoleId}
        onValueChange={setSelectedRoleId}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona rol" value="" />
        {roles.map(r => (
          <Picker.Item key={r.id} label={r.name} value={r.id} />
        ))}
      </Picker>
      <Text style={styles.label}>Motivo (opcional, máx 100 caracteres):</Text>
      <TextInput
        style={styles.input}
        value={motivo}
        onChangeText={text => setMotivo(text.slice(0, 100))}
        placeholder="Motivo del cambio"
      />
      <Text style={styles.label}>Responsable que autoriza:</Text>
      <Picker
        selectedValue={responsableId}
        onValueChange={setResponsableId}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona responsable (admin)" value="" />
        {adminUsers.map(u => (
          <Picker.Item key={u.id} label={u.nombre_completo} value={u.id} />
        ))}
      </Picker>
      <TouchableOpacity style={styles.btnPrimary} onPress={handleRoleChange} disabled={loading}>
        <Text style={styles.btnPrimaryText}>{loading ? 'Procesando...' : 'Registrar cambio de rol'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1976D2', textAlign: 'center' },
  label: { fontSize: 16, marginTop: 12 },
  picker: { backgroundColor: '#f3f3f3', borderRadius: 8, marginBottom: 8 },
  input: { backgroundColor: '#f8f8f8', borderRadius: 8, padding: 12, marginBottom: 8 },
  btnPrimary: { backgroundColor: '#1976D2', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 18 },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
