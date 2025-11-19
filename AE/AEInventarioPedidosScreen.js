import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../Supabase/supabaseClient';

const AEInventarioPedidosScreen = () => {
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState('');

  const [platos, setPlatos] = useState([]);
  const [selectedPlato, setSelectedPlato] = useState('');

  const [inventario, setInventario] = useState(0);
  const [stockChange, setStockChange] = useState('');

  const [pedidos, setPedidos] = useState([]);

  const [mensaje, setMensaje] = useState('');

  // ----------------------------
  // Cargar proveedores
  // ----------------------------
  useEffect(() => {
    const loadProveedores = async () => {
      const { data } = await supabase
        .from('providers')
        .select('id, nombre_emprendimiento')
        .eq('estado', 'aprobado');

      setProveedores(data || []);
    };
    loadProveedores();
  }, []);

  // ----------------------------
  // Cargar platos del proveedor
  // ----------------------------
  const loadPlatos = async (provId) => {
    setSelectedProveedor(provId);
    setSelectedPlato('');
    setInventario(0);
    setPedidos([]);

    if (!provId) return;

    const { data } = await supabase
      .from('dishes')
      .select('id, nombre')
      .eq('provider_id', provId);

    setPlatos(data || []);
  };

  // ----------------------------
  // Cargar inventario + pedidos
  // ----------------------------
  const loadInventarioDatos = async (platoId) => {
    setSelectedPlato(platoId);
    setInventario(0);
    setPedidos([]);

    if (!platoId) return;

    // Obtener inventario
    const { data: inv } = await supabase
      .from('dish_inventory')
      .select('cantidad')
      .eq('dish_id', platoId)
      .eq('provider_id', selectedProveedor)
      .maybeSingle();

    setInventario(inv?.cantidad || 0);

    // Obtener pedidos vinculados
    const { data: pedidosRaw } = await supabase
      .from('order_items')
      .select(`
        cantidad,
        order_id,
        orders (
          franja_horaria,
          punto_entrega
        )
      `)
      .eq('dish_id', platoId);

    setPedidos(pedidosRaw || []);
  };

  // ----------------------------
  // Actualizar stock
  // ----------------------------
  const handleActualizarStock = async () => {
    setMensaje('');

    if (!selectedPlato || !selectedProveedor) {
      setMensaje('Seleccione plato y proveedor.');
      return;
    }

    const cambio = Number(stockChange);
    if (isNaN(cambio) || cambio === 0) {
      setMensaje('Ingrese un número válido.');
      return;
    }

    const nuevoInventario = inventario + cambio;
    if (nuevoInventario < 0) {
      setMensaje('No puede dejar inventario negativo.');
      return;
    }

    // Guardar inventario actualizado
    const { error } = await supabase
      .from('dish_inventory')
      .upsert({
        dish_id: selectedPlato,
        provider_id: selectedProveedor,
        cantidad: nuevoInventario
      });

    if (error) {
      setMensaje('Error al actualizar inventario: ' + error.message);
      return;
    }

    // Registrar en log
    await supabase.from('dish_inventory_log').insert([
      {
        dish_id: selectedPlato,
        provider_id: selectedProveedor,
        cantidad_prev: inventario,
        cantidad_nueva: nuevoInventario,
        motivo: cambio > 0 ? 'Aumento inventario' : 'Salida inventario'
      }
    ]);

    // Si se quedó sin inventario → desactivar el plato
    if (nuevoInventario === 0) {
      await supabase
        .from('dishes')
        .update({ disponibilidad: false })
        .eq('id', selectedPlato);
    } else {
      await supabase
        .from('dishes')
        .update({ disponibilidad: true })
        .eq('id', selectedPlato);
    }

    setInventario(nuevoInventario);
    setStockChange('');
    setMensaje('Inventario actualizado correctamente.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>RF-AE-01-8: Inventario y pedidos</Text>

      {/* Seleccionar proveedor */}
      <Text style={styles.label}>Proveedor</Text>
      <Picker
        selectedValue={selectedProveedor}
        onValueChange={loadPlatos}
        style={styles.input}
      >
        <Picker.Item label="Seleccione un proveedor" value="" />
        {proveedores.map((p) => (
          <Picker.Item key={p.id} label={p.nombre_emprendimiento} value={p.id} />
        ))}
      </Picker>

      {/* Seleccionar plato */}
      <Text style={styles.label}>Plato</Text>
      <Picker
        selectedValue={selectedPlato}
        onValueChange={loadInventarioDatos}
        style={styles.input}
      >
        <Picker.Item label="Seleccione un plato" value="" />
        {platos.map((pl) => (
          <Picker.Item key={pl.id} label={pl.nombre} value={pl.id} />
        ))}
      </Picker>

      {/* Inventario actual */}
      {selectedPlato !== '' && (
        <>
          <Text style={styles.label}>Inventario actual: {inventario}</Text>

          {/* Cambiar inventario */}
          <TextInput
            style={styles.input}
            placeholder="Agregar (+) o retirar (-) cantidad"
            value={stockChange}
            onChangeText={setStockChange}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.btn} onPress={handleActualizarStock}>
            <Text style={styles.btnText}>Actualizar inventario</Text>
          </TouchableOpacity>

          {/* Pedidos vinculados */}
          <Text style={styles.label}>Pedidos vinculados:</Text>
          {pedidos.length === 0 ? (
            <Text>No hay pedidos para este plato.</Text>
          ) : (
            pedidos.map((p, i) => (
              <View key={i} style={styles.orderBox}>
                <Text>Cantidad pedida: {p.cantidad}</Text>
                <Text>Entrega: {p.orders.franja_horaria}</Text>
                <Text>Lugar: {p.orders.punto_entrega}</Text>
              </View>
            ))
          )}
        </>
      )}

      {mensaje ? <Text style={styles.success}>{mensaje}</Text> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1976D2' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 10 },
  label: { fontWeight: 'bold', color: '#1976D2', marginTop: 10 },
  btn: { backgroundColor: '#1976D2', padding: 12, borderRadius: 8, marginVertical: 12 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  success: { color: 'green', marginTop: 10, fontWeight: 'bold' },
  orderBox: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8, marginBottom: 10 }
});

export default AEInventarioPedidosScreen;
