import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  activo: boolean;
  onAlternar: () => void;
}

export const IndicadorServicio: React.FC<Props> = ({ activo, onAlternar }) => {
  return (
    <View
      style={[
        estilos.contenedor,
        { borderLeftColor: activo ? '#4CAF50' : '#F44336' },
      ]}
    >
      <View style={estilos.indicador}>
        <Text style={estilos.icono}>{activo ? '🟢' : '🔴'}</Text>
        <View>
          <Text style={estilos.titulo}>Servicio de escucha</Text>
          <Text
            style={[
              estilos.estado,
              { color: activo ? '#4CAF50' : '#F44336' },
            ]}
          >
            {activo ? 'Activo — interceptando SMS' : 'Detenido'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          estilos.boton,
          activo ? estilos.botonDetener : estilos.botonIniciar,
        ]}
        onPress={onAlternar}
        activeOpacity={0.7}
      >
        <Text style={estilos.textoBoton}>
          {activo ? '⏹ Detener' : '▶ Iniciar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  indicador: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icono: {
    fontSize: 20,
    marginRight: 10,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  estado: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  boton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  botonIniciar: {
    backgroundColor: '#4CAF50',
  },
  botonDetener: {
    backgroundColor: '#F44336',
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
