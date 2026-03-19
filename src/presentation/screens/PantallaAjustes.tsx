import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAjustes } from '../hooks/useAjustes';
import { Ajustes } from '../../domain/entities/Ajustes';
import { FondoGradiente } from '../components/FondoGradiente';
import { COLORES, SOMBRAS, BORDES, GRADIENTES } from '../theme/colores';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SeccionProps {
  icono: string;
  titulo: string;
  descripcion: string;
  children: React.ReactNode;
  expandida: boolean;
  onToggle: () => void;
}

const SeccionAcordeon: React.FC<SeccionProps> = ({
  icono,
  titulo,
  descripcion,
  children,
  expandida,
  onToggle,
}) => (
  <View style={estilos.seccion}>
    <TouchableOpacity
      style={estilos.seccionHeader}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={estilos.seccionIcono}>
        <Text style={{ fontSize: 20 }}>{icono}</Text>
      </View>
      <View style={estilos.seccionInfo}>
        <Text style={estilos.seccionTitulo}>{titulo}</Text>
        <Text style={estilos.seccionDescripcion} numberOfLines={expandida ? undefined : 1}>
          {descripcion}
        </Text>
      </View>
      <Text style={estilos.seccionFlecha}>{expandida ? '▲' : '▼'}</Text>
    </TouchableOpacity>
    {expandida && <View style={estilos.seccionContenido}>{children}</View>}
  </View>
);

