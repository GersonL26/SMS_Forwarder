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
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ReglaDeReenvio,
  CampoObjetivo,
} from '../../domain/entities/ReglaDeReenvio';
import { ConfiguracionTelegram } from '../../domain/entities/ConfiguracionTelegram';
import { ContenedorDeDependencias } from '../../infrastructure/container/ContenedorDeDependencias';

import { COLORES, BORDES } from '../theme/colores';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const [configTelegramId, setConfigTelegramId] = useState('');
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionTelegram[]>([]);
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFin, setHorarioFin] = useState('');
  const [diasActivos, setDiasActivos] = useState<number[]>([]);
  const [avanzadoVisible, setAvanzadoVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  useEffect(() => {
    const cargar = async () => {
      try {
        const contenedor = ContenedorDeDependencias.obtenerInstancia();
        const configs = await contenedor.configurarTelegram.obtenerTodas();
        setConfiguraciones(configs);
      } catch {}
    };
    cargar();
  }, []);

  useEffect(() => {
    if (visible) {
      setNombre(reglaExistente?.nombre ?? '');
      setCampoObjetivo(reglaExistente?.campoObjetivo ?? CampoObjetivo.REMITENTE);
      setPatron(reglaExistente?.patron ?? '');
      setEsRegex(reglaExistente?.esRegex ?? false);
      setActiva(reglaExistente?.activa ?? true);
      setConfigTelegramId(reglaExistente?.configTelegramId ?? '');
      setHorarioInicio(reglaExistente?.horarioInicio ?? '');
      setHorarioFin(reglaExistente?.horarioFin ?? '');
      setDiasActivos(reglaExistente?.diasActivos ?? []);
      setAvanzadoVisible(
        !!(reglaExistente?.configTelegramId || reglaExistente?.horarioInicio || reglaExistente?.diasActivos?.length)
      );
    }
  }, [visible, reglaExistente]);

  const manejarGuardado = () => {
    if (!nombre.trim() || !patron.trim()) return;
    onGuardar({
      nombre,
      campoObjetivo,
      patron,
      esRegex,
      activa,
      configTelegramId: configTelegramId || undefined,
      horarioInicio: horarioInicio.trim() || undefined,
      horarioFin: horarioFin.trim() || undefined,
      diasActivos: diasActivos.length > 0 ? diasActivos : undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={estilos.fondo}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={estilos.contenedorExterior}>
          <ScrollView
            style={estilos.contenedor}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
              placeholderTextColor={COLORES.textoSutil}
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
              placeholderTextColor={COLORES.textoSutil}
              autoCapitalize="none"
            />

            {/* Opciones avanzadas */}
            <TouchableOpacity
              style={estilos.botonAvanzado}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setAvanzadoVisible(!avanzadoVisible);
              }}
              activeOpacity={0.7}
            >
              <Text style={estilos.textoAvanzado}>
                ⚙️ Opciones avanzadas
              </Text>
              <Text style={estilos.flechaAvanzado}>{avanzadoVisible ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {avanzadoVisible && (
              <View style={estilos.contenedorAvanzado}>
                <Text style={estilos.etiqueta}>🤖 Bot de Telegram</Text>
                {configuraciones.length === 0 ? (
                  <Text style={estilos.sinConfigs}>No hay bots configurados. Ve a Config para añadir uno.</Text>
                ) : (
                  <View style={estilos.listaConfigs}>
                    <TouchableOpacity
                      style={[
                        estilos.botonConfig,
                        !configTelegramId && estilos.botonConfigSeleccionado,
                      ]}
                      onPress={() => setConfigTelegramId('')}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        estilos.textoConfig,
                        !configTelegramId && estilos.textoConfigSeleccionado,
                      ]}>🌐 Bot predeterminado</Text>
                    </TouchableOpacity>
                    {configuraciones.map((cfg) => (
                      <TouchableOpacity
                        key={cfg.id}
                        style={[
                          estilos.botonConfig,
                          configTelegramId === cfg.id && estilos.botonConfigSeleccionado,
                        ]}
                        onPress={() => setConfigTelegramId(cfg.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          estilos.textoConfig,
                          configTelegramId === cfg.id && estilos.textoConfigSeleccionado,
                        ]}>🤖 {cfg.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={estilos.etiqueta}>🕐 Horario activo</Text>
                <View style={estilos.filaBotones}>
                  <TextInput
                    style={[estilos.input, { flex: 1 }]}
                    value={horarioInicio}
                    onChangeText={setHorarioInicio}
                    placeholder="Desde (HH:MM)"
                    placeholderTextColor={COLORES.textoSutil}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[estilos.input, { flex: 1 }]}
                    value={horarioFin}
                    onChangeText={setHorarioFin}
                    placeholder="Hasta (HH:MM)"
                    placeholderTextColor={COLORES.textoSutil}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={estilos.etiqueta}>📅 Días activos</Text>
                <View style={estilos.filaDias}>
                  {DIAS_SEMANA.map((dia, indice) => (
                    <TouchableOpacity
                      key={indice}
                      style={[
                        estilos.botonDia,
                        diasActivos.includes(indice) && estilos.botonDiaActivo,
                      ]}
                      onPress={() =>
                        setDiasActivos((prev) =>
                          prev.includes(indice)
                            ? prev.filter((d) => d !== indice)
                            : [...prev, indice],
                        )
                      }
                    >
                      <Text
                        style={[
                          estilos.textoDia,
                          diasActivos.includes(indice) && estilos.textoDiaActivo,
                        ]}
                      >
                        {dia}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

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
                  trackColor={{ false: COLORES.switchTrackInactivo, true: COLORES.switchTrackActivo }}
                  thumbColor={esRegex ? COLORES.switchThumbActivo : COLORES.switchThumbInactivo}
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
                  trackColor={{ false: COLORES.switchTrackInactivo, true: 'rgba(0, 230, 118, 0.3)' }}
                  thumbColor={activa ? COLORES.acento : COLORES.switchThumbInactivo}
                />
              </View>
            </View>

            {/* Botones de acción */}
            <View style={[estilos.filaBotonesAccion, { marginBottom: Math.max(insets.bottom, 12) + 12 }]}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  contenedorExterior: {
    maxHeight: '85%',
  },
  contenedor: {
    backgroundColor: COLORES.fondoSecundario,
    borderTopLeftRadius: BORDES.radio.xl,
    borderTopRightRadius: BORDES.radio.xl,
    padding: 20,
  },
  barraIndicadora: {
    alignItems: 'center',
    marginBottom: 8,
  },
  indicador: {
    width: 40,
    height: 4,
    backgroundColor: COLORES.textoSutil,
    borderRadius: 2,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: COLORES.texto,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
    color: COLORES.textoSecundario,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORES.inputBorde,
    borderRadius: BORDES.radio.sm,
    padding: 12,
    fontSize: 15,
    backgroundColor: COLORES.inputFondo,
    color: COLORES.texto,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonOpcion: {
    flex: 1,
    padding: 12,
    borderRadius: BORDES.radio.sm,
    borderWidth: 1,
    borderColor: COLORES.inputBorde,
    alignItems: 'center',
    backgroundColor: COLORES.inputFondo,
  },
  botonSeleccionado: {
    backgroundColor: COLORES.primario,
    borderColor: COLORES.primario,
  },
  iconoOpcion: {
    fontSize: 18,
    marginBottom: 4,
  },
  textoOpcion: {
    color: COLORES.textoSecundario,
    fontWeight: '600',
    fontSize: 13,
  },
  textoSeleccionado: {
    color: '#FFFFFF',
  },
  contenedorSwitches: {
    backgroundColor: COLORES.inputFondo,
    borderRadius: BORDES.radio.sm,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORES.inputBorde,
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
    color: COLORES.textoSecundario,
  },
  ayudaSwitch: {
    fontSize: 11,
    color: COLORES.textoSutil,
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: COLORES.separador,
    marginVertical: 8,
  },
  botonAvanzado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 14,
    borderRadius: BORDES.radio.sm,
    borderWidth: 1,
    borderColor: COLORES.inputBorde,
    backgroundColor: COLORES.inputFondo,
  },
  textoAvanzado: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.textoSecundario,
  },
  flechaAvanzado: {
    fontSize: 12,
    color: COLORES.primario,
    fontWeight: '700',
  },
  contenedorAvanzado: {
    marginTop: 4,
    paddingTop: 4,
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
    borderRadius: BORDES.radio.sm,
    borderWidth: 1,
    borderColor: COLORES.inputBorde,
    alignItems: 'center',
    backgroundColor: COLORES.inputFondo,
  },
  textoCancelar: {
    color: COLORES.textoSecundario,
    fontWeight: '700',
    fontSize: 15,
  },
  botonGuardar: {
    flex: 1,
    padding: 14,
    borderRadius: BORDES.radio.sm,
    backgroundColor: COLORES.primario,
    alignItems: 'center',
    elevation: 4,
  },
  textoGuardar: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  listaConfigs: {
    gap: 6,
  },
  botonConfig: {
    padding: 12,
    borderRadius: BORDES.radio.sm,
    borderWidth: 1,
    borderColor: COLORES.inputBorde,
    backgroundColor: COLORES.inputFondo,
  },
  botonConfigSeleccionado: {
    backgroundColor: COLORES.primario,
    borderColor: COLORES.primario,
  },
  textoConfig: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.textoSecundario,
  },
  textoConfigSeleccionado: {
    color: '#FFFFFF',
  },
  sinConfigs: {
    fontSize: 13,
    color: COLORES.textoSutil,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  filaDias: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 4,
  },
  botonDia: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BORDES.radio.sm,
    borderWidth: 1,
    borderColor: COLORES.inputBorde,
    alignItems: 'center' as const,
    backgroundColor: COLORES.inputFondo,
  },
  botonDiaActivo: {
    backgroundColor: COLORES.primario,
    borderColor: COLORES.primario,
  },
  textoDia: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORES.textoSecundario,
  },
  textoDiaActivo: {
    color: '#FFFFFF',
  },
});
