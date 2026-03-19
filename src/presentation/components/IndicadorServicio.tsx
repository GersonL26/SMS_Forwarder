import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORES, SOMBRAS, BORDES, GRADIENTES } from '../theme/colores';

interface Props {
  activo: boolean;
  onAlternar: () => void;
}

export const IndicadorServicio: React.FC<Props> = ({ activo, onAlternar }) => {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.indicador}>
        <View style={[estilos.punto, activo ? estilos.puntoActivo : estilos.puntoInactivo]} />
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>Servicio SMS</Text>
          <Text
            style={[
              estilos.estado,
              { color: activo ? COLORES.exito : COLORES.error },
            ]}
          >
            {activo ? 'Activo — interceptando' : 'Detenido'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onAlternar}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={activo ? [...GRADIENTES.botonError] : [...GRADIENTES.botonExito]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={estilos.boton}
        >
          <Text style={estilos.textoBoton}>
            {activo ? '⏹ Detener' : '▶ Iniciar'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORES.tarjeta,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    borderRadius: BORDES.radio.md,
    borderWidth: 1,
    borderColor: COLORES.tarjetaBorde,
    ...SOMBRAS.suave,
  },
  indicador: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  puntoActivo: {
    backgroundColor: COLORES.exito,
  },
  puntoInactivo: {
    backgroundColor: COLORES.error,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.texto,
  },
  estado: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  boton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BORDES.radio.sm,
    marginLeft: 8,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
