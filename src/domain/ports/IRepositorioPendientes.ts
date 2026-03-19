import { MensajePendiente } from '../entities/MensajePendiente';

export interface IRepositorioPendientes {
  agregar(mensaje: MensajePendiente): Promise<void>;
  obtenerTodos(): Promise<MensajePendiente[]>;
  eliminar(id: string): Promise<void>;
  actualizar(mensaje: MensajePendiente): Promise<void>;
}
