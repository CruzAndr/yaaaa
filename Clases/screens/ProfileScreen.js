import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../Supabase/supabaseClient";
import AEModuleButton from "../../AE/AEModuleButton";

export default function ProfileScreen({ navigation }) {
  // -----------------------------
  // ESTADO PERFIL BÁSICO
  // -----------------------------
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [isProveedor, setIsProveedor] = useState(false);

  // -----------------------------
  // ESTADO PREFERENCIAS ALIMENTICIAS
  // -----------------------------
  const [editPreferenciasVisible, setEditPreferenciasVisible] = useState(false);
  const [preferencias, setPreferencias] = useState("");
  const [filtrosDieta, setFiltrosDieta] = useState("");
  const [notificaciones, setNotificaciones] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  // -----------------------------
  // ESTADO DAR DE BAJA PROVEEDOR
  // -----------------------------
  const [bajaCedula, setBajaCedula] = useState("");
  const [bajaMotivo, setBajaMotivo] = useState("");
  const [bajaError, setBajaError] = useState("");
  const [bajaSuccess, setBajaSuccess] = useState("");

  // -----------------------------
  // ESTADO EDITAR PROVEEDOR
  // -----------------------------
  const [editCedula, setEditCedula] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState("");
  const [editEstado, setEditEstado] = useState(true);
  const [editFechaRenovacion, setEditFechaRenovacion] = useState("");
  const [editVisible, setEditVisible] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // -----------------------------
  // ESTADO BUSCADOR
  // -----------------------------
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState("");

  // -------------------------------------------------
  // CARGAR INFO BÁSICA DEL PERFIL + PREFERENCIAS
  // -------------------------------------------------
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const storedNombre = await AsyncStorage.getItem("nombre_usuario");
        const storedRolId = await AsyncStorage.getItem("rol_id");

        if (storedNombre) setNombreUsuario(storedNombre);
        if (storedRolId && (storedRolId === "4" || storedRolId === "5")) {
          setIsProveedor(true);
        }

        const storedPref = await AsyncStorage.getItem("preferencias_dieta");
        const storedFiltros = await AsyncStorage.getItem("filtros_dieta");
        const storedNotifs = await AsyncStorage.getItem("notificaciones_alimenticias");

        if (storedPref) setPreferencias(storedPref);
        if (storedFiltros) setFiltrosDieta(storedFiltros);
        if (storedNotifs) setNotificaciones(storedNotifs);
      } catch (e) {
        console.log("Error cargando perfil:", e);
      }
    };

    cargarPerfil();
  }, []);

  // -------------------------------------------------
  // CARGAR CATEGORÍAS DE PROVEEDOR DESDE SUPABASE
  // -------------------------------------------------
  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from("provider_categories")
        .select("id, name");

      if (!error && data) {
        setCategorias(data);
      } else {
        console.log("Error cargando categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  // -------------------------------------------------
  // GUARDAR PREFERENCIAS ALIMENTICIAS
  // -------------------------------------------------
  const guardarPreferencias = async () => {
    try {
      await AsyncStorage.setItem("preferencias_dieta", preferencias || "");
      await AsyncStorage.setItem("filtros_dieta", filtrosDieta || "");
      await AsyncStorage.setItem("notificaciones_alimenticias", notificaciones || "");
      setSaveMsg("Preferencias guardadas correctamente.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      console.log("Error guardando preferencias:", e);
      setSaveMsg("Error al guardar preferencias.");
    }
  };

  // -------------------------------------------------
  // DAR DE BAJA PROVEEDOR
  // -------------------------------------------------
  const darDeBajaProveedor = async () => {
    setBajaError("");
    setBajaSuccess("");

    if (!bajaCedula) {
      setBajaError("Debes ingresar el número de cédula/carnet del proveedor.");
      return;
    }

    const { data, error } = await supabase
      .from("providers")
      .select("cedula, is_active")
      .eq("cedula", bajaCedula)
      .single();

    if (error || !data) {
      setBajaError("Proveedor no encontrado.");
      return;
    }

    const { error: updateError } = await supabase
      .from("providers")
      .update({
        is_active: false,
        motivo_baja: bajaMotivo || null, // si no existe esta columna, quítala
      })
      .eq("cedula", bajaCedula);

    if (updateError) {
      console.log("Error baja proveedor:", updateError);
      setBajaError("Error al dar de baja al proveedor.");
    } else {
      setBajaSuccess("Proveedor dado de baja correctamente.");
    }
  };

  // -------------------------------------------------
  // CARGAR PROVEEDOR PARA EDICIÓN
  // -------------------------------------------------
  const cargarProveedor = async () => {
    setEditError("");
    setEditSuccess("");

    if (!editCedula) {
      setEditError("Debes ingresar el número de cédula/carnet del proveedor.");
      return;
    }

    const { data, error } = await supabase
      .from("providers")
      .select("cedula, nombre, categoria_id, is_active, fecha_renovacion")
      .eq("cedula", editCedula)
      .single();

    if (error || !data) {
      setEditError("Proveedor no encontrado.");
      return;
    }

    setEditNombre(data.nombre || "");
    setEditCategoriaId(data.categoria_id ? String(data.categoria_id) : "");
    setEditEstado(data.is_active);
    setEditFechaRenovacion(
      data.fecha_renovacion ? String(data.fecha_renovacion).slice(0, 10) : ""
    );
  };

  // -------------------------------------------------
  // ACTUALIZAR PROVEEDOR
  // -------------------------------------------------
  const actualizarProveedor = async () => {
    setEditError("");
    setEditSuccess("");

    if (!editCedula) {
      setEditError("El número de cédula/carnet es obligatorio.");
      return;
    }
    if (!editNombre || editNombre.length > 20) {
      setEditError("El nombre debe tener máximo 20 caracteres.");
      return;
    }
    if (!editCategoriaId) {
      setEditError("Debes seleccionar una categoría válida.");
      return;
    }

    const { error } = await supabase
      .from("providers")
      .update({
        nombre: editNombre,
        categoria_id: Number(editCategoriaId),
        is_active: editEstado,
        fecha_renovacion: editFechaRenovacion || null,
      })
      .eq("cedula", editCedula);

    if (error) {
      console.log("Error al actualizar proveedor:", error);
      setEditError("Error al actualizar proveedor.");
    } else {
      setEditSuccess("Proveedor actualizado correctamente.");
    }
  };

  // -------------------------------------------------
  // VALIDAR CAMPOS BUSCADOR
  // -------------------------------------------------
  const validarCampos = () => {
    if (nombre && nombre.length > 20) {
      setError("El nombre debe tener máximo 20 caracteres.");
      return false;
    }
    if (cedula && cedula.length < 1) {
      setError("El número de cédula/carnet es obligatorio.");
      return false;
    }
    if (categoriaId && !categorias.find((c) => c.id == categoriaId)) {
      setError("La categoría seleccionada no existe.");
      return false;
    }
    setError("");
    return true;
  };

  // -------------------------------------------------
  // BUSCAR PROVEEDORES
  // -------------------------------------------------
  const buscarProveedores = async () => {
    if (!validarCampos()) return;

    let query = supabase.from("providers").select("cedula, nombre, categoria_id");

    if (nombre) query = query.ilike("nombre", `%${nombre}%`);
    if (cedula) query = query.eq("cedula", cedula);
    if (categoriaId) query = query.eq("categoria_id", categoriaId);

    const { data, error } = await query;

    if (error) {
      console.log("Error al buscar proveedores:", error);
      setError("Error al buscar proveedores.");
      setResultados([]);
    } else {
      setResultados(data || []);
    }
  };

  // -------------------------------------------------
  // RENDER
  // -------------------------------------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{"< Volver."}</Text>
      </TouchableOpacity>

      <Image source={require("../../assets/avatar1.png")} style={styles.logo} />

      {/* PERFIL */}
      <View style={styles.profileBox}>
        <Text style={styles.name}>{nombreUsuario || "Perfil"}</Text>
        <Text style={styles.email}>Correo universitario.</Text>
        <Text style={styles.desc}>Descripción.</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditPreferenciasVisible((v) => !v)}
        >
          <Text style={styles.editText}>
            {editPreferenciasVisible ? "Cerrar" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PREFERENCIAS ALIMENTICIAS */}
      {editPreferenciasVisible && (
        <View style={styles.prefCard}>
          <Text style={styles.prefTitle}>🍽️ Preferencias alimenticias</Text>
          <Text style={styles.prefSubtitle}>
            Personaliza tu experiencia y recomendaciones
          </Text>

          <TextInput
            style={styles.prefInput}
            placeholder="🥗 Preferencias de dieta (ej: vegetariano, vegano)"
            value={preferencias}
            onChangeText={setPreferencias}
            placeholderTextColor="#A9A9A9"
          />

          <TextInput
            style={styles.prefInput}
            placeholder="🚫 Filtros de dieta (ej: sin gluten, sin lactosa)"
            value={filtrosDieta}
            onChangeText={setFiltrosDieta}
            placeholderTextColor="#A9A9A9"
          />

          <TextInput
            style={styles.prefInput}
            placeholder="⚠️ Alergias y notificaciones"
            value={notificaciones}
            onChangeText={setNotificaciones}
            placeholderTextColor="#A9A9A9"
          />

          <TouchableOpacity style={styles.prefBtn} onPress={guardarPreferencias}>
            <Text style={styles.prefBtnText}>Guardar preferencias</Text>
          </TouchableOpacity>

          {saveMsg ? <Text style={styles.success}>{saveMsg}</Text> : null}
        </View>
      )}

      {/* DAR DE BAJA PROVEEDOR */}
      <View style={styles.editBox}>
        <Text style={styles.editTitle}>Dar de baja proveedor</Text>

        <TextInput
          style={styles.input}
          placeholder="Número de cédula/carnet"
          value={bajaCedula}
          onChangeText={setBajaCedula}
          keyboardType="numeric"
          maxLength={15}
        />

        <TextInput
          style={styles.input}
          placeholder="Motivo de baja (opcional)"
          value={bajaMotivo}
          onChangeText={(t) => setBajaMotivo(t.slice(0, 100))}
          maxLength={100}
        />

        <TouchableOpacity style={styles.searchBtn} onPress={darDeBajaProveedor}>
          <Text style={styles.searchBtnText}>Dar de baja</Text>
        </TouchableOpacity>

        {bajaError ? <Text style={styles.error}>{bajaError}</Text> : null}
        {bajaSuccess ? <Text style={styles.success}>{bajaSuccess}</Text> : null}

        {/* Módulo AE - solo para proveedores */}
        <AEModuleButton onPress={() => navigation.navigate("AEModuleMenu")} />
      </View>

      {/* EDITAR PROVEEDOR */}
      <View style={styles.editBox}>
        <TouchableOpacity
          style={styles.editToggleBtn}
          onPress={() => setEditVisible((v) => !v)}
        >
          <Text style={styles.editToggleText}>
            {editVisible ? "Ocultar edición de proveedor" : "Editar proveedor"}
          </Text>
        </TouchableOpacity>

        {editVisible && (
          <View style={styles.editFormBox}>
            <Text style={styles.editTitle}>Editar proveedor</Text>

            <TextInput
              style={styles.input}
              placeholder="Número de cédula/carnet"
              value={editCedula}
              onChangeText={setEditCedula}
              keyboardType="numeric"
              maxLength={15}
            />

            <TouchableOpacity style={styles.searchBtn} onPress={cargarProveedor}>
              <Text style={styles.searchBtnText}>Cargar datos</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Nombre proveedor"
              value={editNombre}
              onChangeText={setEditNombre}
              maxLength={20}
            />

            <Picker
              selectedValue={editCategoriaId}
              style={styles.input}
              onValueChange={setEditCategoriaId}
            >
              <Picker.Item label="Selecciona una categoría" value="" />
              {categorias.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={String(cat.id)} />
              ))}
            </Picker>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ marginRight: 8 }}>Estado:</Text>

              <TouchableOpacity
                style={[
                  styles.estadoBtn,
                  editEstado ? styles.estadoActivo : styles.estadoInactivo,
                ]}
                onPress={() => setEditEstado((e) => !e)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {editEstado ? "Activo" : "Inactivo"}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Fecha renovación (YYYY-MM-DD)"
              value={editFechaRenovacion}
              onChangeText={setEditFechaRenovacion}
              maxLength={10}
            />

            <TouchableOpacity
              style={styles.searchBtn}
              onPress={actualizarProveedor}
            >
              <Text style={styles.searchBtnText}>Actualizar proveedor</Text>
            </TouchableOpacity>

            {editError ? <Text style={styles.error}>{editError}</Text> : null}
            {editSuccess ? (
              <Text style={styles.success}>{editSuccess}</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchBox}>
        <Text style={styles.searchTitle}>Buscar proveedores</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre proveedor"
          value={nombre}
          onChangeText={setNombre}
          maxLength={20}
        />

        <TextInput
          style={styles.input}
          placeholder="Cédula/carnet"
          value={cedula}
          onChangeText={setCedula}
          keyboardType="numeric"
        />

        <Picker
          selectedValue={categoriaId}
          style={styles.input}
          onValueChange={setCategoriaId}
        >
          <Picker.Item label="Selecciona categoría" value="" />
          {categorias.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>

        <TouchableOpacity style={styles.searchBtn} onPress={buscarProveedores}>
          <Text style={styles.searchBtnText}>Buscar</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={resultados}
          keyExtractor={(item) => String(item.cedula)}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Text style={styles.resultText}>Nombre: {item.nombre}</Text>
              <Text style={styles.resultText}>Cédula: {item.cedula}</Text>
              <Text style={styles.resultText}>
                Categoría:{" "}
                {categorias.find((c) => c.id == item.categoria_id)?.name ||
                  item.categoria_id}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.resultText}>No se encontraron proveedores.</Text>
          }
        />
      </View>

      {/* MENÚ */}
      <View style={styles.menuBox}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ProveedorGestion')}>
          <Text style={styles.menuText}>Aprobar proveedores.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Aprobar platillos.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Retos.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Chat IA.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Calendario.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --------------------------------------
//                ESTILOS
// --------------------------------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  backBtn: { alignSelf: "flex-start", marginBottom: 8 },
  backText: { fontSize: 16, color: "#222", fontWeight: "bold" },

  logo: { width: 70, height: 70, marginBottom: 18 },

  profileBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    width: "100%",
    elevation: 2,
  },

  name: { fontWeight: "bold", fontSize: 17, color: "#222" },
  email: { fontSize: 15, color: "#888" },
  desc: { fontSize: 14, color: "#888" },

  editBtn: { position: "absolute", right: 12, top: 12 },
  editText: { color: "#6C63FF", fontWeight: "bold", fontSize: 15 },

  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    width: "100%",
  },

  searchTitle: { fontWeight: "bold", fontSize: 16, color: "#276EF1" },

  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 10,
    color: "#222",
  },

  searchBtn: {
    backgroundColor: "#276EF1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  searchBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  error: { color: "red", textAlign: "center", marginBottom: 4 },
  success: { color: "green", textAlign: "center", marginBottom: 4 },

  resultItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },

  resultText: { fontSize: 15, color: "#222" },

  editBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    width: "100%",
  },

  editToggleBtn: {
    backgroundColor: "#276EF1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  editToggleText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  editFormBox: { marginTop: 8 },

  editTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#276EF1",
    marginBottom: 8,
  },

  estadoBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  estadoActivo: { backgroundColor: "#4CAF50" },
  estadoInactivo: { backgroundColor: "#F44336" },

  menuBox: { width: "100%", marginTop: 10, marginBottom: 20 },
  menuItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  menuText: { fontSize: 16, color: "#222", fontWeight: "500" },

  // --- Modernos para preferencias alimenticias ---
  prefCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  prefTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#276EF1",
    marginBottom: 6,
    textAlign: "center",
  },
  prefSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
    textAlign: "center",
  },
  prefInput: {
    width: "100%",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
    color: "#222",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  prefBtn: {
    backgroundColor: "#276EF1",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  prefBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
