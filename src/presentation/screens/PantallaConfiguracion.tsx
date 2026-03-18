import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useConfigTelegram } from '../hooks/useConfigTelegram';

export const PantallaConfiguracion: React.FC = () => {
  const {
    configuracion,
    cargando,
    enviandoPrueba,
    error,
    exito,
    guardar,
    enviarPrueba,
  } = useConfigTelegram();

  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [guiaVisible, setGuiaVisible] = useState(false);

  useEffect(() => {
    if (configuracion) {
      setBotToken(configuracion.botToken);
      setChatId(configuracion.chatId);
    }
  }, [configuracion]);

  const manejarGuardado = () => {
    if (!botToken.trim() || !chatId.trim()) return;
    guardar(botToken.trim(), chatId.trim());
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <ScrollView
      style={estilos.contenedor}
      showsVerticalScrollIndicator={false}
    >
      {/* Guía de configuración colapsable */}
      <TouchableOpacity
        style={estilos.botonGuia}
        onPress={() => setGuiaVisible(!guiaVisible)}
        activeOpacity={0.7}
      >
        <Text style={estilos.iconoGuia}>🤖</Text>
        <Text style={estilos.tituloGuia}>
          ¿Cómo obtener los datos del bot?
        </Text>
        <Text style={estilos.flechaGuia}>
          {guiaVisible ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {guiaVisible && (
        <View style={estilos.tarjetaGuia}>
          <View style={estilos.pasos}>
            <Text style={estilos.paso}>
              1️⃣  Abre Telegram y busca @BotFather
            </Text>
            <Text style={estilos.paso}>
              2️⃣  Envía /newbot y sigue las instrucciones
            </Text>
            <Text style={estilos.paso}>
              3️⃣  Copia el token que te entrega BotFather
            </Text>
            <Text style={estilos.paso}>
              4️⃣  Crea un grupo e invita al bot
            </Text>
            <Text style={estilos.paso}>
              5️⃣  Envía un mensaje al grupo y visita:
            </Text>
            <View style={estilos.contenedorUrl}>
              <Text style={estilos.url}>
                api.telegram.org/bot{'<TOKEN>'}/getUpdates
              </Text>
            </View>
            <Text style={estilos.paso}>
              6️⃣  Busca "chat":{'{"id":'} en la respuesta JSON
            </Text>
          </View>
        </View>
      )}

      {/* Formulario */}
      <View style={estilos.tarjetaFormulario}>
        <Text style={estilos.tituloSeccion}>🔑 Credenciales del Bot</Text>

        <Text style={estilos.etiqueta}>Bot Token</Text>
        <View style={estilos.contenedorInput}>
          <Text style={estilos.iconoInput}>🔐</Text>
          <TextInput
            style={estilos.input}
            value={botToken}
            onChangeText={setBotToken}
            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v"
            placeholderTextColor="#B0BEC5"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </View>
        <Text style={estilos.ayuda}>
          Token proporcionado por @BotFather al crear el bot
        </Text>

        <Text style={estilos.etiqueta}>Chat ID</Text>
        <View style={estilos.contenedorInput}>
          <Text style={estilos.iconoInput}>💬</Text>
          <TextInput
            style={estilos.input}
            value={chatId}
            onChangeText={setChatId}
            placeholder="-1001234567890"
            placeholderTextColor="#B0BEC5"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numeric"
          />
        </View>
        <Text style={estilos.ayuda}>
          ID del grupo o chat donde se enviarán los SMS
        </Text>
      </View>

      {/* Mensajes de estado */}
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

      {/* Botones */}
      <View style={estilos.contenedorBotones}>
        <TouchableOpacity
          style={estilos.botonGuardar}
          onPress={manejarGuardado}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotonGuardar}>💾 Guardar configuración</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            estilos.botonPrueba,
            (!configuracion || enviandoPrueba) && estilos.botonDeshabilitado,
          ]}
          onPress={enviarPrueba}
          disabled={!configuracion || enviandoPrueba}
          activeOpacity={0.8}
        >
          {enviandoPrueba ? (
            <ActivityIndicator color="#1565C0" />
          ) : (
            <Text style={estilos.textoBotonPrueba}>
              📨 Enviar mensaje de prueba
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={estilos.espacioInferior} />
    </ScrollView>
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
  botonGuia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    margin: 12,
    marginBottom: 0,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  iconoGuia: {
    fontSize: 22,
    marginRight: 8,
  },
  tituloGuia: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1565C0',
    flex: 1,
  },
  flechaGuia: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '700',
  },
  tarjetaGuia: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  pasos: {
    gap: 6,
  },
  paso: {
    fontSize: 13,
    color: '#37474F',
    lineHeight: 20,
  },
  contenedorUrl: {
    backgroundColor: '#BBDEFB',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
    marginLeft: 24,
  },
  url: {
    fontSize: 11,
    color: '#0D47A1',
    fontFamily: 'monospace',
  },
  tarjetaFormulario: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tituloSeccion: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#455A64',
    marginBottom: 6,
    marginTop: 16,
  },
  contenedorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  iconoInput: {
    fontSize: 16,
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  ayuda: {
    fontSize: 12,
    color: '#90A4AE',
    marginTop: 4,
    fontStyle: 'italic',
  },
  alerta: {
    backgroundColor: '#FFEBEE',
    marginHorizontal: 12,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  textoAlerta: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  alertaExito: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 12,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  textoAlertaExito: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  contenedorBotones: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },
  botonGuardar: {
    backgroundColor: '#1565C0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  botonPrueba: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1565C0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    borderColor: '#CFD8DC',
    opacity: 0.5,
  },
  textoBotonPrueba: {
    color: '#1565C0',
    fontSize: 16,
    fontWeight: '700',
  },
  espacioInferior: {
    height: 24,
  },
});
