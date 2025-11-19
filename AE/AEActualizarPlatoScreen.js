import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../Supabase/supabaseClient';

const categorias = [
  { label: 'Desayuno', value: 'desayuno' },
  { label: 'Almuerzo', value: 'almuerzo' },
  { label: 'Cena', value: 'cena' },
  { label: 'Merienda', value: 'merienda' },
];

const AEActualizarPlatoScreen = () => {
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState('');

  const [platos, setPlatos] = useState([]);
  const [selectedPlatoId, setSelectedPlatoId] = useState('');

  // Datos editables del plato
  const [nombre, setNombre] = useState('');
  const [ingredientes, setIngredientes] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipoAlimento, setTipoAlimento] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('');

  const [nutricion, setNutricion] = useState({
    grasas: '',
    proteinas: '',
    calorias: '',
    carbohidratos: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar proveedores activos
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
    setPlatos([]);
    if (!provId) return;

    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('provider_id', provId)
      .eq('is_active', true);

    if (!error) setPlatos(data);
  };

  // Cuando selecciona un plato cargamos sus datos
  const cargarDatosPlato = (platoId) => {
    setSelectedPlatoId(platoId);
    if (!platoId) return;

    const plato = platos.find(p => p.id === platoId);
    if (!plato) return;

    setNombre(plato.nombre);
    setIngredientes(plato.ingredientes);
    setPrecio(String(plato.precio));
    setTipoAlimento(plato.tipo_alimento || '');
    setDisponibilidad(plato.disponibilidad ? 'true' : 'false');

    setNutricion({
      grasas: plato.valor_nutricional?.grasas || '',
      proteinas: plato.valor_nutricional?.proteinas || '',
      calorias: plato.valor_nutricional?.calorias || '',
      carbohidratos: plato.valor_nutricional?.carbohidratos || '',
    });
  };

  const handleActualizar = async () => {
    setMensaje('');
    if (!selectedPlatoId) {
      setMensaje('Debe seleccionar un plato.');
      return;
    }

    setLoading(true);

    try {
      const platoOriginal = platos.find(p => p.id === selectedPlatoId);

      const nuevoValorNutricional = {
        grasas: nutricion.grasas,
        proteinas: nutricion.proteinas,
        calorias: nutricion.calorias,
        carbohidratos: nutricion.carbohidratos
      };

      // Actualizamos el plato
      const { error } = await supabase
        .from('dishes')
        .update({
          nombre,
          ingredientes,
          precio: Number(precio),
          tipo_alimento: tipoAlimento,
          disponibilidad: disponibilidad === 'true',
          valor_nutricional: nuevoValorNutricional,
        })
        .eq('id', selectedPlatoId)
        .eq('provider_id', selectedProveedor);

      if (error) {
        setMensaje('Error al actualizar: ' + error.message);
        setLoading(false);
        return;
      }

      // Guardar registro en audit_log
      await supabase.from('audit_log').insert([
        {
          tabla: 'dishes',
          accion: 'update',
          registro_id: selectedPlatoId,
          usuario_id: selectedProveedor, // proveedor como "autor"
          campo_modificado: 'actualizacion_completa',
          valor_anterior: JSON.stringify(platoOriginal),
          valor_nuevo: JSON.stringify({
            nombre,
            ingredientes,
            precio,
            tipoAlimento,
            disponibilidad,
            nuevoValorNutricional
          }),
        }
      ]);

      setMensaje('Plato actualizado correctamente.');

    } catch (e) {
      setMensaje('Error inesperado: ' + e.message);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>RF-AE-01-6: Actualizar Plato</Text>

      {/* Seleccionar proveedor */}
      <Text style={styles.label}>Proveedor</Text>
      <Picker
        selectedValue={selectedProveedor}
        style={styles.input}
        onValueChange={loadPlatosProveedor}
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
      <Text style={styles.label}>Plato</Text>
      <Picker
        selectedValue={selectedPlatoId}
        style={styles.input}
        onValueChange={cargarDatosPlato}
      >
        <Picker.Item label="Seleccione un plato" value="" />
        {platos.map((pl) => (
          <Picker.Item key={pl.id} label={pl.nombre} value={pl.id} />
        ))}
      </Picker>

      {/* Campos editables */}
      <TextInput style={styles.input} placeholder="Nuevo nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Nuevos ingredientes" value={ingredientes} onChangeText={setIngredientes} />
      <TextInput style={styles.input} placeholder="Nuevo precio" value={precio} onChangeText={setPrecio} keyboardType="numeric" />

      <Text style={styles.label}>Nuevo tipo de alimento</Text>
      <Picker selectedValue={tipoAlimento} style={styles.input} onValueChange={setTipoAlimento}>
        <Picker.Item label="Seleccionar tipo" value="" />
        {categorias.map(cat => (
          <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
        ))}
      </Picker>

      <TextInput style={styles.input} placeholder="Disponibilidad (true/false)" value={disponibilidad} onChangeText={setDisponibilidad} />

      {/* Nutrición */}
      <Text style={styles.label}>Información nutricional:</Text>
      <TextInput style={styles.input} placeholder="Grasas" value={nutricion.grasas} onChangeText={v => setNutricion(n => ({ ...n, grasas: v }))} />
      <TextInput style={styles.input} placeholder="Proteínas" value={nutricion.proteinas} onChangeText={v => setNutricion(n => ({ ...n, proteinas: v }))} />
      <TextInput style={styles.input} placeholder="Calorías" value={nutricion.calorias} onChangeText={v => setNutricion(n => ({ ...n, calorias: v }))} />
      <TextInput style={styles.input} placeholder="Carbohidratos" value={nutricion.carbohidratos} onChangeText={v => setNutricion(n => ({ ...n, carbohidratos: v }))} />

      <TouchableOpacity style={styles.btn} onPress={handleActualizar} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Actualizando...' : 'Actualizar plato'}</Text>
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
  btn: { backgroundColor: '#1976D2', borderRadius: 8, padding: 12, alignItems: 'center', marginVertical: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  success: { color: 'green', marginBottom: 10, fontWeight: 'bold' },
});

export default AEActualizarPlatoScreen;
