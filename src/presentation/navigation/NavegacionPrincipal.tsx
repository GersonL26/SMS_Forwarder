import React from 'react';
import { Text, Platform, View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PantallaInicio } from '../screens/PantallaInicio';
import { PantallaReglas } from '../screens/PantallaReglas';
import { PantallaConfiguracion } from '../screens/PantallaConfiguracion';
import { PantallaAjustes } from '../screens/PantallaAjustes';
import { COLORES, GRADIENTES } from '../theme/colores';

const Tab = createBottomTabNavigator();

const ICONOS_TAB: Record<string, { activo: string; inactivo: string }> = {
  Inicio: { activo: '📱', inactivo: '📱' },
  Reglas: { activo: '📋', inactivo: '📋' },
  Configuracion: { activo: '⚙️', inactivo: '⚙️' },
  Ajustes: { activo: '🔧', inactivo: '🔧' },
};

const NavegacionInterna: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const iconos = ICONOS_TAB[route.name];
          return (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.4 }}>
              {focused ? iconos.activo : iconos.inactivo}
            </Text>
          );
        },
        tabBarActiveTintColor: COLORES.tabBarActivo,
        tabBarInactiveTintColor: COLORES.tabBarInactivo,
        tabBarStyle: {
          backgroundColor: COLORES.tabBarFondo,
          borderTopWidth: 1,
          borderTopColor: COLORES.separador,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
          height: 56 + Math.max(insets.bottom, 6),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 0,
        },
        header: ({ options }) => (
          <LinearGradient
            colors={[...GRADIENTES.header]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[estilos.header, { paddingTop: Math.max(insets.top, 20) + 12 }]}
          >
            <Text style={estilos.headerTitulo}>
              {options.title ?? route.name}
            </Text>
          </LinearGradient>
        ),
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={PantallaInicio}
        options={{
          title: 'SMS Forwarder',
          tabBarLabel: 'Monitor',
        }}
      />
      <Tab.Screen
        name="Reglas"
        component={PantallaReglas}
        options={{
          title: 'Reglas de reenvío',
          tabBarLabel: 'Reglas',
        }}
      />
      <Tab.Screen
        name="Configuracion"
        component={PantallaConfiguracion}
        options={{
          title: 'Telegram',
          tabBarLabel: 'Config',
        }}
      />
      <Tab.Screen
        name="Ajustes"
        component={PantallaAjustes}
        options={{
          title: 'Ajustes',
          tabBarLabel: 'Ajustes',
        }}
      />
    </Tab.Navigator>
  );
};

export const NavegacionPrincipal: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <NavigationContainer>
        <NavegacionInterna />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const estilos = StyleSheet.create({
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
