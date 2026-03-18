import { useState, useCallback, useEffect } from 'react';
import { ReglaDeReenvio } from '../../domain/entidades/ReglaDeReenvio';
import { ContenedorDeDependencias } from '../../infrastructure/contenedor/ContenedorDeDependencias';

export const useReglas = () => {
  const [reglas, setReglas] = useState<ReglaDeReenvio[]>([]);
  const [cargando, setCargando] = useState(true);

  const { gestionarReglas } =
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
    },
    [gestionarReglas, cargarReglas],
  );

  const editar = useCallback(
    async (regla: ReglaDeReenvio) => {
      await gestionarReglas.editarRegla(regla);
      await cargarReglas();
    },
    [gestionarReglas, cargarReglas],
  );

  const eliminar = useCallback(
    async (id: string) => {
      await gestionarReglas.eliminarRegla(id);
      await cargarReglas();
    },
    [gestionarReglas, cargarReglas],
  );

  const alternarEstado = useCallback(
    async (id: string) => {
      await gestionarReglas.alternarEstado(id);
      await cargarReglas();
    },
    [gestionarReglas, cargarReglas],
  );

  return { reglas, cargando, crear, editar, eliminar, alternarEstado };
};
