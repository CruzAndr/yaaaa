import AccountRecoveryScreen from './screens/AccountRecoveryScreen';
import AuditLogScreen from './screens/AuditLogScreen';
import ConsultarUsuariosScreen from './screens/ConsultarUsuariosScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';
import CartScreen from './screens/CartScreen';
import AEInventarioPedidosScreen from '../AE/AEInventarioPedidosScreen';
import AEModuleMenuScreen from '../AE/AEModuleMenuScreen';
import AEDarBajaPlatoScreen from '../AE/AEDarBajaPlatoScreen';
import AEActualizarPlatoScreen from '../AE/AEActualizarPlatoScreen';
import AEBusquedaPlatoScreen from '../AE/AEBusquedaPlatoScreen';
import SelectAddressScreen from './screens/SelectAddressScreen';
import AERegistroPlatoScreen from '../AE/AERegistroPlatoScreen';
import AERecorridoOptScreen from '../AE/AERecorridoOptScreen';
import ProviderRegisterScreen from '../AE/ProviderRegisterScreen';
import ProveedorGestionScreen from './screens/ProveedorGestionScreen';
import React, { useState, useEffect } from 'react';
import RoleChangeScreen from './screens/RoleChangeScreen';
import { CartProvider } from './contexts/CartContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import ProductDetailScreen from './screens/paymentZone/ProductDetailScreen';
import TwoFactorAuthScreen from './screens/paymentZone/TwoFactorAuthScreen';
import SecurePaymentScreen from './screens/paymentZone/SecurePaymentScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import ChoiceScreen from './screens/ChoiceScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import TiendasScreen from './screens/TiendasScreen';
import VerificationMethodScreen from './screens/VerificationMethodScreen';
import EmailCodeScreen from './screens/EmailCodeScreen';
import FingerprintScreen from './screens/FingerprintScreen';
import CreatePasswordScreen from './screens/CreatePasswordScreen';
import SuccessScreen from './screens/SuccessScreen';
import ProfileIntroScreen from './screens/ProfileIntroScreen';
import ProfileScreen from './screens/ProfileScreen';
import SesionesActivasScreen from './screens/SesionesActivasScreen';
import AEModuleScreen from '../AE/AEModuleScreen';
import AEMenuGestionScreen from '../AE/AEMenuGestionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // ...existing code...
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async () => {
    // Guarda la sesión al iniciar (opcional, puedes quitar si no usas token)
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
  };

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="SecurePaymentScreen" options={{ headerShown: false }} component={SecurePaymentScreen} />
          <Stack.Screen name="TwoFactorAuth" options={{ headerShown: false }} component={TwoFactorAuthScreen} />
          <Stack.Screen name="SelectAddressScreen" options={{ title: 'Dirección de entrega', headerShown: true }} component={SelectAddressScreen} />
          <Stack.Screen name="OrderConfirmationScreen" options={{ title: 'Confirmar pedido', headerShown: true }} component={OrderConfirmationScreen} />
          <Stack.Screen name="ProfileIntro" options={{ headerShown: false }} component={ProfileIntroScreen} />
          <Stack.Screen name="Profile" options={{ headerShown: false }} component={ProfileScreen} />
          <Stack.Screen name="SesionesActivas" options={{ title: 'Sesiones activas', headerShown: true }} component={SesionesActivasScreen} />
          <Stack.Screen name="AEModuleMenu" component={AEModuleMenuScreen} options={{ title: 'Módulo AE' }} />
          <Stack.Screen name="AEModule" component={AEModuleScreen} options={{ title: 'Módulo AE' }} />
          <Stack.Screen name="AEMenuGestion" component={AEMenuGestionScreen} options={{ title: 'Gestión de Menús Saludables' }} />
          <Stack.Screen name="AERecorridoOpt" component={AERecorridoOptScreen} options={{ title: 'Optimización de Recorrido' }} />
          <Stack.Screen name="AERegistroPlato" component={AERegistroPlatoScreen} options={{ title: 'Registro de Platos' }} />
          <Stack.Screen name="AEBusquedaPlato" component={AEBusquedaPlatoScreen} options={{ title: 'Búsqueda de Platos' }} />
          <Stack.Screen name="AEActualizarPlato" component={AEActualizarPlatoScreen} options={{ title: 'Actualizar Plato' }} />
          <Stack.Screen name="AEDarBajaPlato" component={AEDarBajaPlatoScreen} options={{ title: 'Dar de Baja Plato' }} />
          <Stack.Screen name="AEInventarioPedidos" component={AEInventarioPedidosScreen} options={{ title: 'Inventario y Pedidos' }} />
          <Stack.Screen name="Welcome" options={{ headerShown: false }} component={WelcomeScreen} />
          <Stack.Screen name="Choice" options={{ headerShown: false }} component={ChoiceScreen} />
          <Stack.Screen name="Login" options={{ headerShown: false }} >
            {props => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen name="RecoverPassword" options={{ headerShown: false }} component={require('./screens/RecoverPasswordScreen').default} />
          <Stack.Screen name="LocalResetCode" options={{ headerShown: false }} component={require('./screens/LocalResetCodeScreen').default} />
          <Stack.Screen name="LocalChangePassword" options={{ headerShown: false }} component={require('./screens/LocalChangePasswordScreen').default} />
          <Stack.Screen name="Register" options={{ headerShown: false }} component={RegisterScreen} />
          <Stack.Screen name="VerificationMethod" options={{ headerShown: false }} component={VerificationMethodScreen} />
          <Stack.Screen name="EmailCode" options={{ headerShown: false }} component={EmailCodeScreen} />
          <Stack.Screen name="Fingerprint" options={{ headerShown: false }} component={FingerprintScreen} />
          <Stack.Screen name="CreatePassword" options={{ headerShown: false }} component={CreatePasswordScreen} />
          <Stack.Screen name="Home" options={{ headerShown: false }} >
            {props => <HomeScreen {...props} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="TiendasScreen" options={{ headerShown: false }} component={TiendasScreen} />
          <Stack.Screen name="Success" options={{ headerShown: false }} component={SuccessScreen} />
          <Stack.Screen name="ProductDetailScreen" options={{ headerShown: false }} component={ProductDetailScreen} />
          <Stack.Screen name="CartScreen" options={{ title: 'Carrito', headerShown: true }} component={CartScreen} />
          <Stack.Screen name="ProviderRegister" options={{ title: 'Registro de Proveedor', headerShown: true }} component={ProviderRegisterScreen} />
          <Stack.Screen name="ProveedorGestion" options={{ title: 'Gestión de Proveedores' }} component={ProveedorGestionScreen} />
          <Stack.Screen name="ConsultarUsuarios" component={ConsultarUsuariosScreen} />
          <Stack.Screen name="AprobarProveedorScreen" component={ProveedorGestionScreen} />
          <Stack.Screen name="AprobarPlatillosScreen" component={AEMenuGestionScreen} />
          <Stack.Screen name="RoleChangeScreen" component={RoleChangeScreen} options={{ title: 'Gestionar roles de usuario' }} />
          <Stack.Screen name="AuditLogScreen" component={AuditLogScreen} options={{ title: 'Bitácora de auditoría' }} />
          <Stack.Screen name="AccountRecoveryScreen" component={AccountRecoveryScreen} options={{ title: 'Recuperar cuenta bloqueada' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}