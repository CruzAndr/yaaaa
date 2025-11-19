import React, { useState, useContext } from 'react';
import { CartContext } from '../../contexts/CartContext';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProductDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  const {
    nombre,
    precio,
    imagen,
    descripcion,
    proveedor,
    valor_nutricional
  } = route.params || {};

  // Procesar nutricional
  let nutricionalText = '';
  if (valor_nutricional) {
    try {
      const obj =
        typeof valor_nutricional === 'string'
          ? JSON.parse(valor_nutricional)
          : valor_nutricional;

      nutricionalText = Object.entries(obj)
        .map(
          ([key, value]) =>
            `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
        )
        .join('\n');
    } catch {
      nutricionalText = '';
    }
  }

  const handleBuy = () => {
    addToCart({
      id: route.params?.id,
      nombre,
      precio,
      imagen,
      proveedor,
      descripcion,
      quantity
    });
    navigation.navigate('CartScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Volver</Text>
        </TouchableOpacity>
      </View>

      {/* CARD PRINCIPAL */}
      <View style={styles.card}>

        {/* Imagen arriba del nombre */}
        <View style={styles.imageWrapperCard}>
          <Image
            source={imagen ? { uri: imagen } : require('../../../assets/favicon.png')}
            style={styles.image}
          />
        </View>

        {/* Primera fila */}
        <View style={styles.row}>
          <Text style={styles.productName}>{nombre}</Text>

          <View style={styles.qtySelector}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyNumber}>{quantity}</Text>

            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>₡ {precio?.toLocaleString()}</Text>
        </View>

        {/* Proveedor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proveedor:</Text>
          <Text style={styles.sectionText}>
            {proveedor || "No disponible"}
          </Text>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción:</Text>
          <Text style={styles.sectionText}>{descripcion}</Text>
        </View>

        {/* Info Nutricional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información nutricional:</Text>
          {nutricionalText
            ? nutricionalText.split("\n").map((line, idx) => (
                <Text key={idx} style={styles.sectionText}>{line}</Text>
              ))
            : <Text style={styles.sectionText}>No disponible</Text>}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.heartBtn}>
            <Text style={styles.heartIcon}>♡</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
            <Text style={styles.buyText}>Comprar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3A8DFF',
  },

  headerContainer: {
    padding: 16,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* Imagen flotante */
  imageWrapperCard: {
    alignItems: 'center',
    marginBottom: 18,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },

  /* Card principal */
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 0,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    minHeight: 400,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },

  qtySelector: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    fontSize: 18,
    color: '#3A8DFF',
  },
  qtyNumber: {
    fontSize: 16,
    paddingHorizontal: 6,
    color: '#222',
  },

  price: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#3A8DFF',
  },

  /* Secciones */
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#3A8DFF',
    fontSize: 15,
    marginBottom: 4,
  },
  sectionText: {
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    alignItems: 'center',
  },
  heartBtn: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  heartIcon: {
    fontSize: 22,
    color: '#3A8DFF',
  },
  buyBtn: {
    backgroundColor: '#3A8DFF',
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 25,
  },
  buyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
