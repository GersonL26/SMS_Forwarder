import { Ajustes } from '../entities/Ajustes';

export interface IRepositorioAjustes {
  guardar(ajustes: Ajustes): Promise<void>;
  obtener(): Promise<Ajustes>;
}
