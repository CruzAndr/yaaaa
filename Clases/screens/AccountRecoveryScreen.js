import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../Supabase/supabaseClient';

export default function AccountRecoveryScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
  const [metodoAlternativo, setMetodoAlternativo] = useState('');
  const [fechaSolicitud, setFechaSolicitud] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('id, nombre_completo, correo_institucional, correo_personal, contacto_telefono, is_active');
      if (!error && data) setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleRecoveryRequest = async () => {
    if (!selectedUserId || !motivoBloqueo || !metodoAlternativo) {
      Alert.alert('Error', 'Completa todos los campos requeridos.');
      return;
    }
    setLoading(true);
    // Aquí podrías registrar la solicitud en una tabla recovery_requests
    const { error } = await supabase.from('recovery_requests').insert({
      user_id: selectedUserId,
      motivo_bloqueo: motivoBloqueo,
      metodo_alternativo: metodoAlternativo,
      fecha_solicitud: fechaSolicitud,
    });
    if (error) {
      Alert.alert('Error', 'No se pudo registrar la solicitud.');
    } else {
      Alert.alert('Éxito', 'Solicitud de recuperación registrada. Un responsable validará tu identidad.');
      navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperación de Cuenta Bloqueada</Text>
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
      <Text style={styles.label}>Motivo del bloqueo:</Text>
      <TextInput
        style={styles.input}
        value={motivoBloqueo}
        onChangeText={setMotivoBloqueo}
        placeholder="Motivo del bloqueo"
      />
      <Text style={styles.label}>Método alternativo de verificación:</Text>
      <Picker
        selectedValue={metodoAlternativo}
        onValueChange={setMetodoAlternativo}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona método" value="" />
        <Picker.Item label="Correo personal registrado" value="correo_personal" />
        <Picker.Item label="Número de teléfono" value="telefono" />
        <Picker.Item label="Validación manual (documentos/entrevista)" value="manual" />
      </Picker>
      <Text style={styles.label}>Fecha de solicitud:</Text>
      <TextInput
        style={styles.input}
        value={fechaSolicitud}
        onChangeText={setFechaSolicitud}
        placeholder="YYYY-MM-DD"
      />
      <TouchableOpacity style={styles.btnPrimary} onPress={handleRecoveryRequest} disabled={loading}>
        <Text style={styles.btnPrimaryText}>{loading ? 'Procesando...' : 'Solicitar recuperación'}</Text>
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
