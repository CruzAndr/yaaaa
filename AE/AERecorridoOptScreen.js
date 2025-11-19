import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../Supabase/supabaseClient";

const AERecorridoOptScreen = () => {
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [rutaRecomendada, setRutaRecomendada] = useState("");

  // CARGAR PEDIDOS DEL DÍA ACTUAL
  useEffect(() => {
    const loadOrders = async () => {
      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          punto_entrega,
          franja_horaria,
          user_id,
          provider_id,
          users (
            id,
            nombre_completo
          ),
          providers (
            id,
            nombre_emprendimiento,
            direccion
          )
        `)
        .gte("franja_horaria", today + " 00:00")
        .lte("franja_horaria", today + " 23:59");

      if (error) {
        console.log("Error cargando pedidos:", error);
        return;
      }

      setOrders(data);
    };

    loadOrders();
  }, []);

  // CARGAR RUTAS
  useEffect(() => {
    const loadRoutes = async () => {
      const { data, error } = await supabase
        .from("delivery_routes")
        .select("id, fecha, capacidad, vehiculo, conductor");

      if (!error) setRoutes(data);
    };
    loadRoutes();
  }, []);

  // OPTIMIZAR RUTA
  const handleOptimizarRuta = async () => {
    if (!selectedRoute) {
      alert("Seleccione una ruta primero");
      return;
    }

    if (orders.length === 0) {
      alert("No hay pedidos para hoy.");
      return;
    }

    // Determinar ubicacion (user o provider)
    const enriched = orders.map((o) => ({
      ...o,
      ubicacion:
        o.users?.direccion_habitacion ??
        o.providers?.direccion ??
        "Ubicación no registrada",
    }));

    // Orden por cercanía simulada (alfabético)
    const sorted = enriched.sort((a, b) =>
      a.ubicacion.localeCompare(b.ubicacion)
    );

    // Construir ruta recomendada
    const recorrido = sorted.map(
      (o) => `${o.ubicacion} → ${o.punto_entrega}`
    );

    setRutaRecomendada("Recorrido recomendado:\n" + recorrido.join("\n"));

    // Insertar pedidos en la ruta SI NO EXISTEN
    for (const pedido of sorted) {
      // Revisar si ya está asignado
      const { data: existe } = await supabase
        .from("delivery_route_items")
        .select("id")
        .eq("order_id", pedido.id)
        .eq("route_id", selectedRoute)
        .maybeSingle();

      if (existe) continue; // evita duplicados

      await supabase.from("delivery_route_items").insert([
        {
          route_id: selectedRoute,
          order_id: pedido.id,
          pickup_location: pedido.providers?.nombre_emprendimiento ?? "Proveedor",
          dropoff_location: pedido.punto_entrega,
          scheduled_time: pedido.franja_horaria,
        },
      ]);
    }

    alert("Pedidos asignados correctamente a la ruta.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>RF-AE-01-3: Optimización de recorrido</Text>

      {/* SELECTOR DE RUTA */}
      <Text style={styles.label}>Seleccione ruta</Text>
      <Picker
        selectedValue={selectedRoute}
        onValueChange={setSelectedRoute}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione una ruta" value="" />
        {routes.map((r) => (
          <Picker.Item
            key={r.id}
            label={`Ruta ${r.id} - ${r.conductor} (${r.vehiculo})`}
            value={r.id}
          />
        ))}
      </Picker>

      {/* BOTÓN DE OPTIMIZAR */}
      <TouchableOpacity style={styles.btn} onPress={handleOptimizarRuta}>
        <Text style={styles.btnText}>Optimizar ruta</Text>
      </TouchableOpacity>

      {rutaRecomendada !== "" && (
        <Text style={styles.success}>{rutaRecomendada}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#1976D2" },
  label: { fontWeight: "bold", marginBottom: 4, color: "#1976D2" },
  picker: { backgroundColor: "#f5f5f5", marginBottom: 10 },
  btn: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginVertical: 8,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  success: { marginTop: 20, color: "green", fontWeight: "bold", whiteSpace: "pre-line" },
});

export default AERecorridoOptScreen;
