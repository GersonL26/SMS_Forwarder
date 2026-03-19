import { useState, useCallback, useEffect } from 'react';
import { ConfiguracionTelegram } from '../../domain/entities/ConfiguracionTelegram';
import { ContenedorDeDependencias } from '../../infrastructure/container/ContenedorDeDependencias';

export const useConfigTelegram = () => {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionTelegram[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviandoPrueba, setEnviandoPrueba] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const { configurarTelegram, sincronizadorConfigNativa } =
    ContenedorDeDependencias.obtenerInstancia();

  const cargarConfiguraciones = useCallback(async () => {
    setCargando(true);
    try {
      const configs = await configurarTelegram.obtenerTodas();
      setConfiguraciones(configs);
    } catch {
      setError('Error al cargar configuraciones');
    } finally {
      setCargando(false);
    }
  }, [configurarTelegram]);

  useEffect(() => {
    cargarConfiguraciones();
  }, [cargarConfiguraciones]);

  const guardar = useCallback(
    async (config: ConfiguracionTelegram) => {
      setError(null);
      setExito(null);
      try {
        await configurarTelegram.guardarConfiguracion(config);
        await cargarConfiguraciones();
        await sincronizadorConfigNativa.sincronizar();
        setExito('Configuración guardada correctamente');
      } catch {
        setError('Error al guardar configuración');
      }
    },
    [configurarTelegram, cargarConfiguraciones],
  );

  const eliminar = useCallback(
    async (id: string) => {
      setError(null);
      setExito(null);
      try {
        await configurarTelegram.eliminarConfiguracion(id);
        await cargarConfiguraciones();
        await sincronizadorConfigNativa.sincronizar();
        setExito('Configuración eliminada');
      } catch {
        setError('Error al eliminar configuración');
      }
    },
    [configurarTelegram, cargarConfiguraciones],
  );

  const enviarPrueba = useCallback(async (configId: string) => {
    setError(null);
    setExito(null);
    setEnviandoPrueba(configId);
    try {
      await configurarTelegram.enviarMensajeDePrueba(configId);
      setExito('Mensaje de prueba enviado correctamente');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Error al enviar prueba',
      );
    } finally {
      setEnviandoPrueba(null);
    }
  }, [configurarTelegram]);

  return {
    configuraciones,
    cargando,
    enviandoPrueba,
    error,
    exito,
    guardar,
    eliminar,
    enviarPrueba,
  };
};
