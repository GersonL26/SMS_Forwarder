import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConfigTelegram } from '../hooks/useConfigTelegram';
import { ConfiguracionTelegram } from '../../domain/entities/ConfiguracionTelegram';
import { FondoGradiente } from '../components/FondoGradiente';
import { COLORES, SOMBRAS, BORDES, GRADIENTES } from '../theme/colores';

export const PantallaConfiguracion: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    configuraciones,
    cargando,
    enviandoPrueba,
    error,
    exito,
    guardar,
    eliminar,
    enviarPrueba,
  } = useConfigTelegram();

  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<ConfiguracionTelegram | null>(null);
  const [nombre, setNombre] = useState('');
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [esPredeterminada, setEsPredeterminada] = useState(false);
  const [guiaVisible, setGuiaVisible] = useState(false);

  const abrirFormularioNuevo = () => {
    setEditando(null);
    setNombre('');
    setBotToken('');
    setChatId('');
    setEsPredeterminada(configuraciones.length === 0);
    setModalVisible(true);
  };

  const abrirFormularioEdicion = (config: ConfiguracionTelegram) => {
    setEditando(config);
    setNombre(config.nombre);
    setBotToken(config.botToken);
    setChatId(config.chatId);
    setEsPredeterminada(config.esPredeterminada);
    setModalVisible(true);
  };

  const manejarGuardado = () => {
    if (!nombre.trim() || !botToken.trim() || !chatId.trim()) return;
    const config: ConfiguracionTelegram = {
      id: editando?.id ?? Date.now().toString(),
      nombre: nombre.trim(),
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      esPredeterminada,
    };
    guardar(config);
    setModalVisible(false);
  };

  const confirmarEliminacion = (config: ConfiguracionTelegram) => {
    Alert.alert(
      'Eliminar configuración',
      `¿Eliminar "${config.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(config.id) },
      ],
    );
  };

  if (cargando) {
    return (
      <FondoGradiente>
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color={COLORES.primario} />
        </View>
      </FondoGradiente>
    );
  }

  return (
    <FondoGradiente>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        <TouchableOpacity
          style={estilos.botonGuia}
          onPress={() => setGuiaVisible(!guiaVisible)}
          activeOpacity={0.7}
        >
          <Text style={estilos.iconoGuia}>🤖</Text>
          <Text style={estilos.tituloGuia}>¿Cómo obtener los datos del bot?</Text>
          <Text style={estilos.flechaGuia}>{guiaVisible ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {guiaVisible && (
          <View style={estilos.tarjetaGuia}>
            <View style={estilos.pasos}>
              <Text style={estilos.paso}>1️⃣  Abre Telegram y busca @BotFather</Text>
              <Text style={estilos.paso}>2️⃣  Envía /newbot y sigue las instrucciones</Text>
              <Text style={estilos.paso}>3️⃣  Copia el token que te entrega BotFather</Text>
              <Text style={estilos.paso}>4️⃣  Crea un grupo e invita al bot</Text>
              <Text style={estilos.paso}>5️⃣  Envía un mensaje al grupo y visita:</Text>
              <View style={estilos.contenedorUrl}>
                <Text style={estilos.url}>api.telegram.org/bot{'<TOKEN>'}/getUpdates</Text>
              </View>
              <Text style={estilos.paso}>6️⃣  Busca "chat":{'{"id":'} en la respuesta JSON</Text>
            </View>
          </View>
        )}

        {error && (
          <View style={estilos.alerta}>
            <Text style={estilos.textoAlerta}>❌ {error}</Text>
          </View>
        )}
        {exito && (
          <View style={estilos.alertaExito}>
            <Text style={estilos.textoAlertaExito}>✅ {exito}</Text>
          </View>
        )}

        {configuraciones.length === 0 && (
          <View style={estilos.vacio}>
            <Text style={estilos.iconoVacio}>⚙️</Text>
            <Text style={estilos.textoVacio}>No hay configuraciones de Telegram</Text>
            <Text style={estilos.textoSubVacio}>Toca el botón + para agregar una</Text>
          </View>
        )}

        {configuraciones.map((config) => (
          <View key={config.id} style={estilos.tarjetaConfig}>
            <View style={estilos.cabeceraConfig}>
              <Text style={estilos.nombreConfig}>
                {config.esPredeterminada ? '⭐ ' : '🤖 '}{config.nombre}
              </Text>
              {config.esPredeterminada && (
                <View style={estilos.badgePredeterminada}>
                  <Text style={estilos.textoBadge}>Default</Text>
                </View>
              )}
            </View>
            <Text style={estilos.chatIdConfig}>Chat ID: {config.chatId}</Text>
            <View style={estilos.botonesConfig}>
              <TouchableOpacity
                style={estilos.botonAccionConfig}
                onPress={() => enviarPrueba(config.id)}
                disabled={enviandoPrueba === config.id}
              >
                {enviandoPrueba === config.id ? (
                  <ActivityIndicator size="small" color={COLORES.primario} />
                ) : (
                  <Text style={estilos.textoAccionConfig}>📨 Probar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={estilos.botonAccionConfig}
                onPress={() => abrirFormularioEdicion(config)}
              >
                <Text style={estilos.textoAccionConfig}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.botonAccionConfig, estilos.botonEliminar]}
                onPress={() => confirmarEliminacion(config)}
              >
                <Text style={estilos.textoEliminarBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={estilos.fabContenedor}
        onPress={abrirFormularioNuevo}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[...GRADIENTES.boton]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={estilos.fab}
        >
          <Text style={estilos.textoFab}>＋</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={estilos.fondoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={estilos.contenedorModal}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={estilos.barraModal}>
              <View style={estilos.indicadorModal} />
            </View>
            <Text style={estilos.tituloModal}>
              {editando ? '✏️ Editar configuración' : '➕ Nueva configuración'}
            </Text>

            <Text style={estilos.etiqueta}>📝 Nombre</Text>
            <TextInput
              style={estilos.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Bot principal"
              placeholderTextColor={COLORES.textoSutil}
            />

            <Text style={estilos.etiqueta}>🔐 Bot Token</Text>
            <TextInput
              style={estilos.input}
              value={botToken}
              onChangeText={setBotToken}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v"
              placeholderTextColor={COLORES.textoSutil}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <Text style={estilos.etiqueta}>💬 Chat ID</Text>
            <TextInput
              style={estilos.input}
              value={chatId}
              onChangeText={setChatId}
              placeholder="-1001234567890"
              placeholderTextColor={COLORES.textoSutil}
              autoCapitalize="none"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={estilos.filaPredeterminada}
              onPress={() => setEsPredeterminada(!esPredeterminada)}
            >
              <Text style={estilos.textoPredeterminada}>
                {esPredeterminada ? '⭐' : '☆'} Configuración predeterminada
              </Text>
            </TouchableOpacity>

            <View style={[estilos.botonesModal, { marginBottom: Math.max(insets.bottom, 12) }]}>
              <TouchableOpacity
                style={estilos.botonCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={estilos.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={manejarGuardado} activeOpacity={0.8}>
                <LinearGradient
                  colors={[...GRADIENTES.boton]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={estilos.botonGuardar}
                >
                  <Text style={estilos.textoGuardar}>Guardar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </FondoGradiente>
  );
};

const estilos = StyleSheet.create({
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonGuia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.tarjeta,
    margin: 16,
    marginBottom: 0,
    padding: 14,
    borderRadius: BORDES.radio.md,
    borderWidth: 1,
    borderColor: COLORES.tarjetaBorde,
  },
  iconoGuia: { fontSize: 22, marginRight: 8 },
  tituloGuia: { fontSize: 14, fontWeight: '700', color: COLORES.primario, flex: 1 },
  flechaGuia: { fontSize: 14, color: COLORES.primario, fontWeight: '700' },
  tarjetaGuia: {
    backgroundColor: COLORES.tarjeta,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: BORDES.radio.md,
    borderBottomRightRadius: BORDES.radio.md,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORES.tarjetaBorde,
  },
  pasos: { gap: 6 },
  paso: { fontSize: 13, color: COLORES.textoSecundario, lineHeight: 20 },
  contenedorUrl: {
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
    marginLeft: 24,
  },
  url: { fontSize: 11, color: COLORES.primario, fontFamily: 'monospace' },
  alerta: {
    backgroundColor: COLORES.errorFondo,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: BORDES.radio.sm,
  },
  textoAlerta: { color: COLORES.error, fontSize: 14, fontWeight: '500' },
  alertaExito: {
    backgroundColor: COLORES.exitoFondo,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: BORDES.radio.sm,
  },
  textoAlertaExito: { color: COLORES.exito, fontSize: 14, fontWeight: '500' },
  vacio: {
    margin: 16,
    padding: 40,
    alignItems: 'center',
  },
  iconoVacio: { fontSize: 48, marginBottom: 12 },
  textoVacio: { color: COLORES.texto, fontSize: 16, fontWeight: '600' },
  textoSubVacio: { color: COLORES.textoSecundario, fontSize: 13, marginTop: 4 },
  tarjetaConfig: {
    backgroundColor: COLORES.tarjeta,
    margin: 16,
    marginBottom: 4,
    padding: 16,
    borderRadius: BORDES.radio.md,
    borderWidth: 1,
    borderColor: COLORES.tarjetaBorde,
    ...SOMBRAS.suave,
  },
  cabeceraConfig: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nombreConfig: { fontSize: 16, fontWeight: '700', color: COLORES.texto, flex: 1 },
  badgePredeterminada: {
    backgroundColor: COLORES.advertenciaFondo,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  textoBadge: { color: COLORES.advertencia, fontSize: 11, fontWeight: '700' },
  chatIdConfig: { color: COLORES.textoSecundario, fontSize: 13, marginBottom: 10 },
  botonesConfig: { flexDirection: 'row', gap: 8 },
  botonAccionConfig: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BORDES.radio.sm,
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
  },
  textoAccionConfig: { color: COLORES.primario, fontSize: 13, fontWeight: '600' },
  botonEliminar: { backgroundColor: COLORES.errorFondo },
  textoEliminarBtn: { fontSize: 14 },
  fabContenedor: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    ...SOMBRAS.boton,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoFab: { color: '#FFF', fontSize: 28, fontWeight: '300', marginTop: -2 },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  contenedorModal: {
    backgroundColor: COLORES.fondoSecundario,
    borderTopLeftRadius: BORDES.radio.xl,
    borderTopRightRadius: BORDES.radio.xl,
    padding: 20,
    maxHeight: '85%',
  },
  barraModal: {
    alignItems: 'center',
    marginBottom: 8,
  },
  indicadorModal: {
    width: 40,
    height: 4,
    backgroundColor: COLORES.textoSutil,
    borderRadius: 2,
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: COLORES.texto,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.textoSecundario,
    marginBottom: 6,
    marginTop: 14,
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
  filaPredeterminada: {
    marginTop: 16,
    padding: 12,
    borderRadius: BORDES.radio.sm,
    backgroundColor: COLORES.advertenciaFondo,
  },
  textoPredeterminada: { fontSize: 14, fontWeight: '600', color: COLORES.advertencia },
  botonesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
  textoCancelar: { color: COLORES.textoSecundario, fontWeight: '700', fontSize: 15 },
  botonGuardar: {
    flex: 1,
    padding: 14,
    borderRadius: BORDES.radio.sm,
    alignItems: 'center',
  },
  textoGuardar: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  espacioInferior: { height: 80 },
});
