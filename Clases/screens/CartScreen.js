import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { CartContext } from '../contexts/CartContext';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  const handlePay = () => {
    // Primero seleccionar dirección
    navigation.navigate('SelectAddressScreen', { cart });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito de compras</Text>
      {cart.length === 0 ? (
        <Text style={styles.empty}>No hay productos en el carrito.</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>₡ {item.precio}</Text>
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Text style={styles.removeBtn}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
          <Text style={styles.payText}>Pagar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 18,
    color: '#5f4bb6',
  },
  empty: {
    color: '#888',
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  itemName: {
    flex: 2,
    fontSize: 16,
    color: '#222',
  },
  itemQty: {
    flex: 1,
    fontSize: 15,
    color: '#5f4bb6',
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 15,
    color: '#43cea2',
    textAlign: 'right',
  },
  removeBtn: {
    color: '#ff5252',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  payBtn: {
    backgroundColor: '#5f4bb6',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  payText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
