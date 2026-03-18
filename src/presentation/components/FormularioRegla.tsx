import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ReglaDeReenvio,
  CampoObjetivo,
} from '../../domain/entities/ReglaDeReenvio';

interface Props {
  visible: boolean;
  reglaExistente?: ReglaDeReenvio;
  onGuardar: (datos: Omit<ReglaDeReenvio, 'id'>) => void;
  onCancelar: () => void;
}

export const FormularioRegla: React.FC<Props> = ({
  visible,
  reglaExistente,
  onGuardar,
  onCancelar,
}) => {
  const [nombre, setNombre] = useState('');
  const [campoObjetivo, setCampoObjetivo] = useState<CampoObjetivo>(
    CampoObjetivo.REMITENTE,
  );
  const [patron, setPatron] = useState('');
  const [esRegex, setEsRegex] = useState(false);
  const [activa, setActiva] = useState(true);

  useEffect(() => {
    if (visible) {
      setNombre(reglaExistente?.nombre ?? '');
      setCampoObjetivo(reglaExistente?.campoObjetivo ?? CampoObjetivo.REMITENTE);
      setPatron(reglaExistente?.patron ?? '');
      setEsRegex(reglaExistente?.esRegex ?? false);
      setActiva(reglaExistente?.activa ?? true);
    }
  }, [visible, reglaExistente]);

  const manejarGuardado = () => {
    if (!nombre.trim() || !patron.trim()) return;
    onGuardar({ nombre, campoObjetivo, patron, esRegex, activa });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={estilos.fondo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={estilos.contenedorExterior}>
          <ScrollView
            style={estilos.contenedor}
            showsVerticalScrollIndicator={false}
          >
            {/* Barra indicadora */}
            <View style={estilos.barraIndicadora}>
              <View style={estilos.indicador} />
            </View>

            <Text style={estilos.titulo}>
              {reglaExistente ? '✏️ Editar regla' : '➕ Nueva regla'}
            </Text>

            {/* Nombre */}
            <Text style={estilos.etiqueta}>📝 Nombre de la regla</Text>
            <TextInput
              style={estilos.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Alertas del banco"
              placeholderTextColor="#B0BEC5"
            />

            {/* Campo objetivo */}
            <Text style={estilos.etiqueta}>🎯 Aplicar sobre</Text>
            <View style={estilos.filaBotones}>
              <TouchableOpacity
                style={[
                  estilos.botonOpcion,
                  campoObjetivo === CampoObjetivo.REMITENTE &&
                    estilos.botonSeleccionado,
                ]}
                onPress={() => setCampoObjetivo(CampoObjetivo.REMITENTE)}
                activeOpacity={0.7}
              >
                <Text style={estilos.iconoOpcion}>👤</Text>
                <Text
                  style={[
                    estilos.textoOpcion,
                    campoObjetivo === CampoObjetivo.REMITENTE &&
                      estilos.textoSeleccionado,
                  ]}
                >
                  Remitente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  estilos.botonOpcion,
                  campoObjetivo === CampoObjetivo.CUERPO &&
                    estilos.botonSeleccionado,
                ]}
                onPress={() => setCampoObjetivo(CampoObjetivo.CUERPO)}
                activeOpacity={0.7}
              >
                <Text style={estilos.iconoOpcion}>💬</Text>
                <Text
                  style={[
                    estilos.textoOpcion,
                    campoObjetivo === CampoObjetivo.CUERPO &&
                      estilos.textoSeleccionado,
                  ]}
                >
                  Cuerpo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Patrón */}
            <Text style={estilos.etiqueta}>🔍 Patrón de búsqueda</Text>
            <TextInput
              style={estilos.input}
              value={patron}
              onChangeText={setPatron}
              placeholder={esRegex ? 'Ej: \\d{6}' : 'Ej: banco'}
              placeholderTextColor="#B0BEC5"
              autoCapitalize="none"
            />

            {/* Switches */}
            <View style={estilos.contenedorSwitches}>
              <View style={estilos.filaSwitch}>
                <View style={estilos.infoSwitch}>
                  <Text style={estilos.etiquetaSwitch}>🔣 Expresión regular</Text>
                  <Text style={estilos.ayudaSwitch}>
                    Permite patrones avanzados como \d{'{'}6{'}'}
                  </Text>
                </View>
                <Switch
                  value={esRegex}
                  onValueChange={setEsRegex}
                  trackColor={{ false: '#E0E0E0', true: '#BBDEFB' }}
                  thumbColor={esRegex ? '#1565C0' : '#BDBDBD'}
                />
              </View>

              <View style={estilos.separador} />

              <View style={estilos.filaSwitch}>
                <View style={estilos.infoSwitch}>
                  <Text style={estilos.etiquetaSwitch}>⚡ Regla activa</Text>
                  <Text style={estilos.ayudaSwitch}>
                    Solo las reglas activas filtran SMS
                  </Text>
                </View>
                <Switch
                  value={activa}
                  onValueChange={setActiva}
                  trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                  thumbColor={activa ? '#4CAF50' : '#BDBDBD'}
                />
              </View>
            </View>

            {/* Botones de acción */}
            <View style={estilos.filaBotonesAccion}>
              <TouchableOpacity
                style={estilos.botonCancelar}
                onPress={onCancelar}
                activeOpacity={0.7}
              >
                <Text style={estilos.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={estilos.botonGuardar}
                onPress={manejarGuardado}
                activeOpacity={0.8}
              >
                <Text style={estilos.textoGuardar}>💾 Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  contenedorExterior: {
    maxHeight: '85%',
  },
  contenedor: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  barraIndicadora: {
    alignItems: 'center',
    marginBottom: 8,
  },
  indicador: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
    color: '#455A64',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonOpcion: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  botonSeleccionado: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  iconoOpcion: {
    fontSize: 18,
    marginBottom: 4,
  },
  textoOpcion: {
    color: '#555',
    fontWeight: '600',
    fontSize: 13,
  },
  textoSeleccionado: {
    color: '#FFFFFF',
  },
  contenedorSwitches: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  filaSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoSwitch: {
    flex: 1,
    marginRight: 12,
  },
  etiquetaSwitch: {
    fontSize: 14,
    fontWeight: '600',
    color: '#455A64',
  },
  ayudaSwitch: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  filaBotonesAccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
    gap: 10,
  },
  botonCancelar: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  textoCancelar: {
    color: '#78909C',
    fontWeight: '700',
    fontSize: 15,
  },
  botonGuardar: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    elevation: 2,
  },
  textoGuardar: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
