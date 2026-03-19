import { useState, useCallback, useEffect } from 'react';
import { Ajustes } from '../../domain/entities/Ajustes';
import { ContenedorDeDependencias } from '../../infrastructure/container/ContenedorDeDependencias';

export const useAjustes = () => {
  const [ajustes, setAjustes] = useState<Ajustes | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardado, setGuardado] = useState(false);

  const { gestionarAjustes } =
    ContenedorDeDependencias.obtenerInstancia();

  const cargarAjustes = useCallback(async () => {
    setCargando(true);
    const resultado = await gestionarAjustes.obtenerAjustes();
    setAjustes(resultado);
    setCargando(false);
  }, [gestionarAjustes]);

  useEffect(() => {
    cargarAjustes();
  }, [cargarAjustes]);

  const guardar = useCallback(
    async (nuevosAjustes: Ajustes) => {
      setGuardado(false);
      await gestionarAjustes.guardarAjustes(nuevosAjustes);
      setAjustes(nuevosAjustes);
      setGuardado(true);
    },
    [gestionarAjustes],
  );

  return { ajustes, cargando, guardado, guardar };
};
