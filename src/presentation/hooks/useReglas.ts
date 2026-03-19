import { useState, useCallback, useEffect } from 'react';
import { ReglaDeReenvio } from '../../domain/entities/ReglaDeReenvio';
import { ContenedorDeDependencias } from '../../infrastructure/container/ContenedorDeDependencias';

export const useReglas = () => {
  const [reglas, setReglas] = useState<ReglaDeReenvio[]>([]);
  const [cargando, setCargando] = useState(true);

  const { gestionarReglas, sincronizadorConfigNativa } =
    ContenedorDeDependencias.obtenerInstancia();

  const cargarReglas = useCallback(async () => {
    setCargando(true);
    const resultado = await gestionarReglas.obtenerReglas();
    setReglas(resultado);
    setCargando(false);
  }, [gestionarReglas]);

  useEffect(() => {
    cargarReglas();
  }, [cargarReglas]);

  const crear = useCallback(
    async (datos: Omit<ReglaDeReenvio, 'id'>) => {
      await gestionarReglas.crearRegla(datos);
      await cargarReglas();
      await sincronizadorConfigNativa.sincronizar();
    },
    [gestionarReglas, cargarReglas, sincronizadorConfigNativa],
  );

  const editar = useCallback(
    async (regla: ReglaDeReenvio) => {
      await gestionarReglas.editarRegla(regla);
      await cargarReglas();
      await sincronizadorConfigNativa.sincronizar();
    },
    [gestionarReglas, cargarReglas, sincronizadorConfigNativa],
  );

  const eliminar = useCallback(
    async (id: string) => {
      await gestionarReglas.eliminarRegla(id);
      await cargarReglas();
      await sincronizadorConfigNativa.sincronizar();
    },
    [gestionarReglas, cargarReglas, sincronizadorConfigNativa],
  );

  const alternarEstado = useCallback(
    async (id: string) => {
      await gestionarReglas.alternarEstado(id);
      await cargarReglas();
      await sincronizadorConfigNativa.sincronizar();
    },
    [gestionarReglas, cargarReglas, sincronizadorConfigNativa],
  );

  return { reglas, cargando, crear, editar, eliminar, alternarEstado };
};
