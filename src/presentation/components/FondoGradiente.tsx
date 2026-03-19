import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORES } from '../theme/colores';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FondoGradiente: React.FC<Props> = ({ children, style }) => (
  <View style={[estilos.fondo, style]}>
    {children}
  </View>
);

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: COLORES.fondoPrincipal,
  },
});
