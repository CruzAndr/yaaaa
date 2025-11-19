// AERegistroPlatoScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../Supabase/supabaseClient';

export default function AERegistroPlatoScreen() {

  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState('');

  const [nombrePlato, setNombrePlato] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ingredientes, setIngredientes] = useState('');
  const [precio, setPrecio] = useState('');

  const [tipoAlimento, setTipoAlimento] = useState('');

  const categorias = [
    { label: 'Desayuno', value: 'desayuno' },
    { label: 'Almuerzo', value: 'almuerzo' },
    { label: 'Cena', value: 'cena' },
    { label: 'Merienda', value: 'merienda' },
    { label: 'Saludable', value: 'saludable' },
  ];

  const [nutricion, setNutricion] = useState({
    grasas: '',
    proteinas: '',
    calorias: '',
    carbohidratos: ''
  });

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);


  // ======================================
  // 🔹 1. Cargar proveedores
  // ======================================
  useEffect(() => {
    const fetchProviders = async () => {

      const { data, error } = await supabase
        .from('providers')
        .select('id, nombre_emprendimiento, estado');

      if (!error) setProviders(data);
    };

    fetchProviders();
  }, []);


  // ======================================
  // 🔹 2. Elegir imagen
  // ======================================
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };


  // ======================================
  // 🔹 3. Registrar plato
  // ======================================
  const handleRegistrarPlato = async () => {

    if (!providerId || !nombrePlato || !ingredientes || !precio || !descripcion || !tipoAlimento) {
      alert("Debe completar todos los campos, incluyendo descripción y tipo de alimento.");
      return;
    }

    setUploading(true);

    try {

      let imagePath = null;

      // SUBIR IMAGEN
      if (image) {

        const fileExt = image.split('.').pop();
        const fileName = `${providerId}_${Date.now()}.${fileExt}`;

        const response = await fetch(image);
        const buffer = await response.arrayBuffer();
        const fileData = new Uint8Array(buffer);

        const { error: uploadError } = await supabase.storage
          .from('Imagenes')
          .upload(fileName, fileData, {
            contentType: `image/${fileExt}`
          });

        if (uploadError) throw uploadError;

        imagePath = fileName;
      }

      // INSERTAR PLATO
      const { error: insertError } = await supabase
        .from('dishes')
        .insert([
          {
            provider_id: providerId,
            nombre: nombrePlato,
            descripcion: descripcion,
            ingredientes: ingredientes,
            precio: Number(precio),
            disponibilidad: true,
            is_active: true,
            tipo_alimento: tipoAlimento,
            valor_nutricional: {
              grasas: nutricion.grasas,
              proteinas: nutricion.proteinas,
              calorias: nutricion.calorias,
              carbohidratos: nutricion.carbohidratos
            },
            image_url: imagePath
          }
        ]);

      if (insertError) throw insertError;

      alert("Plato registrado correctamente.");

      // RESET FORMULARIO
      setNombrePlato('');
      setDescripcion('');
      setIngredientes('');
      setPrecio('');
      setNutricion({ grasas:'', proteinas:'', calorias:'', carbohidratos:'' });
      setTipoAlimento('');
      setImage(null);
      setProviderId('');

    } catch (err) {
      alert("Error al registrar plato: " + err.message);
      console.log(err);
    }

    setUploading(false);
  };


  // ======================================
  // 🔹 UI
  // ======================================
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro de Platos — RF-AE-01-4</Text>

      {/* Proveedor */}
      <Text style={styles.label}>Proveedor</Text>
      <Picker selectedValue={providerId} onValueChange={setProviderId} style={styles.picker}>
        <Picker.Item label="Seleccione un proveedor" value="" />
        {providers.map(p => (
          <Picker.Item key={p.id} label={`${p.nombre_emprendimiento}`} value={p.id} />
        ))}
      </Picker>

      {/* Nombre */}
      <TextInput style={styles.input} placeholder="Nombre del plato" value={nombrePlato} onChangeText={setNombrePlato} />

      {/* Descripción */}
      <TextInput
        style={styles.input}
        placeholder="Descripción del plato"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      {/* Ingredientes */}
      <TextInput style={styles.input} placeholder="Ingredientes" value={ingredientes} onChangeText={setIngredientes} />

      {/* Precio */}
      <TextInput style={styles.input} placeholder="Precio" value={precio} onChangeText={setPrecio} keyboardType="numeric" />

      {/* Tipo alimento */}
      <Text style={styles.label}>Tipo de alimento:</Text>
      <Picker selectedValue={tipoAlimento} onValueChange={setTipoAlimento} style={styles.picker}>
        <Picker.Item label="Seleccione tipo de alimento" value="" />
        {categorias.map(c => (
          <Picker.Item key={c.value} label={c.label} value={c.value} />
        ))}
      </Picker>

      {/* Nutrición */}
      <Text style={styles.label}>Información Nutricional</Text>

      <TextInput style={styles.input} placeholder="Grasas" value={nutricion.grasas}
        onChangeText={v => setNutricion({ ...nutricion, grasas: v })} />

      <TextInput style={styles.input} placeholder="Proteínas" value={nutricion.proteinas}
        onChangeText={v => setNutricion({ ...nutricion, proteinas: v })} />

      <TextInput style={styles.input} placeholder="Calorías" value={nutricion.calorias}
        onChangeText={v => setNutricion({ ...nutricion, calorias: v })} />

      <TextInput style={styles.input} placeholder="Carbohidratos" value={nutricion.carbohidratos}
        onChangeText={v => setNutricion({ ...nutricion, carbohidratos: v })} />

      {/* Imagen */}
      <TouchableOpacity style={styles.btn} onPress={pickImage}>
        <Text style={styles.btnText}>Seleccionar imagen</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.btn} onPress={handleRegistrarPlato}>
        <Text style={styles.btnText}>{uploading ? "Guardando..." : "Registrar plato"}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1976D2' },
  input: { backgroundColor: '#eee', padding: 10, borderRadius: 8, marginTop: 10 },
  label: { fontWeight: 'bold', color: '#1976D2', marginTop: 20 },
  picker: { backgroundColor: '#eee', marginTop: 10, borderRadius: 8 },
  btn: { backgroundColor: '#1976D2', padding: 12, marginTop: 20, borderRadius: 8 },
  btnText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  imagePreview: { width: 200, height: 140, marginTop: 10, borderRadius: 10 }
});
