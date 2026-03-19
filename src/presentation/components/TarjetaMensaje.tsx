import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MensajeSms, EstadoMensaje } from '../../domain/entities/MensajeSms';
import { COLORES, SOMBRAS, BORDES } from '../theme/colores';

const ICONOS_ESTADO: Record<EstadoMensaje, string> = {
  [EstadoMensaje.REENVIADO]: '✅',
  [EstadoMensaje.FILTRADO]: '🚫',
  [EstadoMensaje.ERROR]: '⚠️',
};

const COLORES_ESTADO: Record<EstadoMensaje, { texto: string; fondo: string }> = {
  [EstadoMensaje.REENVIADO]: { texto: COLORES.exito, fondo: COLORES.exitoFondo },
  [EstadoMensaje.FILTRADO]: { texto: COLORES.filtrado, fondo: COLORES.filtradoFondo },
  [EstadoMensaje.ERROR]: { texto: COLORES.error, fondo: COLORES.errorFondo },
};

const ETIQUETAS_ESTADO: Record<EstadoMensaje, string> = {
  [EstadoMensaje.REENVIADO]: 'Reenviado',
  [EstadoMensaje.FILTRADO]: 'Filtrado',
  [EstadoMensaje.ERROR]: 'Error',
};

interface Props {
  mensaje: MensajeSms;
  onReintentar?: (mensaje: MensajeSms) => void;
}

export const TarjetaMensaje: React.FC<Props> = ({ mensaje, onReintentar }) => {
  const estado = COLORES_ESTADO[mensaje.estado];

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <View style={estilos.infoRemitente}>
          <View style={estilos.avatarRemitente}>
            <Text style={estilos.iconoRemitente}>👤</Text>
          </View>
          <Text style={estilos.remitente} numberOfLines={1}>
            {mensaje.remitente}
          </Text>
        </View>
        <View style={[estilos.insigniaEstado, { backgroundColor: estado.fondo }]}>
          <Text style={estilos.iconoEstado}>
            {ICONOS_ESTADO[mensaje.estado]}
          </Text>
          <Text style={[estilos.textoEstado, { color: estado.texto }]}>
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
          {onReintentar && mensaje.estado === EstadoMensaje.ERROR && (
            <TouchableOpacity
              style={estilos.botonReintentar}
              onPress={() => onReintentar(mensaje)}
              activeOpacity={0.7}
            >
              <Text style={estilos.textoReintentar}>🔄 Reintentar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: BORDES.radio.md,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORES.tarjetaBorde,
    ...SOMBRAS.suave,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoRemitente: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarRemitente: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconoRemitente: {
    fontSize: 14,
  },
  remitente: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.texto,
    flex: 1,
  },
  insigniaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  iconoEstado: {
    fontSize: 11,
    marginRight: 4,
  },
  textoEstado: {
    fontSize: 11,
    fontWeight: '700',
  },
  cuerpo: {
    fontSize: 14,
    color: COLORES.textoSecundario,
    lineHeight: 20,
    marginBottom: 10,
  },
  pieDetarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fecha: {
    fontSize: 11,
    color: COLORES.textoSutil,
  },
  contenedorError: {
    backgroundColor: COLORES.errorFondo,
    padding: 10,
    borderRadius: BORDES.radio.sm,
    marginTop: 10,
  },
  error: {
    fontSize: 12,
    color: COLORES.error,
  },
  botonReintentar: {
    marginTop: 8,
    backgroundColor: COLORES.error,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BORDES.radio.sm,
    alignSelf: 'flex-start',
  },
  textoReintentar: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});