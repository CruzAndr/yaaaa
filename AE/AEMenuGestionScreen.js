import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../Supabase/supabaseClient';

const menuTypes = [
  { label: 'Desayuno', value: 'desayuno' },
  { label: 'Almuerzo', value: 'almuerzo' },
  { label: 'Cena', value: 'cena' },
  { label: 'Merienda', value: 'merienda' },
];

const AEMenuGestionScreen = () => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [vigenciaInicio, setVigenciaInicio] = useState('');
  const [vigenciaFin, setVigenciaFin] = useState('');

  const [platos, setPlatos] = useState([]);
  const [platosMenu, setPlatosMenu] = useState([]);

  const [selectedPlato, setSelectedPlato] = useState('');
  const [cantidadPlato, setCantidadPlato] = useState('');
  const [diaPlato, setDiaPlato] = useState('');
  const [horaPlato, setHoraPlato] = useState('');
  const [tipoAlimentoPlato, setTipoAlimentoPlato] = useState('');

  const [saving, setSaving] = useState(false);

  // ============================================================
  // Cargar proveedores aprobados
  // ============================================================
  useEffect(() => {
    const fetchProviders = async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('id, nombre_emprendimiento')
        .eq('estado', 'aprobado');

      if (!error && data) setProviders(data);
    };
    fetchProviders();
  }, []);

  // ============================================================
  // Cargar platos según proveedor
  // ============================================================
  useEffect(() => {
    if (!selectedProvider) {
      setPlatos([]);
      return;
    }

    const fetchPlatos = async () => {
      const { data, error } = await supabase
        .from('dishes')
        .select('id, nombre')
        .eq('provider_id', selectedProvider)
        .eq('is_active', true);

      if (!error && data) setPlatos(data);
    };
    fetchPlatos();
  }, [selectedProvider]);

  // ============================================================
  // Agregar plato al menú temporal
  // ============================================================
  const handleAgregarPlato = () => {
    if (!selectedPlato || !cantidadPlato || !diaPlato || !horaPlato || !tipoAlimentoPlato) {
      alert("Rellena todos los campos del plato.");
      return;
    }

    setPlatosMenu([
      ...platosMenu,
      {
        dish_id: selectedPlato,
        cantidad_disponible: cantidadPlato,
        dia: diaPlato,
        hora: horaPlato,
        tipo_alimento: tipoAlimentoPlato,
      }
    ]);

    // Reset
    setSelectedPlato('');
    setCantidadPlato('');
    setDiaPlato('');
    setHoraPlato('');
    setTipoAlimentoPlato('');
  };

  // ============================================================
  // Guardar menú + platos
  // ============================================================
  const handleGuardarMenu = async () => {
    setSaving(true);

    try {
      // VALIDAR
      if (!selectedProvider) throw new Error("Selecciona un proveedor.");
      if (!titulo || !descripcion || !vigenciaInicio || !vigenciaFin)
        throw new Error("Completa todos los datos del menú.");
      if (platosMenu.length === 0)
        throw new Error("Debes agregar al menos un plato.");

      // 1. CREAR EL MENÚ
      const { data: menuData, error: menuError } = await supabase
        .from("menus")
        .insert([
          {
            titulo,
            descripcion,
            fecha_inicio: vigenciaInicio,
            fecha_fin: vigenciaFin,
            creado_por: selectedProvider, // PROVEEDOR COMO CREADOR
          }
        ])
        .select();

      if (menuError) throw menuError;
      const menuId = menuData?.[0]?.id;

      if (!menuId) throw new Error("No se pudo obtener el ID del menú creado.");

      // 2. INSERTAR CADA PLATO
      for (const item of platosMenu) {
        const { error: itemError } = await supabase
          .from("menu_items")
          .insert([
            {
              menu_id: menuId,
              dish_id: Number(item.dish_id),
              cantidad_disponible: Number(item.cantidad_disponible),
              dia: item.dia,
              hora: item.hora + ":00",
              tipo_alimento: item.tipo_alimento,
            }
          ]);

        if (itemError) throw itemError;
      }

      alert("Menú creado correctamente con sus platos.");

      // Reset
      setTitulo('');
      setDescripcion('');
      setVigenciaInicio('');
      setVigenciaFin('');
      setPlatosMenu([]);

    } catch (e) {
      alert("Error al guardar el menú: " + e.message);
    }

    setSaving(false);
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>RF-AE-01-2: Gestión de menús saludables</Text>

      {/* PROVEEDOR */}
      <Text style={styles.label}>Proveedor</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={selectedProvider}
          style={styles.input}
          onValueChange={setSelectedProvider}
        >
          <Picker.Item label="Selecciona un proveedor" value="" />
          {providers.map((p) => (
            <Picker.Item key={p.id} label={p.nombre_emprendimiento} value={p.id} />
          ))}
        </Picker>
      </View>

      {/* DATOS DEL MENÚ */}
      <TextInput style={styles.input} placeholder="Título del menú" value={titulo} onChangeText={setTitulo} />
      <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} />

      <Text style={styles.label}>Vigencia del menú:</Text>
      <TextInput style={styles.input} placeholder="Inicio (YYYY-MM-DD)" value={vigenciaInicio} onChangeText={setVigenciaInicio} />
      <TextInput style={styles.input} placeholder="Fin (YYYY-MM-DD)" value={vigenciaFin} onChangeText={setVigenciaFin} />

      <Text style={styles.label}>Agregar platos:</Text>

      {/* SELECTOR DE PLATOS */}
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={selectedPlato}
          style={styles.input}
          onValueChange={setSelectedPlato}
        >
          <Picker.Item label="Selecciona un plato" value="" />
          {platos.map((plato) => (
            <Picker.Item key={plato.id} label={plato.nombre} value={plato.id} />
          ))}
        </Picker>
      </View>

      <TextInput style={styles.input} placeholder="Cantidad disponible" value={cantidadPlato} onChangeText={setCantidadPlato} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Día (YYYY-MM-DD)" value={diaPlato} onChangeText={setDiaPlato} />
      <TextInput style={styles.input} placeholder="Hora (HH:MM)" value={horaPlato} onChangeText={setHoraPlato} />

      <View style={styles.pickerBox}>
        <Picker
          selectedValue={tipoAlimentoPlato}
          style={styles.input}
          onValueChange={setTipoAlimentoPlato}
        >
          <Picker.Item label="Tipo de alimento" value="" />
          {menuTypes.map((type) => (
            <Picker.Item key={type.value} label={type.label} value={type.value} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleAgregarPlato}>
        <Text style={styles.btnText}>Agregar plato</Text>
      </TouchableOpacity>

      {/* LISTA DE PLATOS */}
      {platosMenu.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.label}>Platos en el menú:</Text>
          <FlatList
            data={platosMenu}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => (
              <View style={styles.itemBox}>
                <Text>Plato ID: {item.dish_id}</Text>
                <Text>Cantidad: {item.cantidad_disponible}</Text>
                <Text>Día: {item.dia}</Text>
                <Text>Hora: {item.hora}</Text>
                <Text>Tipo: {item.tipo_alimento}</Text>
              </View>
            )}
          />
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleGuardarMenu} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Guardar menú'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1976D2' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 10 },
  btn: { backgroundColor: '#1976D2', borderRadius: 8, padding: 12, alignItems: 'center', marginVertical: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#1976D2' },
  pickerBox: { marginBottom: 10 },
  itemBox: { backgroundColor: '#eee', padding: 10, borderRadius: 10, marginBottom: 8 },
});

export default AEMenuGestionScreen;

