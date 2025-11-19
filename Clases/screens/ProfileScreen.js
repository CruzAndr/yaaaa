import React, { useState, useEffect } from "react";
import { Modal } from "react-native";
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
import { MaterialIcons } from "react-native-vector-icons";

export default function ProfileScreen({ navigation }) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [alergias, setAlergias] = useState("");
  const [comidasFavoritas, setComidasFavoritas] = useState("");

  const [nombreUsuario, setNombreUsuario] = useState("");

  // ROLES
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProveedor, setIsProveedor] = useState(false);

  const [preferencias, setPreferencias] = useState("");
  const [filtrosDieta, setFiltrosDieta] = useState("");
  const [notificaciones, setNotificaciones] = useState("");

  const [saveMsg, setSaveMsg] = useState("");

  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [preferenciasVisible, setPreferenciasVisible] = useState(false);
  const [bajaVisible, setBajaVisible] = useState(false);
  const [editarVisible, setEditarVisible] = useState(false);

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [resultados, setResultados] = useState([]);

  const [bajaCedula, setBajaCedula] = useState("");
  const [bajaMotivo, setBajaMotivo] = useState("");

  const [editCedula, setEditCedula] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState("");
  const [editEstado, setEditEstado] = useState(true);
  const [editFechaRenovacion, setEditFechaRenovacion] = useState("");

  // Estados para desactivar usuario
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateUserId, setDeactivateUserId] = useState("");
  const [deactivateMotivo, setDeactivateMotivo] = useState("");
  const [deactivateMsg, setDeactivateMsg] = useState("");

  // Estados para eliminar usuario
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState("");
  const [deleteMotivo, setDeleteMotivo] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      const storedAlergias = await AsyncStorage.getItem("alergias");
      const storedComidasFav = await AsyncStorage.getItem("comidas_favoritas");
      setAlergias(storedAlergias || "");
      setComidasFavoritas(storedComidasFav || "");

      const storedNombre = await AsyncStorage.getItem("nombre_usuario");
      const storedRolId = await AsyncStorage.getItem("rol_id");

      if (storedNombre) setNombreUsuario(storedNombre);

      // ROLES
      if (storedRolId === "3") {
        setIsAdmin(true);
      } else if (storedRolId === "4" || storedRolId === "5") {
        setIsProveedor(true);
      }

      const pref = await AsyncStorage.getItem("preferencias_dieta");
      setPreferencias(pref || "");

      const filtro = await AsyncStorage.getItem("filtros_dieta");
      setFiltrosDieta(filtro || "");

      const notif = await AsyncStorage.getItem("notificaciones_alimenticias");
      setNotificaciones(notif || "");
    };

    loadData();
  }, []);

  // Cargar categorías de proveedores
  useEffect(() => {
    const fetchCategorias = async () => {
      const { data } = await supabase
        .from("provider_categories")
        .select("id, name");

      if (data) setCategorias(data);
    };
    fetchCategorias();
  }, []);

  const guardarPreferencias = async () => {
    await AsyncStorage.setItem("preferencias_dieta", preferencias);
    await AsyncStorage.setItem("filtros_dieta", filtrosDieta);
    await AsyncStorage.setItem("notificaciones_alimenticias", notificaciones);
    await AsyncStorage.setItem("alergias", alergias);
    await AsyncStorage.setItem("comidas_favoritas", comidasFavoritas);

    setSaveMsg("Guardado correctamente ✔️");
    setTimeout(() => setSaveMsg(""), 2000);
    setEditModalVisible(false);
  };

  const buscarProveedores = async () => {
    let q = supabase.from("providers").select("*");

    if (nombre) q = q.ilike("nombre", `%${nombre}%`);
    if (cedula) q = q.eq("cedula", cedula);
    if (categoriaId) q = q.eq("categoria_id", categoriaId);

    const { data } = await q;
    setResultados(data || []);
  };

  const darDeBaja = async () => {
    if (!bajaCedula) return;

    await supabase
      .from("providers")
      .update({ is_active: false, motivo_baja: bajaMotivo || null })
      .eq("cedula", bajaCedula);
  };

  const cargarProveedor = async () => {
    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("cedula", editCedula)
      .single();

    if (!data) return;

    setEditNombre(data.nombre);
    setEditCategoriaId(String(data.categoria_id));
    setEditEstado(data.is_active);
    setEditFechaRenovacion(data.fecha_renovacion || "");
  };

  const actualizarProveedor = async () => {
    await supabase
      .from("providers")
      .update({
        nombre: editNombre,
        categoria_id: Number(editCategoriaId),
        is_active: editEstado,
        fecha_renovacion: editFechaRenovacion || null,
      })
      .eq("cedula", editCedula);
  };

  //////////////////////////////////////////////////////////////////////
  // 🔥 FUNCIÓN FINAL – DESACTIVAR USUARIO (sin admin_id)
  //////////////////////////////////////////////////////////////////////

  const handleDeactivateUser = async () => {
    setDeactivateMsg("");

    if (!deactivateUserId) {
      setDeactivateMsg("Debes ingresar el correo del usuario.");
      return;
    }

    try {
      // 1. Buscar al usuario por correo
      const { data: userData, error: findError } = await supabase
        .from("users")
        .select("id")
        .eq("correo_institucional", deactivateUserId)
        .single();

      if (findError || !userData) {
        setDeactivateMsg("No se encontró un usuario con ese correo.");
        return;
      }

      const userId = userData.id;

      // 2. Desactivar usuario
      const { error: updateError } = await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", userId);

      if (updateError) {
        setDeactivateMsg("Error al desactivar usuario: " + updateError.message);
        return;
      }

      // 3. Registrar log (sin admin_id)
      const { error: logError } = await supabase
        .from("user_deactivation_log")
        .insert({
          user_id: userId,
          motivo: deactivateMotivo,
        });

      if (logError) {
        setDeactivateMsg("Error al registrar log: " + logError.message);
        return;
      }

      // 4. Éxito
      setDeactivateMsg("Usuario desactivado correctamente.");
      setDeactivateUserId("");
      setDeactivateMotivo("");

      setTimeout(() => {
        setShowDeactivateModal(false);
        setDeactivateMsg("");
      }, 2000);
    } catch (e) {
      setDeactivateMsg("Error inesperado: " + e.message);
    }
  };

  //////////////////////////////////////////////////////////////////////
  // 🔥 FUNCIÓN FINAL – ELIMINACIÓN LÓGICA DE USUARIO
  //////////////////////////////////////////////////////////////////////

  const handleDeleteUser = async () => {
    setDeleteMsg("");
    if (!deleteUserId) {
      setDeleteMsg("Debes ingresar el correo del usuario.");
      return;
    }
    try {
      // 1. Buscar al usuario por correo
      const { data: userData, error: findError } = await supabase
        .from("users")
        .select("id")
        .eq("correo_institucional", deleteUserId)
        .single();
      if (findError || !userData) {
        setDeleteMsg("No se encontró un usuario con ese correo.");
        return;
      }
      const userId = userData.id;
      // 2. Registrar log de eliminación lógica
      const { error: logError } = await supabase
        .from("user_deletion_log")
        .insert({
          user_id: userId,
          motivo: deleteMotivo,
        });
      if (logError) {
        setDeleteMsg("Error al registrar log: " + logError.message);
        return;
      }
      setDeleteMsg("Eliminación lógica registrada correctamente.");
      setDeleteUserId("");
      setDeleteMotivo("");
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteMsg("");
      }, 2000);
    } catch (e) {
      setDeleteMsg("Error inesperado: " + e.message);
    }
  };

  //////////////////////////////////////////////////////////////////////

  // SECCIONES SEGÚN ROL
  const sections = [
    { key: "perfil", type: "perfil" },
    { key: "preferencias", type: "preferencias" },
    ...(isAdmin ? [{ key: "buscar", type: "buscar" }] : []),
    ...(isProveedor
      ? [
          { key: "baja", type: "baja" },
          { key: "editar", type: "editar" },
        ]
      : []),
    ...(isAdmin ? [{ key: "adminPanel", type: "adminPanel" }] : []),
    { key: "menu", type: "menu" },
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      //////////////////////////////////////////////////////////////////////
      // PERFIL
      //////////////////////////////////////////////////////////////////////
      case "perfil":
        return (
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ alignSelf: "flex-start" }}
            >
              <Text style={{ color: "#555", marginBottom: 15 }}>‹ Volver.</Text>
            </TouchableOpacity>

            <Image
              source={require("../../assets/avatar1.png")}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 20,
              }}
            />

            <View style={styles.profileCard}>
              <Text style={styles.profileName}>{nombreUsuario}</Text>
              <Text style={styles.profileEmail}>Correo universitario.</Text>
              <Text style={styles.profileDesc}>Descripción.</Text>

              <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Modal editar preferencias */}
            <Modal
              visible={editModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setEditModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Editar preferencias</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Preferencias de dieta"
                    value={preferencias}
                    onChangeText={setPreferencias}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Filtros de dieta"
                    value={filtrosDieta}
                    onChangeText={setFiltrosDieta}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Alergias"
                    value={alergias}
                    onChangeText={setAlergias}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Comidas favoritas"
                    value={comidasFavoritas}
                    onChangeText={setComidasFavoritas}
                  />

                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.menuButton, { flex: 1, marginRight: 8 }]}
                      onPress={guardarPreferencias}
                    >
                      <Text style={styles.menuButtonText}>Guardar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.menuButton, { flex: 1 }]}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <Text style={styles.menuButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>

                  {saveMsg ? (
                    <Text style={styles.success}>{saveMsg}</Text>
                  ) : null}
                </View>
              </View>
            </Modal>
          </View>
        );

      //////////////////////////////////////////////////////////////////////
      // PREFERENCIAS
      //////////////////////////////////////////////////////////////////////
      case "preferencias":
        return (
          <View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setPreferenciasVisible(!preferenciasVisible)}
            >
              <Text style={styles.menuButtonText}>
                Preferencias alimenticias.
              </Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {preferenciasVisible && (
              <View style={styles.dropdownContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Preferencias"
                  value={preferencias}
                  onChangeText={setPreferencias}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Filtros"
                  value={filtrosDieta}
                  onChangeText={setFiltrosDieta}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Alergias"
                  value={notificaciones}
                  onChangeText={setNotificaciones}
                />

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={guardarPreferencias}
                >
                  <Text style={styles.btnPrimaryText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      //////////////////////////////////////////////////////////////////////
      // BUSCAR PROVEEDOR
      //////////////////////////////////////////////////////////////////////
      case "buscar":
        return (
          <View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setBuscadorVisible(!buscadorVisible)}
            >
              <Text style={styles.menuButtonText}>Buscar proveedores.</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {buscadorVisible && (
              <View style={styles.dropdownContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  value={nombre}
                  onChangeText={setNombre}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Cédula"
                  value={cedula}
                  onChangeText={setCedula}
                />

                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={categoriaId}
                    onValueChange={setCategoriaId}
                  >
                    <Picker.Item label="Categoría" value="" />
                    {categorias.map((c) => (
                      <Picker.Item key={c.id} label={c.name} value={c.id} />
                    ))}
                  </Picker>
                </View>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={buscarProveedores}
                >
                  <Text style={styles.btnPrimaryText}>Buscar</Text>
                </TouchableOpacity>

                {resultados.map((r) => (
                  <View key={r.cedula} style={styles.resultCard}>
                    <View style={styles.avatar} />
                    <View>
                      <Text style={styles.resultName}>{r.nombre}</Text>
                      <Text style={styles.resultCedula}>{r.cedula}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      //////////////////////////////////////////////////////////////////////
      // BAJA PROVEEDOR
      //////////////////////////////////////////////////////////////////////
      case "baja":
        return (
          <View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setBajaVisible(!bajaVisible)}
            >
              <Text style={styles.menuButtonText}>Dar de baja proveedor.</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {bajaVisible && (
              <View style={styles.dropdownContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Cédula"
                  value={bajaCedula}
                  onChangeText={setBajaCedula}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Motivo"
                  value={bajaMotivo}
                  onChangeText={setBajaMotivo}
                />

                <TouchableOpacity style={styles.btnPrimary} onPress={darDeBaja}>
                  <Text style={styles.btnPrimaryText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      //////////////////////////////////////////////////////////////////////
      // EDITAR PROVEEDOR
      //////////////////////////////////////////////////////////////////////
      case "editar":
        return (
          <View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setEditarVisible(!editarVisible)}
            >
              <Text style={styles.menuButtonText}>Editar proveedor.</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {editarVisible && (
              <View style={styles.dropdownContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Cédula"
                  value={editCedula}
                  onChangeText={setEditCedula}
                />

                <TouchableOpacity
                  style={styles.btnPrimaryOutline}
                  onPress={cargarProveedor}
                >
                  <Text style={styles.btnPrimaryOutlineText}>
                    Cargar datos
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  value={editNombre}
                  onChangeText={setEditNombre}
                />

                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={editCategoriaId}
                    onValueChange={setEditCategoriaId}
                  >
                    <Picker.Item label="Categoría" value="" />
                    {categorias.map((c) => (
                      <Picker.Item
                        key={c.id}
                        label={c.name}
                        value={String(c.id)}
                      />
                    ))}
                  </Picker>
                </View>

                <TouchableOpacity
                  style={[
                    styles.estadoBtn,
                    editEstado ? styles.estadoActivo : styles.estadoInactivo,
                  ]}
                  onPress={() => setEditEstado(!editEstado)}
                >
                  <Text>{editEstado ? "Activo" : "Inactivo"}</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={editFechaRenovacion}
                  onChangeText={setEditFechaRenovacion}
                />

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={actualizarProveedor}
                >
                  <Text style={styles.btnPrimaryText}>Guardar cambios</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      //////////////////////////////////////////////////////////////////////
      // PANEL ADMINISTRADOR
      //////////////////////////////////////////////////////////////////////
      case "adminPanel":
        return (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate("ConsultarUsuarios")}
            >
              <Text style={styles.menuButtonText}>Gestionar usuarios</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate("AEApproveProviders")}
            >
              <Text style={styles.menuButtonText}>Aprobar proveedores</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate("AEApproveDishes")}
            >
              <Text style={styles.menuButtonText}>Aprobar platillos</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* Nueva opción: Desactivar usuario */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowDeactivateModal(true)}
            >
              <Text style={styles.menuButtonText}>Desactivar usuario</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* Modal para desactivar usuario */}
            {showDeactivateModal && (
              <Modal
                visible={showDeactivateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDeactivateModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Desactivar usuario</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Correo del usuario"
                      value={deactivateUserId}
                      onChangeText={setDeactivateUserId}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Motivo (opcional, máx 100 caracteres)"
                      value={deactivateMotivo}
                      onChangeText={(text) =>
                        setDeactivateMotivo(text.slice(0, 100))
                      }
                    />
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={handleDeactivateUser}
                    >
                      <Text style={styles.btnPrimaryText}>Desactivar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnPrimaryOutline}
                      onPress={() => setShowDeactivateModal(false)}
                    >
                      <Text style={styles.btnPrimaryOutlineText}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    {deactivateMsg ? (
                      <Text style={styles.success}>{deactivateMsg}</Text>
                    ) : null}
                  </View>
                </View>
              </Modal>
            )}

            {/* Nueva opción: Eliminar usuario (lógica) */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Text style={styles.menuButtonText}>Eliminar usuario (lógico)</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* Modal para eliminación lógica de usuario */}
            {showDeleteModal && (
              <Modal
                visible={showDeleteModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDeleteModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Eliminar usuario (lógico)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Correo del usuario"
                      value={deleteUserId}
                      onChangeText={setDeleteUserId}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Motivo (opcional, máx 100 caracteres)"
                      value={deleteMotivo}
                      onChangeText={(text) => setDeleteMotivo(text.slice(0, 100))}
                    />
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleDeleteUser}>
                      <Text style={styles.btnPrimaryText}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnPrimaryOutline} onPress={() => setShowDeleteModal(false)}>
                      <Text style={styles.btnPrimaryOutlineText}>Cancelar</Text>
                    </TouchableOpacity>
                    {deleteMsg ? <Text style={styles.success}>{deleteMsg}</Text> : null}
                  </View>
                </View>
              </Modal>
            )}
          </View>
        );

      //////////////////////////////////////////////////////////////////////
      // MENÚ FINAL
      //////////////////////////////////////////////////////////////////////
      case "menu":
        return (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Retos.</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Chat IA.</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Calendario.</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* Sesiones activas */}
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('SesionesActivas')}>
              <Text style={styles.menuButtonText}>Sesiones activas</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  // Sesiones activas ficticias para el usuario
  const fakeSessions = [
    {
      id: "sess-1",
      dispositivo: "Chrome en Windows",
      agente: "Mozilla/5.0",
      direccion_ip: "190.12.34.56",
      ubicacion_aproximada: "San José, Costa Rica",
      fecha_inicio: "2025-11-19 08:00",
    },
    {
      id: "sess-2",
      dispositivo: "Safari en iPhone",
      agente: "Mobile Safari",
      direccion_ip: "181.45.67.89",
      ubicacion_aproximada: "Cartago, Costa Rica",
      fecha_inicio: "2025-11-18 22:15",
    },
    {
      id: "sess-3",
      dispositivo: "Firefox en Linux",
      agente: "Mozilla/5.0",
      direccion_ip: "200.55.66.77",
      ubicacion_aproximada: "Heredia, Costa Rica",
      fecha_inicio: "2025-11-17 14:30",
    },
  ];

  function SesionesActivasScreen() {
    const [sessions, setSessions] = useState(fakeSessions);

    const handleCerrarSesion = (id) => {
      setSessions(sessions.filter((s) => s.id !== id));
    };
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/////////////////////////////////////////////////
// STYLES
/////////////////////////////////////////////////

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  profileCard: {
    width: "100%",
    backgroundColor: "#F3F3F3",
    borderRadius: 14,
    padding: 16,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "bold",
  },
  profileEmail: {
    color: "#666",
    fontSize: 14,
  },
  profileDesc: {
    color: "#666",
    fontSize: 14,
    marginBottom: 8,
  },
  editLink: {
    color: "#7A61FF",
    fontWeight: "600",
    alignSelf: "flex-end",
  },

  menuButton: {
    backgroundColor: "#F3F3F3",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  menuButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuArrow: {
    fontSize: 20,
    color: "#999",
  },

  dropdownContent: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: -4,
  },

  input: {
    backgroundColor: "#EFEFEF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
  },

  pickerBox: {
    backgroundColor: "#EEE",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },

  btnPrimary: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  btnPrimaryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },

  btnPrimaryOutline: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  btnPrimaryOutlineText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
  },

  resultCard: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#DDD",
    marginRight: 14,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultCedula: {
    color: "#777",
  },

  estadoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  estadoActivo: {
    backgroundColor: "#DFF5E3",
  },
  estadoInactivo: {
    backgroundColor: "#F7D9D9",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  success: {
    color: "green",
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
});
