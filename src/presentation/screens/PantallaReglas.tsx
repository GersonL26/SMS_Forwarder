import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useReglas } from '../hooks/useReglas';
import { FormularioRegla } from '../components/FormularioRegla';
import { ReglaDeReenvio, CampoObjetivo } from '../../domain/entities/ReglaDeReenvio';

export const PantallaReglas: React.FC = () => {
  const { reglas, cargando, crear, editar, eliminar, alternarEstado } =
    useReglas();
  const [modalVisible, setModalVisible] = useState(false);
  const [reglaEditando, setReglaEditando] = useState<
    ReglaDeReenvio | undefined
  >();

  const abrirFormularioNuevo = () => {
    setReglaEditando(undefined);
    setModalVisible(true);
  };

  const abrirFormularioEdicion = (regla: ReglaDeReenvio) => {
    setReglaEditando(regla);
    setModalVisible(true);
  };

  const manejarGuardado = async (
    datos: Omit<ReglaDeReenvio, 'id'>,
  ) => {
    if (reglaEditando) {
      await editar({ ...datos, id: reglaEditando.id });
    } else {
      await crear(datos);
    }
    setModalVisible(false);
  };

  const confirmarEliminacion = (regla: ReglaDeReenvio) => {
    Alert.alert(
      'Eliminar regla',
      `¿Eliminar la regla "${regla.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminar(regla.id),
        },
      ],
    );
  };

  const obtenerIconoCampo = (campo: CampoObjetivo) =>
    campo === CampoObjetivo.REMITENTE ? '👤' : '📝';

  const renderizarRegla = useCallback(
    ({ item }: { item: ReglaDeReenvio }) => (
      <View
        style={[
          estilos.tarjetaRegla,
          { borderLeftColor: item.activa ? '#4CAF50' : '#BDBDBD' },
        ]}
      >
        <TouchableOpacity
          style={estilos.infoRegla}
          onPress={() => abrirFormularioEdicion(item)}
          activeOpacity={0.6}
        >
          <View style={estilos.filaEncabezado}>
            <Text style={estilos.nombreRegla}>{item.nombre}</Text>
            {!item.activa && (
              <View style={estilos.insigniaInactiva}>
                <Text style={estilos.textoInactiva}>Inactiva</Text>
              </View>
            )}
          </View>
          <View style={estilos.filaDetalle}>
            <Text style={estilos.iconoCampo}>
              {obtenerIconoCampo(item.campoObjetivo)}
            </Text>
            <Text style={estilos.detalleRegla}>
              {item.campoObjetivo === CampoObjetivo.REMITENTE
                ? 'Remitente'
                : 'Cuerpo'}{' '}
              ·{' '}
              {item.esRegex ? '🔣 Regex' : '📄 Texto'}: {item.patron}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={estilos.accionesRegla}>
          <Switch
            value={item.activa}
            onValueChange={() => alternarEstado(item.id)}
            trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
            thumbColor={item.activa ? '#4CAF50' : '#BDBDBD'}
          />
          <TouchableOpacity
            onPress={() => confirmarEliminacion(item)}
            style={estilos.botonEliminar}
            activeOpacity={0.6}
          >
            <Text style={estilos.textoEliminar}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [alternarEstado],
  );

  const renderizarVacio = () => (
    <View style={estilos.vacio}>
      <Text style={estilos.iconoVacio}>📋</Text>
      <Text style={estilos.textoVacio}>No hay reglas configuradas</Text>
      <Text style={estilos.textoSubtitulo}>
        Crea una regla para empezar a filtrar y reenviar SMS automáticamente
      </Text>
    </View>
  );

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {reglas.length > 0 && (
        <View style={estilos.resumen}>
          <Text style={estilos.textoResumen}>
            📊 {reglas.filter((r) => r.activa).length} activas de{' '}
            {reglas.length} reglas
          </Text>
        </View>
      )}

      <FlatList
        data={reglas}
        keyExtractor={(item) => item.id}
        renderItem={renderizarRegla}
        ListEmptyComponent={renderizarVacio}
        contentContainerStyle={
          reglas.length === 0 ? estilos.listaVacia : estilos.lista
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={estilos.botonAgregar}
        onPress={abrirFormularioNuevo}
        activeOpacity={0.8}
      >
        <Text style={estilos.textoAgregar}>➕ Nueva regla</Text>
      </TouchableOpacity>

      <FormularioRegla
        visible={modalVisible}
        reglaExistente={reglaEditando}
        onGuardar={manejarGuardado}
        onCancelar={() => setModalVisible(false)}
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
  resumen: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoResumen: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1565C0',
  },
  lista: {
    paddingVertical: 4,
    paddingBottom: 8,
  },
  listaVacia: {
    flex: 1,
  },
  tarjetaRegla: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  infoRegla: {
    flex: 1,
    marginRight: 12,
  },
  filaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nombreRegla: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  insigniaInactiva: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  textoInactiva: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E65100',
  },
  filaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconoCampo: {
    fontSize: 13,
    marginRight: 6,
  },
  detalleRegla: {
    fontSize: 13,
    color: '#78909C',
    flex: 1,
  },
  accionesRegla: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  botonEliminar: {
    padding: 6,
  },
  textoEliminar: {
    fontSize: 18,
  },
  botonAgregar: {
    backgroundColor: '#1565C0',
    margin: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  textoAgregar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
