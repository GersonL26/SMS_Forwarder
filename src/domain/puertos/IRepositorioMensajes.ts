import { MensajeSms } from '../entidades/MensajeSms';

export interface IRepositorioMensajes {
  guardar(mensaje: MensajeSms): Promise<void>;
  obtenerTodos(): Promise<MensajeSms[]>;
}
