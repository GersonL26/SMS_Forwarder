import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MensajeSms, EstadoMensaje } from '../../domain/entidades/MensajeSms';

const ICONOS_ESTADO: Record<EstadoMensaje, string> = {
  [EstadoMensaje.REENVIADO]: '✅',
  [EstadoMensaje.FILTRADO]: '🚫',
  [EstadoMensaje.ERROR]: '⚠️',
};

const COLORES_ESTADO: Record<EstadoMensaje, string> = {
  [EstadoMensaje.REENVIADO]: '#4CAF50',
  [EstadoMensaje.FILTRADO]: '#78909C',
  [EstadoMensaje.ERROR]: '#F44336',
};

const COLORES_FONDO_ESTADO: Record<EstadoMensaje, string> = {
  [EstadoMensaje.REENVIADO]: '#E8F5E9',
  [EstadoMensaje.FILTRADO]: '#ECEFF1',
  [EstadoMensaje.ERROR]: '#FFEBEE',
};

const ETIQUETAS_ESTADO: Record<EstadoMensaje, string> = {
  [EstadoMensaje.REENVIADO]: 'Reenviado',
  [EstadoMensaje.FILTRADO]: 'Filtrado',
  [EstadoMensaje.ERROR]: 'Error',
};

interface Props {
  mensaje: MensajeSms;
}

export const TarjetaMensaje: React.FC<Props> = ({ mensaje }) => {
  const colorEstado = COLORES_ESTADO[mensaje.estado];
  const fondoEstado = COLORES_FONDO_ESTADO[mensaje.estado];

  return (
    <View style={[estilos.contenedor, { borderLeftColor: colorEstado }]}>
      <View style={estilos.encabezado}>
        <View style={estilos.infoRemitente}>
          <Text style={estilos.iconoRemitente}>👤</Text>
          <Text style={estilos.remitente} numberOfLines={1}>
            {mensaje.remitente}
          </Text>
        </View>
        <View
          style={[estilos.insigniaEstado, { backgroundColor: fondoEstado }]}
        >
          <Text style={estilos.iconoEstado}>
            {ICONOS_ESTADO[mensaje.estado]}
          </Text>
          <Text style={[estilos.textoEstado, { color: colorEstado }]}>
            {ETIQUETAS_ESTADO[mensaje.estado]}
          </Text>
        </View>
      </View>

      <Text style={estilos.cuerpo} numberOfLines={2}>
        {mensaje.cuerpo}
      </Text>

      <View style={estilos.pieDetarjeta}>
        <Text style={estilos.fecha}>
          🕐 {mensaje.fechaHora.toLocaleString()}
        </Text>
      </View>

      {mensaje.motivoError && (
        <View style={estilos.contenedorError}>
          <Text style={estilos.error}>⚠️ {mensaje.motivoError}</Text>
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 5,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoRemitente: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconoRemitente: {
    fontSize: 14,
    marginRight: 6,
  },
  remitente: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  insigniaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  iconoEstado: {
    fontSize: 11,
    marginRight: 4,
  },
  textoEstado: {
    fontSize: 12,
    fontWeight: '700',
  },
  cuerpo: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  pieDetarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fecha: {
    fontSize: 11,
    color: '#999',
  },
  contenedorError: {
    backgroundColor: '#FFF3F3',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  error: {
    fontSize: 12,
    color: '#D32F2F',
  },
});