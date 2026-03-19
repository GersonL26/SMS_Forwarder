import { MensajeSms } from '../entities/MensajeSms';

export interface IRepositorioMensajes {
  guardar(mensaje: MensajeSms): Promise<void>;
  obtenerTodos(): Promise<MensajeSms[]>;
  actualizar(mensaje: MensajeSms): Promise<void>;
}
