import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../Supabase/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categorias = [
  { label: 'Desayuno', value: 'desayuno' },
  { label: 'Almuerzo', value: 'almuerzo' },
  { label: 'Cena', value: 'cena' },
  { label: 'Merienda', value: 'merienda' },
];

const AEBusquedaPlatoScreen = () => {
  const [nombrePlato, setNombrePlato] = useState('');
  const [categoria, setCategoria] = useState('');
  const [resultados, setResultados] = useState([]);

  const handleBuscarPlato = async () => {
    try {
      let query = supabase
        .from('dishes')
        .select('id, nombre, tipo_alimento, precio, image_url, ingredientes')
        .order('nombre', { ascending: true });

      // Buscar por coincidencia parcial en nombre
      if (nombrePlato.trim() !== '') {
        query = query.ilike('nombre', `%${nombrePlato.trim()}%`);
      }

      // Filtrar por categoría
      if (categoria !== '') {
        query = query.eq('tipo_alimento', categoria);
      }

      // Filtrar por proveedor actual
      const providerId = await AsyncStorage.getItem('providerId');
      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      const { data, error } = await query;

      if (error) {
        alert('Error al buscar platos: ' + error.message);
        return;
      }

      setResultados(data);
    } catch (e) {
      alert('Error inesperado: ' + e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>RF-AE-01-5: Búsqueda de platos registrados</Text>

      {/* Campo buscar por nombre */}
      <TextInput
        style={styles.input}
        placeholder="Nombre del plato"
        value={nombrePlato}
        onChangeText={setNombrePlato}
      />

      {/* Categoría */}
      <View style={styles.pickerBox}>
        <Text style={styles.label}>Categoría del alimento:</Text>
        <Picker
          selectedValue={categoria}
          style={styles.input}
          onValueChange={setCategoria}
        >
          <Picker.Item label="Todas" value="" />
          {categorias.map((cat) => (
            <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
          ))}
        </Picker>
      </View>

      {/* Botón buscar */}
      <TouchableOpacity style={styles.btn} onPress={handleBuscarPlato}>
        <Text style={styles.btnText}>Buscar</Text>
      </TouchableOpacity>

      {/* Resultados */}
      {resultados.length > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.label}>Resultados:</Text>

          {resultados.map((plato) => (
            <View key={plato.id} style={styles.resultItem}>
              {plato.image_url ? (
                <Image
                  source={{ uri: plato.image_url }}
                  style={styles.image}
                />
              ) : null}

              <Text style={styles.resultText}>🍽 Nombre: {plato.nombre}</Text>
              <Text style={styles.resultText}>📌 Categoría: {plato.tipo_alimento}</Text>
              <Text style={styles.resultText}>💵 Precio: ₡{plato.precio}</Text>
              <Text style={styles.resultText}>🧂 Ingredientes: {plato.ingredientes}</Text>
            </View>
          ))}
        </View>
      )}

      {resultados.length === 0 && (
        <Text style={{ marginTop: 20, color: '#777' }}>
          No se han buscado platos o no hay coincidencias.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1976D2' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 10 },
  pickerBox: { marginBottom: 12 },
  btn: { backgroundColor: '#1976D2', borderRadius: 8, padding: 12, alignItems: 'center', marginVertical: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultBox: { marginTop: 20 },
  resultItem: { backgroundColor: '#eef6ff', borderRadius: 8, padding: 12, marginBottom: 12 },
  resultText: { fontSize: 15, marginBottom: 3 },
  label: { fontWeight: 'bold', marginBottom: 6, color: '#1976D2' },
  image: { width: '100%', height: 150, borderRadius: 8, marginBottom: 10 },
});

export default AEBusquedaPlatoScreen;
