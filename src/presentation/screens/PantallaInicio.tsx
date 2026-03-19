import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useMensajes } from '../hooks/useMensajes';
import { IndicadorServicio } from '../components/IndicadorServicio';
import { TarjetaMensaje } from '../components/TarjetaMensaje';
import { FondoGradiente } from '../components/FondoGradiente';
import { MensajeSms, EstadoMensaje } from '../../domain/entities/MensajeSms';
import { COLORES, BORDES } from '../theme/colores';

type FiltroEstado = 'todos' | EstadoMensaje;

const OPCIONES_FILTRO: { clave: FiltroEstado; etiqueta: string; icono: string }[] = [
  { clave: 'todos', etiqueta: 'Todos', icono: '📋' },
  { clave: EstadoMensaje.REENVIADO, etiqueta: 'Reenviados', icono: '✅' },
  { clave: EstadoMensaje.FILTRADO, etiqueta: 'Filtrados', icono: '🚫' },
  { clave: EstadoMensaje.ERROR, etiqueta: 'Errores', icono: '⚠️' },
];

export const PantallaInicio: React.FC = () => {
  const { mensajes, cargando, servicioActivo, cargarMensajes, alternarServicio, reintentar } =
    useMensajes();
  const [filtroActivo, setFiltroActivo] = useState<FiltroEstado>('todos');

  const mensajesFiltrados = useMemo(() => {
    if (filtroActivo === 'todos') return mensajes;
    return mensajes.filter((m) => m.estado === filtroActivo);
  }, [mensajes, filtroActivo]);

  const renderizarMensaje = useCallback(
    ({ item }: { item: MensajeSms }) => (
      <TarjetaMensaje mensaje={item} onReintentar={reintentar} />
    ),
    [reintentar],
  );

  const renderizarVacio = () => (
    <View style={estilos.vacio}>
      <Text style={estilos.iconoVacio}>📭</Text>
      <Text style={estilos.textoVacio}>
        {filtroActivo === 'todos'
          ? 'No hay mensajes procesados aún'
          : 'No hay mensajes con este filtro'}
      </Text>
      <Text style={estilos.textoSubtitulo}>
        {filtroActivo === 'todos'
          ? 'Activa el servicio y los SMS interceptados aparecerán aquí automáticamente'
          : 'Prueba con otro filtro o espera nuevos mensajes'}
      </Text>
    </View>
  );

  if (cargando) {
    return (
      <FondoGradiente>
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={estilos.textoCargando}>Cargando mensajes...</Text>
        </View>
      </FondoGradiente>
    );
  }

  return (
    <FondoGradiente>
      <IndicadorServicio
        activo={servicioActivo}
        onAlternar={alternarServicio}
      />

      <View style={estilos.barraFiltros}>
        {OPCIONES_FILTRO.map((opcion) => (
          <TouchableOpacity
            key={opcion.clave}
            style={[
              estilos.botonFiltro,
              filtroActivo === opcion.clave && estilos.botonFiltroActivo,
            ]}
            onPress={() => setFiltroActivo(opcion.clave)}
            activeOpacity={0.7}
          >
            <Text style={estilos.iconoFiltro}>{opcion.icono}</Text>
            <Text
              style={[
                estilos.textoFiltro,
                filtroActivo === opcion.clave && estilos.textoFiltroActivo,
              ]}
            >
              {opcion.etiqueta}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={mensajesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderizarMensaje}
        ListEmptyComponent={renderizarVacio}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={cargarMensajes}
            colors={[COLORES.primario]}
            tintColor="#FFFFFF"
          />
        }
        contentContainerStyle={
          mensajesFiltrados.length === 0 ? estilos.listaVacia : estilos.lista
        }
        showsVerticalScrollIndicator={false}
      />
    </FondoGradiente>
  );
};

const estilos = StyleSheet.create({
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 14,
    color: COLORES.textoSecundario,
  },
  lista: {
    paddingVertical: 6,
    paddingBottom: 20,
  },
  listaVacia: {
    flex: 1,
  },
  barraFiltros: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    gap: 6,
  },
  botonFiltro: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: BORDES.radio.sm,
    backgroundColor: COLORES.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.tarjetaBorde,
  },
  botonFiltroActivo: {
    backgroundColor: COLORES.fondoTerciario,
    borderColor: COLORES.primario,
  },
  iconoFiltro: {
    fontSize: 12,
    marginRight: 4,
  },
  textoFiltro: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.textoSutil,
  },
  textoFiltroActivo: {
    color: COLORES.primario,
  },
  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconoVacio: {
    fontSize: 48,
    marginBottom: 16,
  },
  textoVacio: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORES.texto,
    textAlign: 'center',
  },
  textoSubtitulo: {
    fontSize: 14,
    color: COLORES.textoSecundario,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