export const PantallaAjustes: React.FC = () => {
  const { ajustes, cargando, guardado, guardar } = useAjustes();

  const [prefijoMensaje, setPrefijoMensaje] = useState('');
  const [reintentoAutomatico, setReintentoAutomatico] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookActivo, setWebhookActivo] = useState(false);
  const [notificacionActiva, setNotificacionActiva] = useState(true);
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);

  useEffect(() => {
    if (ajustes) {
      setPrefijoMensaje(ajustes.prefijoMensaje);
      setReintentoAutomatico(ajustes.reintentoAutomatico);
      setWebhookUrl(ajustes.webhookUrl);
      setWebhookActivo(ajustes.webhookActivo);
      setNotificacionActiva(ajustes.notificacionActiva);
    }
  }, [ajustes]);

  const toggleSeccion = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSeccionAbierta(seccionAbierta === id ? null : id);
  };

  const manejarGuardado = () => {
    const nuevosAjustes: Ajustes = {
      prefijoMensaje: prefijoMensaje.trim(),
      reintentoAutomatico,
      webhookUrl: webhookUrl.trim(),
      webhookActivo,
      notificacionActiva,
    };
    guardar(nuevosAjustes);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >

        <SeccionAcordeon
          icono="✏️"
          titulo="Firma / Prefijo global"
          descripcion="Texto al inicio de cada mensaje reenviado"
          expandida={seccionAbierta === 'prefijo'}
          onToggle={() => toggleSeccion('prefijo')}
        >
          <TextInput
            style={estilos.input}
            value={prefijoMensaje}
            onChangeText={setPrefijoMensaje}
            placeholder="Ej: 📲 Mi teléfono personal"
            placeholderTextColor={COLORES.textoSutil}
            multiline
          />
          <View style={estilos.previsualizacion}>
            <Text style={estilos.prevLabel}>Vista previa</Text>
            <Text style={estilos.prevTexto}>
              {prefijoMensaje ? `${prefijoMensaje}\n` : ''}
              📱 SMS de +5012345678:{'\n'}
              Contenido del mensaje...
            </Text>
          </View>
        </SeccionAcordeon>

        <SeccionAcordeon
          icono="⚡"
          titulo="Comportamiento"
          descripcion="Reintento automático y opciones de envío"
          expandida={seccionAbierta === 'comportamiento'}
          onToggle={() => toggleSeccion('comportamiento')}
        >
          <View style={estilos.filaSwitch}>
            <View style={estilos.infoSwitch}>
              <Text style={estilos.etiquetaSwitch}>🔄 Reintento automático</Text>
              <Text style={estilos.ayudaSwitch}>
                Reintenta enviar al recuperar internet
              </Text>
            </View>
            <Switch
              value={reintentoAutomatico}
              onValueChange={setReintentoAutomatico}
              trackColor={{ false: COLORES.switchTrackInactivo, true: COLORES.switchTrackActivo }}
              thumbColor={reintentoAutomatico ? COLORES.switchThumbActivo : COLORES.switchThumbInactivo}
            />
          </View>
        </SeccionAcordeon>

        <SeccionAcordeon
          icono="🌐"
          titulo="Webhook HTTP"
          descripcion="Envía SMS como JSON a URL externa"
          expandida={seccionAbierta === 'webhook'}
          onToggle={() => toggleSeccion('webhook')}
        >
          <View style={estilos.filaSwitch}>
            <View style={estilos.infoSwitch}>
              <Text style={estilos.etiquetaSwitch}>🔗 Webhook activo</Text>
              <Text style={estilos.ayudaSwitch}>n8n, Zapier, API propia</Text>
            </View>
            <Switch
              value={webhookActivo}
              onValueChange={setWebhookActivo}
              trackColor={{ false: COLORES.switchTrackInactivo, true: COLORES.switchTrackActivo }}
              thumbColor={webhookActivo ? COLORES.switchThumbActivo : COLORES.switchThumbInactivo}
            />
          </View>
          {webhookActivo && (
            <TextInput
              style={[estilos.input, { marginTop: 12 }]}
              value={webhookUrl}
              onChangeText={setWebhookUrl}
              placeholder="https://tu-servidor.com/webhook"
              placeholderTextColor={COLORES.textoSutil}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          )}
        </SeccionAcordeon>

        <SeccionAcordeon
          icono="🔔"
          titulo="Notificaciones"
          descripcion="Alertas al reenviar SMS"
          expandida={seccionAbierta === 'notificaciones'}
          onToggle={() => toggleSeccion('notificaciones')}
        >
          <View style={estilos.filaSwitch}>
            <View style={estilos.infoSwitch}>
              <Text style={estilos.etiquetaSwitch}>Notificar al reenviar</Text>
              <Text style={estilos.ayudaSwitch}>
                Muestra una notificación local por cada SMS reenviado
              </Text>
            </View>
            <Switch
              value={notificacionActiva}
              onValueChange={setNotificacionActiva}
              trackColor={{ false: COLORES.switchTrackInactivo, true: COLORES.switchTrackActivo }}
              thumbColor={notificacionActiva ? COLORES.switchThumbActivo : COLORES.switchThumbInactivo}
            />
          </View>
        </SeccionAcordeon>

        {guardado && (
          <View style={estilos.alertaExito}>
            <Text style={estilos.textoAlertaExito}>
              ✅ Ajustes guardados correctamente
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={manejarGuardado} activeOpacity={0.8}>
          <LinearGradient
            colors={[...GRADIENTES.boton]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={estilos.botonGuardar}
          >
            <Text style={estilos.textoBotonGuardar}>💾 Guardar ajustes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </FondoGradiente>
  );
};

const estilos = StyleSheet.create({
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seccion: {
    backgroundColor: COLORES.tarjeta,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: BORDES.radio.md,
    borderWidth: 1,
    borderColor: COLORES.tarjetaBorde,
    overflow: 'hidden',
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  seccionIcono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  seccionInfo: {
    flex: 1,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.texto,
  },
  seccionDescripcion: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  seccionFlecha: {
    fontSize: 12,
    color: COLORES.primario,
    fontWeight: '700',
    marginLeft: 8,
  },
  seccionContenido: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORES.separador,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORES.inputBorde,
    borderRadius: BORDES.radio.sm,
    padding: 12,
    fontSize: 15,
    backgroundColor: COLORES.inputFondo,
    color: COLORES.texto,
    marginTop: 12,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  previsualizacion: {
    marginTop: 12,
    backgroundColor: 'rgba(0, 217, 255, 0.05)',
    padding: 12,
    borderRadius: BORDES.radio.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORES.primario,
  },
  prevLabel: {
    fontSize: 11,
    color: COLORES.primario,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prevTexto: {
    fontSize: 13,
    color: COLORES.textoSecundario,
    lineHeight: 20,
  },
  filaSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  infoSwitch: {
    flex: 1,
    marginRight: 12,
  },
  etiquetaSwitch: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.texto,
  },
  ayudaSwitch: {
    fontSize: 11,
    color: COLORES.textoSutil,
    marginTop: 2,
  },
  alertaExito: {
    backgroundColor: COLORES.exitoFondo,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: BORDES.radio.sm,
  },
  textoAlertaExito: {
    color: COLORES.exito,
    fontSize: 14,
    fontWeight: '500',
  },
  botonGuardar: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: BORDES.radio.md,
    alignItems: 'center',
    ...SOMBRAS.boton,
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
