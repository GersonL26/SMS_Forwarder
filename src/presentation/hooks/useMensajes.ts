import { useState, useCallback, useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { MensajeSms } from '../../domain/entities/MensajeSms';
import { ContenedorDeDependencias } from '../../infrastructure/container/ContenedorDeDependencias';

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

  const { obtenerRegistroDeMensajes, controlarServicioSms } =
    ContenedorDeDependencias.obtenerInstancia();

  const cargarMensajes = useCallback(async () => {
    setCargando(true);
    const resultado = await obtenerRegistroDeMensajes.ejecutar();
    setMensajes(resultado);
    setCargando(false);
  }, [obtenerRegistroDeMensajes]);

  useEffect(() => {
    cargarMensajes();
    setServicioActivo(controlarServicioSms.estaActivo());
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

  return {
    mensajes,
    cargando,
    servicioActivo,
    cargarMensajes,
    alternarServicio,
  };
};
