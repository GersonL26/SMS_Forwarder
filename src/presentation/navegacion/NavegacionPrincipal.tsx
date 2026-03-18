import React from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PantallaInicio } from '../pantallas/PantallaInicio';
import { PantallaReglas } from '../pantallas/PantallaReglas';
import { PantallaConfiguracion } from '../pantallas/PantallaConfiguracion';

const Tab = createBottomTabNavigator();

const ICONOS_TAB: Record<string, { activo: string; inactivo: string }> = {
  Inicio: { activo: '📱', inactivo: '📱' },
  Reglas: { activo: '📋', inactivo: '📋' },
  Configuracion: { activo: '⚙️', inactivo: '⚙️' },
};

export const NavegacionPrincipal: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => {
              const iconos = ICONOS_TAB[route.name];
              return (
                <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
                  {focused ? iconos.activo : iconos.inactivo}
                </Text>
              );
            },
            tabBarActiveTintColor: '#1565C0',
            tabBarInactiveTintColor: '#9E9E9E',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 0,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              paddingTop: 4,
              paddingBottom: Platform.OS === 'android' ? 12 : 0,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: '#1565C0',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
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
              title: 'Configuración',
              tabBarLabel: 'Config',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
