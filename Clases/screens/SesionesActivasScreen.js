import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const fakeSessions = [
  {
    id: 'sess-1',
    dispositivo: 'Chrome en Windows',
    agente: 'Mozilla/5.0',
    direccion_ip: '190.12.34.56',
    ubicacion_aproximada: 'San José, Costa Rica',
    fecha_inicio: '2025-11-19 08:00',
  },
  {
    id: 'sess-2',
    dispositivo: 'Safari en iPhone',
    agente: 'Mobile Safari',
    direccion_ip: '181.45.67.89',
    ubicacion_aproximada: 'Cartago, Costa Rica',
    fecha_inicio: '2025-11-18 22:15',
  },
  {
    id: 'sess-3',
    dispositivo: 'Firefox en Linux',
    agente: 'Mozilla/5.0',
    direccion_ip: '200.55.66.77',
    ubicacion_aproximada: 'Heredia, Costa Rica',
    fecha_inicio: '2025-11-17 14:30',
  },
];

export default function SesionesActivasScreen() {
  const [sessions, setSessions] = useState(fakeSessions);

  const handleCerrarSesion = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 18 }}>Sesiones activas</Text>
      {sessions.map(s => (
        <View key={s.id} style={{ backgroundColor: '#F3F3F3', borderRadius: 14, padding: 18, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="wifi" size={32} color="#276EF1" style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{s.dispositivo}</Text>
            <Text style={{ color: '#555' }}>IP: {s.direccion_ip} | {s.ubicacion_aproximada}</Text>
            <Text style={{ color: '#777', fontSize: 13 }}>Inicio: {s.fecha_inicio}</Text>
          </View>
          <TouchableOpacity style={{ marginLeft: 12, backgroundColor: '#E53935', borderRadius: 8, padding: 8 }} onPress={() => handleCerrarSesion(s.id)}>
            <MaterialIcons name="logout" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
      {sessions.length === 0 && <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No hay sesiones activas.</Text>}
    </ScrollView>
  );
}
