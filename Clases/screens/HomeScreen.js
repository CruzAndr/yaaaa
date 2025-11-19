import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../Supabase/supabaseClient';

const categorias = [
  { key: 'todos', label: 'Todos.' },
  { key: 'desayuno', label: 'Desayuno.' },
  { key: 'almuerzo', label: 'Almuerzo.' },
  { key: 'cena', label: 'Cena.' },
  { key: 'merienda', label: 'Merienda.' },
  { key: 'saludable', label: 'Saludable.' },
];

const filtros = [
  { key: 'tienda', label: 'Por Tienda.' },
  { key: 'menu', label: 'Por menú.' },
  { key: 'baratos', label: 'Más baratos.' },
  { key: 'caros', label: 'Más caros.' },
];

export default function HomeScreen({ navigation }) {
  const { addToCart } = useContext(CartContext);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState('tienda');
  const [platos, setPlatos] = useState([]);
  const [userRolId, setUserRolId] = useState(null);

  // ✔ Cargar nombre
  useEffect(() => {
    const fetchNombreYRol = async () => {
      const correo = await AsyncStorage.getItem('correo_institucional');
      if (correo) {
        const { data } = await supabase
          .from('users')
          .select('nombre_completo, rol_id')
          .eq('correo_institucional', correo)
          .single();
        if (data) {
          setNombreCompleto(data.nombre_completo);
          setUserRolId(data.rol_id);
        }
      }
    };
    fetchNombreYRol();
  }, []);

  // ✔ Cargar platos desde la base de datos
  useEffect(() => {
    const fetchPlatos = async () => {
      // Traer también el proveedor (join con providers)
      const { data, error } = await supabase
        .from('dishes')
        .select('id, nombre, precio, image_url, tipo_alimento, ingredientes, valor_nutricional, provider_id, providers(nombre_emprendimiento)')
        .eq('is_active', true);

      // Mapear el nombre del proveedor
      if (!error && data) {
        const platosConProveedor = data.map((p) => ({
          ...p,
          proveedor: p.providers?.nombre_emprendimiento || '',
        }));
        setPlatos(platosConProveedor);
      }
    };
    fetchPlatos();
  }, []);

  // 👇 Filtrar platos por categoría activa
  const platosFiltrados =
    categoriaActiva === 'todos'
      ? platos
      : platos.filter(
          (p) => p.tipo_alimento?.toLowerCase() === categoriaActiva.toLowerCase()
        );

  // ✔ Logout
  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScrollView style={styles.container} scrollEnabled={!showFiltros}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/login-illustration.png')} style={styles.headerIcon} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.cartIconWrap} onPress={() => navigation.navigate('CartScreen')}>
            <Text style={styles.cartIconText}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.saludo}>Hola {nombreCompleto || ''}, ¿Qué tal?</Text>


      {/* 🔍 Buscador */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Image source={require('../../assets/eye.png')} style={styles.searchIconLeft} />
          <TextInput style={styles.searchInput} placeholder="Buscar." placeholderTextColor="#bdbdbd" />
        </View>

        <TouchableOpacity style={styles.filterIconWrap} onPress={() => setShowFiltros(true)}>
          <Image source={require('../../assets/lock.png')} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      {/* MODAL FILTROS */}
      {showFiltros && (
        <View style={styles.filtrosModalContainer}>
          <View style={styles.filtrosModalBar}>
            <Text style={styles.filtrosBrand}>Sabor U</Text>
            <Text style={styles.filtrosTitle}>Filtros</Text>
            <TouchableOpacity style={styles.filtrosCloseBtn} onPress={() => setShowFiltros(false)}>
              <Text style={styles.filtrosCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filtrosModalContent}>
            {filtros.map((filtro) => (
              <TouchableOpacity
                key={filtro.key}
                style={filtroActivo === filtro.key ? styles.filtroBtnActive : styles.filtroBtn}
                onPress={() => {
                  setFiltroActivo(filtro.key);
                  if (filtro.key === 'tienda') {
                    setShowFiltros(false);
                    navigation.navigate('TiendasScreen');
                  }
                }}
              >
                <Text style={filtroActivo === filtro.key ? styles.filtroTextActive : styles.filtroText}>
                  {filtro.label}
                </Text>
                {filtroActivo === filtro.key && <Text style={styles.filtroCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* CATEGORÍAS */}
      <Text style={styles.sectionTitle}>Categorías disponibles.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoriesRow}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.categoryWrap}
              onPress={() => setCategoriaActiva(cat.key)}
            >
              <Text style={cat.key === categoriaActiva ? styles.categoryActive : styles.category}>
                {cat.label}
              </Text>
              {cat.key === categoriaActiva && <View style={styles.categoryUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* PLATOS FILTRADOS */}
      <View style={[styles.cardsRow, { marginBottom: 48, flexWrap: 'wrap' }]}> 
        {platosFiltrados.length === 0 ? (
          <Text style={{ color: '#777', marginTop: 20 }}>No hay platos en esta categoría.</Text>
        ) : (
          platosFiltrados.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('ProductDetailScreen', {
                  id: item.id,
                  nombre: item.nombre,
                  precio: item.precio,
                  imagen: item.image_url,
                  descripcion: item.ingredientes,
                  consideraciones: JSON.stringify(item.valor_nutricional, null, 2),
                  proveedor: item.proveedor,
                  valor_nutricional: item.valor_nutricional,
                })
              }
            >
              <Image
                source={{ uri: item.image_url }}
                style={styles.cardImage}
              />

              <Text style={styles.cardTitle}>Sabor U</Text>
              <Text style={styles.cardDesc}>{item.nombre}</Text>
              <Text style={styles.cardPrice}>₡ {item.precio}</Text>

              <TouchableOpacity style={styles.cardAddBtn} onPress={() => addToCart({
                id: item.id,
                nombre: item.nombre,
                precio: item.precio,
                imagen: item.image_url,
                proveedor: item.proveedor
              })}>
                <Text style={styles.cardAddText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cardHeart}>
                <Text style={styles.cardHeartText}>♡</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cartIconText: {
    fontSize: 28,
    marginRight: 2
  },
  cartIconWrap: {
    padding: 8,
    marginRight: 8
  },
  cartIcon: {
    width: 28,
    height: 28
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  menuIcon: {
    padding: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoutBtn: {
    backgroundColor: '#276EF1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saludo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  searchIconLeft: {
    width: 22,
    height: 22,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 8,
  },
  filterIconWrap: {
    padding: 8,
  },
  filterIcon: {
    width: 22,
    height: 22,
  },
  filtrosModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtrosModalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    width: '90%',
    justifyContent: 'space-between',
  },
  filtrosBrand: {
    fontWeight: 'bold',
    color: '#276EF1',
    fontSize: 16,
  },
  filtrosTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  filtrosCloseBtn: {
    padding: 8,
  },
  filtrosCloseText: {
    fontSize: 18,
    color: '#888',
  },
  filtrosModalContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    width: '90%',
  },
  filtroBtn: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtroBtnActive: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#276EF1',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtroText: {
    color: '#222',
    fontSize: 15,
    flex: 1,
  },
  filtroTextActive: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
    fontWeight: 'bold',
  },
  filtroCheck: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#276EF1',
  },
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  categoryWrap: {
    marginRight: 18,
    alignItems: 'center',
  },
  category: {
    color: '#888',
    fontSize: 15,
    fontWeight: 'bold',
  },
  categoryActive: {
    color: '#276EF1',
    fontSize: 15,
    fontWeight: 'bold',
  },
  categoryUnderline: {
    height: 3,
    backgroundColor: '#276EF1',
    width: '80%',
    marginTop: 2,
    borderRadius: 2,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    marginBottom: 18,
    width: 160,
    elevation: 2,
    alignItems: 'center',
  },
  cardImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#276EF1',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 14,
    color: '#222',
    marginBottom: 2,
  },
  cardPrice: {
    fontWeight: 'bold',
    color: '#43cea2',
    fontSize: 15,
    marginBottom: 6,
  },
  cardAddBtn: {
    backgroundColor: '#43cea2',
    borderRadius: 20,
    padding: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  cardAddText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  cardHeartText: {
    color: '#ff5252',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


