import { ReglaDeReenvio } from '../entidades/ReglaDeReenvio';

export interface IRepositorioReglas {
  guardar(regla: ReglaDeReenvio): Promise<void>;
  obtenerTodas(): Promise<ReglaDeReenvio[]>;
  obtenerPorId(id: string): Promise<ReglaDeReenvio | null>;
  eliminar(id: string): Promise<void>;
}
