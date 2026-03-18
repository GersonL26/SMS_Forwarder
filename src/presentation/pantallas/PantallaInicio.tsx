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
import { IndicadorServicio } from '../componentes/IndicadorServicio';
import { TarjetaMensaje } from '../componentes/TarjetaMensaje';
import { MensajeSms, EstadoMensaje } from '../../domain/entidades/MensajeSms';

type FiltroEstado = 'todos' | EstadoMensaje;

const OPCIONES_FILTRO: { clave: FiltroEstado; etiqueta: string; icono: string }[] = [
  { clave: 'todos', etiqueta: 'Todos', icono: '📋' },
  { clave: EstadoMensaje.REENVIADO, etiqueta: 'Reenviados', icono: '✅' },
  { clave: EstadoMensaje.FILTRADO, etiqueta: 'Filtrados', icono: '🚫' },
  { clave: EstadoMensaje.ERROR, etiqueta: 'Errores', icono: '⚠️' },
];

export const PantallaInicio: React.FC = () => {
  const { mensajes, cargando, servicioActivo, cargarMensajes, alternarServicio } =
    useMensajes();
  const [filtroActivo, setFiltroActivo] = useState<FiltroEstado>('todos');

  const mensajesFiltrados = useMemo(() => {
    if (filtroActivo === 'todos') return mensajes;
    return mensajes.filter((m) => m.estado === filtroActivo);
  }, [mensajes, filtroActivo]);

  const renderizarMensaje = useCallback(
    ({ item }: { item: MensajeSms }) => <TarjetaMensaje mensaje={item} />,
    [],
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
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={estilos.textoCargando}>Cargando mensajes...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
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
            colors={['#1565C0']}
          />
        }
        contentContainerStyle={
          mensajesFiltrados.length === 0 ? estilos.listaVacia : estilos.lista
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#EEF2F7',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2F7',
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  lista: {
    paddingVertical: 4,
    paddingBottom: 16,
  },
  listaVacia: {
    flex: 1,
  },
  barraFiltros: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    gap: 6,
  },
  botonFiltro: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  botonFiltroActivo: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  iconoFiltro: {
    fontSize: 12,
    marginRight: 4,
  },
  textoFiltro: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78909C',
  },
  textoFiltroActivo: {
    color: '#FFFFFF',
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
    color: '#444',
    textAlign: 'center',
  },
  textoSubtitulo: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
