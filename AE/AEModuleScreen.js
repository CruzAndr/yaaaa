import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../Supabase/supabaseClient';
import { Picker } from '@react-native-picker/picker';

const AEModuleScreen = () => {

  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState('');

  const [fechaDistribucion, setFechaDistribucion] = useState('');
  const [horarioServicio, setHorarioServicio] = useState('');
  const [registroCalidad, setRegistroCalidad] = useState('');
  const [datosAcuerdo, setDatosAcuerdo] = useState('');
  const [precioPreferencial, setPrecioPreferencial] = useState('');
  const [permisoValido, setPermisoValido] = useState(false);

  // Cargar proveedores aprobados
  useEffect(() => {
    const fetchProviders = async () => {
      let { data, error } = await supabase
        .from('providers')
        .select('id, nombre_emprendimiento, telefono, permiso_salud, permiso_municipal, categoria_id, estado')
        .eq('estado', 'aprobado');

      if (!error) setProviders(data);
    };
    fetchProviders();
  }, []);

  const validarPermisos = async () => {
    if (!providerId) {
      alert("Selecciona un proveedor");
      return;
    }

    const provider = providers.find(p => p.id === providerId);

    if (!provider) return;

    if (provider.permiso_salud && provider.permiso_municipal) {
      setPermisoValido(true);
    } else {
      setPermisoValido(false);
      alert("El proveedor NO tiene permisos válidos.");
    }
  };

  const handleGuardarAcuerdo = async () => {
    if (!providerId) {
      alert("Selecciona un proveedor");
      return;
    }

    const acuerdoData = {
      provider_id: providerId,
      detalles: {
        fecha_distribucion: fechaDistribucion,
        horario_servicio: horarioServicio,
        registro_calidad: registroCalidad,
        observaciones: datosAcuerdo
      },
      fecha_inicio: new Date().toISOString().slice(0,10),
      fecha_fin: null,
      prioridad_para_comunidad: precioPreferencial === 'si'
    };

    const { error } = await supabase
      .from('provider_agreements')
      .insert([acuerdoData]);

    if (error) {
      alert("Error al guardar el acuerdo: " + error.message);
    } else {
      alert("Acuerdo guardado correctamente");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>RF-AE-01-1 — Acuerdos con proveedores</Text>

      {/* Selector de proveedor */}
      <Text style={styles.label}>Proveedor</Text>
      <Picker
        selectedValue={providerId}
        onValueChange={setProviderId}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione un proveedor" value="" />
        {providers.map((prov) => (
          <Picker.Item key={prov.id} label={prov.nombre_emprendimiento} value={prov.id} />
        ))}
      </Picker>

      <TextInput style={styles.input} placeholder="Fechas de distribución" value={fechaDistribucion} onChangeText={setFechaDistribucion} />
      <TextInput style={styles.input} placeholder="Horarios de servicio" value={horarioServicio} onChangeText={setHorarioServicio} />
      <TextInput style={styles.input} placeholder="Registro de calidad" value={registroCalidad} onChangeText={setRegistroCalidad} />
      <TextInput style={styles.input} placeholder="Datos del acuerdo" value={datosAcuerdo} onChangeText={setDatosAcuerdo} />
      
      <Text style={styles.label}>Precio preferencial para UCR</Text>
      <Picker
        selectedValue={precioPreferencial}
        onValueChange={setPrecioPreferencial}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione una opción" value="" />
        <Picker.Item label="Sí" value="si" />
        <Picker.Item label="No" value="no" />
      </Picker>

      <TouchableOpacity style={styles.btn} onPress={validarPermisos}>
        <Text style={styles.btnText}>Validar permisos</Text>
      </TouchableOpacity>

      {permisoValido && <Text style={styles.success}>Permisos vigentes validados</Text>}

      <TouchableOpacity style={styles.btn} onPress={handleGuardarAcuerdo}>
        <Text style={styles.btnText}>Guardar acuerdo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: { backgroundColor: '#eee', padding: 10, marginTop: 10, borderRadius: 8 },
  picker: { backgroundColor: '#eee', marginTop: 10, borderRadius: 8 },
  btn: { backgroundColor: '#1976D2', padding: 12, borderRadius: 8, marginTop: 20 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  success: { color: 'green', marginTop: 10, fontWeight: 'bold' }
});

export default AEModuleScreen;
