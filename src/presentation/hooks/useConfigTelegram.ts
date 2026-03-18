import { useState, useCallback, useEffect } from 'react';
import { ConfiguracionTelegram } from '../../domain/entities/ConfiguracionTelegram';
import { ContenedorDeDependencias } from '../../infrastructure/container/ContenedorDeDependencias';

export const useConfigTelegram = () => {
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionTelegram | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviandoPrueba, setEnviandoPrueba] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const { configurarTelegram } =
    ContenedorDeDependencias.obtenerInstancia();

  const cargarConfiguracion = useCallback(async () => {
    setCargando(true);
    try {
      const config = await configurarTelegram.obtenerConfiguracion();
      setConfiguracion(config);
    } catch {
      setError('Error al cargar configuración');
    } finally {
      setCargando(false);
    }
  }, [configurarTelegram]);

  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  const guardar = useCallback(
    async (botToken: string, chatId: string) => {
      setError(null);
      setExito(null);
      try {
        await configurarTelegram.guardarConfiguracion(botToken, chatId);
        setConfiguracion({ botToken, chatId });
        setExito('Configuración guardada correctamente');
      } catch {
        setError('Error al guardar configuración');
      }
    },
    [configurarTelegram],
  );

  const enviarPrueba = useCallback(async () => {
    setError(null);
    setExito(null);
    setEnviandoPrueba(true);
    try {
      await configurarTelegram.enviarMensajeDePrueba();
      setExito('Mensaje de prueba enviado correctamente');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Error al enviar prueba',
      );
    } finally {
      setEnviandoPrueba(false);
    }
  }, [configurarTelegram]);

  return {
    configuracion,
    cargando,
    enviandoPrueba,
    error,
    exito,
    guardar,
    enviarPrueba,
  };
};
