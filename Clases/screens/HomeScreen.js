import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../Supabase/supabaseClient';
/* ------------- CATEGORÍAS ---------------- */
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

  const [menusSaludables, setMenusSaludables] = useState([]);
  const [tab, setTab] = useState('platillos');
  const [search, setSearch] = useState('');

  /* ----------- Cargar usuario ------------- */
  useEffect(() => {
    const fetchNombreYRol = async () => {
      const correo = await AsyncStorage.getItem('correo_institucional');
      if (correo) {
        const { data } = await supabase
          .from('users')
          .select('nombre_completo, rol_id')
          .eq('correo_institucional', correo)
          .single();

        if (data) setNombreCompleto(data.nombre_completo);
      }
    };
    fetchNombreYRol();
  }, []);

  /* ----------- Cargar platos y menús ----------- */
  useEffect(() => {
    const fetchPlatos = async () => {
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          id,
          nombre,
          precio,
          image_url,
          tipo_alimento,
          ingredientes,
          valor_nutricional,
          provider_id,
          providers(nombre_emprendimiento, estado)
        `)
        .eq('is_active', true);

      if (error) return console.log("ERROR platos:", error.message);

      const platosValidos = data
        .filter(p => p.providers?.estado === "aprobado")
        .map(p => ({
          ...p,
          proveedor: p.providers?.nombre_emprendimiento
        }));

      setPlatos(platosValidos);
    };

    const fetchMenus = async () => {
      const { data, error } = await supabase
        .from('menus')
        .select(`
          id,
          titulo,
          descripcion,
          fecha_inicio,
          fecha_fin,
          vigencia,
          creado_por,
          providers:creado_por (
            nombre_emprendimiento,
            estado
          ),
          menu_items (
            id,
            cantidad_disponible,
            dia,
            hora,
            tipo_alimento,
            dishes (
              id,
              nombre,
              valor_nutricional
            )
          )
        `);

      if (error) {
        console.log("ERROR menús:", error.message);
        return setMenusSaludables([]);
      }

      const menusValidos = data.filter(m => m.providers?.estado === "aprobado");
      setMenusSaludables(menusValidos);
    };

    fetchPlatos();
    fetchMenus();
  }, []);

  /* -------- Filtrar platos por categoría -------- */
  const platosFiltrados =
    categoriaActiva === 'todos'
      ? platos
      : platos.filter(
          p => p.tipo_alimento?.toLowerCase() === categoriaActiva.toLowerCase()
        );

  // Filtrar platos por búsqueda
  const platosBuscados = search.trim() === ''
    ? platosFiltrados
    : platosFiltrados.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
      );


  /* ---------------- UI ---------------- */
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/login-illustration.png')} style={styles.headerIcon} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.cartIconWrap} onPress={() => navigation.navigate('CartScreen')}>
            <Text style={styles.cartIconText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.saludo}>Hola {nombreCompleto || ''}, ¿Qué tal?</Text>

      {/* 🔍 Buscador */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Image source={require('../../assets/eye.png')} style={styles.searchIconLeft} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar."
            placeholderTextColor="#bdbdbd"
            value={search}
            onChangeText={setSearch}
          />
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

      {/* Sección menús saludables */}
      <Text style={styles.sectionTitle}>Menús saludables.</Text>
      {menusSaludables.length === 0 ? (
        <Text style={{ color: '#777', marginTop: 20 }}>
          No hay menús saludables semanales disponibles.
        </Text>
      ) : (
        menusSaludables.map((menu) => (
          <View key={menu.id} style={styles.card}>
            <Text style={styles.cardTitle}>{menu.titulo}</Text>
            <Text style={styles.cardDesc}>{menu.descripcion}</Text>
            <Text style={styles.cardPrice}>₡ {menu.precio || 'Consultar'}</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 6 }}>Proveedor: {menu.providers?.nombre_emprendimiento}</Text>
            <Text style={{ marginTop: 4, color: '#276EF1' }}>Vigencia: {menu.fecha_inicio} a {menu.fecha_fin}</Text>
            <Text style={{ marginTop: 6, fontWeight: 'bold' }}>Platos incluidos:</Text>
            {menu.menu_items?.map((item, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <Text style={{ color: '#222' }}>{item.dishes?.nombre}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>Nutrición: {JSON.stringify(item.dishes?.valor_nutricional)}</Text>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}


/* ------------------ ESTILOS NUEVOS ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  /* -------- HEADER -------- */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  menuIcon: {
    padding: 4,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  cartIconWrap: {
    padding: 6,
  },
  cartIconText: {
    fontSize: 28,
    color: '#6E56CF',
  },

  /* -------- SALUDO -------- */
  saludo: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 18,
    color: '#1f1f1f',
  },

  /* -------- BUSCADOR -------- */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingLeft: 6,
  },
  searchIconLeft: {
    width: 22,
    height: 22,
    opacity: 0.6,
  },
  filterIcon: {
    width: 22,
    height: 22,
    opacity: 0.6,
  },
  filterIconWrap: {
    padding: 10,
    marginLeft: 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    elevation: 1,
  },

  /* -------- TITULOS -------- */
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f1f1f',
    marginBottom: 12,
    marginTop: 10,
  },

  /* -------- CATEGORÍAS -------- */
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  categoryWrap: {
    marginRight: 25,
    alignItems: 'center',
  },
  category: {
    fontSize: 15,
    color: '#9e9e9e',
  },
  categoryActive: {
    fontSize: 15,
    color: '#6E56CF',
    fontWeight: '600',
  },
  categoryUnderline: {
    height: 3,
    width: '50%',
    backgroundColor: '#6E56CF',
    borderRadius: 20,
    marginTop: 4,
  },

  /* -------- TARJETAS -------- */
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  card: {
    backgroundColor: '#ffffff',
    width: '48%',
    minHeight: 220,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginBottom: 18,
    marginRight: '4%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },

  cardImage: {
    width: 110,
    height: 70,
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#f2f2f2',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E56CF',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#333',
    marginBottom: 12,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff9f43',
    marginTop: 4,
  },

  /* -------- BOTÓN AÑADIR -------- */
  cardAddBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#ff9f43',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAddText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '900',
  },

  /* -------- CORAZÓN -------- */
  cardHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  cardHeartText: {
    fontSize: 18,
    color: '#FF6B81',
    fontWeight: '600',
  },

  /* -------- MENÚS -------- */
  menuCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
    elevation: 3,
  },
});
