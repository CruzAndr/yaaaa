import React, { useState, useEffect } from 'react';
import { supabase } from '../Supabase/supabaseClient';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ProviderRegisterScreen = ({ navigation }) => {
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    telefono: '',
    permisos_sanitarios: '',
    categoria_id: '',
    direccion: '', // ESTE ES EL CORREO
    hashed_password: '',
    permiso_municipal: '',
    permiso_salud: '',
    nombre_emprendimiento: ''
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from('provider_categories')
        .select('id, name');

      if (!error) setCategorias(data);
      else console.log('Error cargando categorías:', error);
    };

    fetchCategorias();
  }, []);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    let permisosSanitariosParsed = [];
    try {
      permisosSanitariosParsed = JSON.parse(form.permisos_sanitarios);
    } catch (e) {
      permisosSanitariosParsed = [];
    }

    // Hashear la contraseña antes de guardar
    let hashedPassword = form.hashed_password;
    try {
      const Crypto = await import('expo-crypto');
      hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        form.hashed_password
      );
    } catch (e) {
      // Si no se puede importar, guarda la contraseña tal cual (no recomendado)
    }

    const { error } = await supabase.from('providers').insert([
      {
        telefono: form.telefono,
        permisos_sanitarios: permisosSanitariosParsed,
        categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null,
        direccion: form.direccion,
        hashed_password: hashedPassword,
        permiso_municipal: form.permiso_municipal,
        permiso_salud: form.permiso_salud,
        nombre_emprendimiento: form.nombre_emprendimiento,
        estado: 'pendiente',
        is_verified: false
      }
    ]);

    if (error) {
      alert('Error al registrar proveedor: ' + error.message);
    } else {
      alert('Proveedor registrado exitosamente, una vez aprobado podrá iniciar sesión.');
      setForm({
        telefono: '',
        permisos_sanitarios: '',
        categoria_id: '',
        direccion: '',
        hashed_password: '',
        permiso_municipal: '',
        permiso_salud: '',
        nombre_emprendimiento: ''
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro de Proveedor</Text>

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={form.telefono}
        onChangeText={v => handleChange('telefono', v)}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Permisos Sanitarios (JSON)"
        value={form.permisos_sanitarios}
        onChangeText={v => handleChange('permisos_sanitarios', v)}
      />

      <Text style={styles.label}>Categoría del proveedor</Text>
      <Picker
        selectedValue={form.categoria_id}
        style={styles.picker}
        onValueChange={v => handleChange('categoria_id', v)}
      >
        <Picker.Item label="Seleccionar categoría" value="" />
        {categorias.map(cat => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      {/* DIRECCION = CORREO */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={form.direccion}
        onChangeText={v => handleChange('direccion', v)}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={form.hashed_password}
        onChangeText={v => handleChange('hashed_password', v)}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Permiso municipal"
        value={form.permiso_municipal}
        onChangeText={v => handleChange('permiso_municipal', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Permiso de salud"
        value={form.permiso_salud}
        onChangeText={v => handleChange('permiso_salud', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre del emprendimiento"
        value={form.nombre_emprendimiento}
        onChangeText={v => handleChange('nombre_emprendimiento', v)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1976D2' },
  label: { marginBottom: 6, fontSize: 14, color: '#333' },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default ProviderRegisterScreen;
