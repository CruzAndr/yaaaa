import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const tiendas = [
  {
    nombre: 'Rosa’s postres.',
    tipo: 'Tienda de repostería.',
    imagen: require('../../assets/avatar1.png'),
  },
  {
    nombre: 'Café oro.',
    tipo: 'Tienda de comida.',
    imagen: require('../../assets/avatar2.png'),
  },
  {
    nombre: 'Cafecat.',
    tipo: 'Tienda de cafetería.',
    imagen: require('../../assets/avatar3.png'),
  },
  {
    nombre: 'Mía repostería.',
    tipo: 'Tienda de repostería.',
    imagen: require('../../assets/avatar4.png'),
  },
];

export default function TiendasScreen({ navigation }) {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Por tienda (24)</Text>
      </View>
      <View style={styles.cardsContainer}>
        <ScrollView contentContainerStyle={styles.gridWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {tiendas.map((item, idx) => (
              <View key={idx} style={styles.card}>
                <Image source={item.imagen} style={styles.cardImage} />
                <TouchableOpacity style={styles.favIcon}>
                  <Text style={styles.favText}>♡</Text>
                </TouchableOpacity>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardTipo}>{item.tipo}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 18,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 18,
    gap: 18,
    marginTop: 18, // baja el título y la flecha
  },
  backBtn: {
    fontSize: 22,
    color: '#bdbdbd',
    fontWeight: 'bold',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 2,
  },
  cardsContainer: {
    flex: 1,
    backgroundColor: '#fff', // fondo blanco detrás de las tarjetas
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginHorizontal: 18,
    marginTop: 12,
    paddingTop: 28,
    paddingBottom: 28,
  },
  gridWrap: {
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 0,
  },
  card: {
    backgroundColor: '#f7f7fa', // color suave, no blanco
    borderRadius: 18,
    padding: 14,
    width: '47%',
    marginBottom: 28,
    position: 'relative',
    alignItems: 'flex-start',
  },
  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#f7f7fa',
  },
  favIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'transparent',
  },
  favText: {
    fontSize: 20,
    color: '#bdbdbd',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
    textAlign: 'left',
    letterSpacing: 0.1,
  },
  cardTipo: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
    textAlign: 'left',
    fontWeight: '500',
  },
});
