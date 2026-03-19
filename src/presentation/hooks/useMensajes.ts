import { useState, useCallback, useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { MensajeSms } from '../../domain/entities/MensajeSms';
import { ContenedorDeDependencias } from '../../infrastructure/container/ContenedorDeDependencias';
import { ReceptorSmsNativo } from '../../infrastructure/sms/ReceptorSmsNativo';

const solicitarPermisosSms = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  const permisos: string[] = [
    PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    PermissionsAndroid.PERMISSIONS.READ_SMS,
  ];

  if (Number(Platform.Version) >= 33) {
    permisos.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  const granted = await PermissionsAndroid.requestMultiple(
    permisos as Array<(typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS]>,
  );

  return (
    granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED &&
    granted[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED
  );
};

export const useMensajes = () => {
  const [mensajes, setMensajes] = useState<MensajeSms[]>([]);
  const [cargando, setCargando] = useState(true);
  const [servicioActivo, setServicioActivo] = useState(false);

  const { obtenerRegistroDeMensajes, controlarServicioSms, reintentarMensaje } =
    ContenedorDeDependencias.obtenerInstancia();

  const cargarMensajes = useCallback(async () => {
    setCargando(true);
    const resultado = await obtenerRegistroDeMensajes.ejecutar();
    setMensajes(resultado);
    setCargando(false);
  }, [obtenerRegistroDeMensajes]);

  useEffect(() => {
    cargarMensajes();
    // Check persisted native service state and auto-resume if needed
    const verificarEstado = async () => {
      const receptor = controlarServicioSms['receptorSms'] as ReceptorSmsNativo;
      if (receptor.consultarEstadoNativo) {
        const corriendo = await receptor.consultarEstadoNativo();
        if (corriendo && !controlarServicioSms.estaActivo()) {
          controlarServicioSms.iniciar();
        }
        setServicioActivo(corriendo);
      } else {
        setServicioActivo(controlarServicioSms.estaActivo());
      }
    };
    verificarEstado();
  }, [cargarMensajes, controlarServicioSms]);

  const alternarServicio = useCallback(async () => {
    if (servicioActivo) {
      controlarServicioSms.detener();
      setServicioActivo(false);
    } else {
      const concedido = await solicitarPermisosSms();
      if (!concedido) {
        Alert.alert(
          'Permisos necesarios',
          'Se necesitan permisos de SMS para interceptar mensajes. Actívalos en Ajustes de la aplicación.',
        );
        return;
      }
      controlarServicioSms.iniciar();
      setServicioActivo(true);
    }
  }, [servicioActivo, controlarServicioSms]);

  const reintentar = useCallback(
    async (mensaje: MensajeSms): Promise<boolean> => {
      const exito = await reintentarMensaje.ejecutar(mensaje);
      if (exito) {
        await cargarMensajes();
      }
      return exito;
    },
    [reintentarMensaje, cargarMensajes],
  );

  return {
    mensajes,
    cargando,
    servicioActivo,
    cargarMensajes,
    alternarServicio,
    reintentar,
  };
};
