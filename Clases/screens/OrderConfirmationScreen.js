import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../Supabase/supabaseClient';

export default function OrderConfirmationScreen({ navigation, route }) {
  const { cart, direccion } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('id, correo_institucional');
      if (!error && data) setUsers(data);
    };
    const fetchProviders = async () => {
      const { data, error } = await supabase.from('providers').select('id, nombre_emprendimiento');
      if (!error && data) setProviders(data);
    };
    fetchUsers();
    fetchProviders();
  }, []);

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);

      // Usar el usuario seleccionado
      const userId = selectedUserId;
      if (!userId) throw new Error('Debes seleccionar un usuario');

      // Calcular provider_id y total
      if (!cart || cart.length === 0) throw new Error('El carrito está vacío');
      let providerId = cart[0]?.provider_id || selectedProviderId;
      if (!providerId) throw new Error('Debes seleccionar un proveedor');
      const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

      // 1. Crear orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: userId,
            provider_id: providerId,
            total,
            estado: 'pendiente',
            punto_entrega: direccion,
            creado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString(),
            // Puedes agregar metodo_pago, franja_horaria si lo necesitas
          },
        ])
        .select()
        .single();

      if (orderError || !order) throw orderError;

      // 2. Insertar productos de la orden
      for (const item of cart) {
        // 2.1 Validar proveedor inventario
        const { data: inv, error: invError } = await supabase
          .from('dish_inventory')
          .select('cantidad, provider_id')
          .eq('dish_id', item.id)
          .maybeSingle();

        if (invError) throw invError;

        if (!inv) {
          throw new Error(`No existe inventario para el platillo: ${item.nombre}`);
        }
        if (inv.cantidad < item.quantity) {
          throw new Error(`No hay suficiente inventario para el platillo: ${item.nombre}`);
        }

        // 2.2 Insertar item
        await supabase.from('order_items').insert([
          {
            order_id: order.id,
            dish_id: item.id,
            cantidad: item.quantity,
            precio_unitario: item.precio,
            subtotal: item.precio * item.quantity,
          },
        ]);

        // 2.3 Actualizar inventario
        await supabase
          .from('dish_inventory')
          .update({
            cantidad: inv.cantidad - item.quantity,
          })
          .eq('dish_id', item.id);
      }

      // 3. Insertar en cola de delivery
      await supabase.from('delivery_queue').insert([
        {
          order_id: order.id,
          estado: 'pendiente',
          fecha_registro: new Date().toISOString(),
        },
      ]);

      // 4. Guardar evento
      await supabase.from('pedido_eventos').insert([
        {
          order_id: order.id,
          descripcion: 'Pedido creado y pendiente de asignación de ruta.',
          fecha: new Date().toISOString(),
        },
      ]);

      Alert.alert('Pedido registrado', 'Tu pedido ha sido registrado exitosamente.');
      navigation.replace('TwoFactorAuth', {
        orderId: order.id,
        userId: selectedUserId,
        providerId: providerId,
        total,
        direccion,
      });

    } catch (err) {
      console.log(err);
      Alert.alert('Error', err.message || 'No se pudo registrar el pedido.');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar pedido</Text>

      {/* Picker de usuario */}
      <Text style={styles.subtitle}>Selecciona el usuario:</Text>
      <View style={{ marginBottom: 16, backgroundColor: '#f3f3f3', borderRadius: 8 }}>
        <Picker
          selectedValue={selectedUserId}
          onValueChange={setSelectedUserId}
          style={{ height: 50 }}
        >
          <Picker.Item label="Selecciona un usuario" value="" />
          {users.map(u => (
            <Picker.Item key={u.id} label={u.correo_institucional} value={u.id} />
          ))}
        </Picker>
      </View>

      {/* Picker de proveedor */}
      <Text style={styles.subtitle}>Selecciona el proveedor:</Text>
      <View style={{ marginBottom: 16, backgroundColor: '#f3f3f3', borderRadius: 8 }}>
        <Picker
          selectedValue={selectedProviderId}
          onValueChange={setSelectedProviderId}
          style={{ height: 50 }}
        >
          <Picker.Item label="Selecciona un proveedor" value="" />
          {providers.map(p => (
            <Picker.Item key={p.id} label={p.nombre_emprendimiento} value={p.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.subtitle}>Dirección: {direccion}</Text>
      <Text style={styles.subtitle}>Productos:</Text>

      {cart?.length > 0 ? (
        cart.map((item) => (
          <Text key={item.id} style={styles.productText}>
            {item.nombre} × {item.quantity} - ₡{item.precio}
          </Text>
        ))
      ) : (
        <Text style={styles.productText}>No hay productos.</Text>
      )}

      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleConfirmOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmText}>Confirmar pedido y pagar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 18,
    color: '#276EF1',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  productText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
    textAlign: 'center',
  },
  confirmBtn: {
    backgroundColor: '#276EF1',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

