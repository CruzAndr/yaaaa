import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../Supabase/supabaseClient';

export default function OrderConfirmationScreen({ navigation, route }) {
  const { cart, direccion } = route.params || {};
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);

      // 0. Obtener usuario
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('Usuario no autenticado');

      // 1. Crear orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: userId,
            delivery_address: direccion,
            status: 'pendiente',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (orderError || !order) throw orderError;

      // 2. Insertar productos de la orden
      for (const item of cart) {
        // 2.1 Validar proveedor inventario
        const { data: inv, error: invError } = await supabase
          .from('provider_inventory')
          .select('cantidad_disponible, provider_id')
          .eq('dish_id', item.id)
          .single();

        if (invError) throw invError;

        if (!inv || inv.cantidad_disponible < item.quantity) {
          throw new Error(
            `No hay suficiente inventario para el platillo: ${item.nombre}`
          );
        }

        // 2.2 Insertar item
        await supabase.from('order_items').insert([
          {
            order_id: order.id,
            dish_id: item.id,
            cantidad: item.quantity,
            precio_unitario: item.precio,
          },
        ]);

        // 2.3 Actualizar inventario
        await supabase
          .from('provider_inventory')
          .update({
            cantidad_disponible: inv.cantidad_disponible - item.quantity,
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
      navigation.replace('SuccessScreen');

    } catch (err) {
      console.log(err);
      Alert.alert('Error', err.message || 'No se pudo registrar el pedido.');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar pedido</Text>

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
          <Text style={styles.confirmText}>Confirmar pedido</Text>
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

