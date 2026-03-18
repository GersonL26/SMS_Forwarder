import { MensajeSms } from '../domain/entities/MensajeSms';
import { IRepositorioMensajes } from '../domain/ports/IRepositorioMensajes';

const LIMITE_MENSAJES = 50;

export class ObtenerRegistroDeMensajes {
  constructor(
    private readonly repositorioMensajes: IRepositorioMensajes,
  ) {}

  async ejecutar(): Promise<MensajeSms[]> {
    const mensajes = await this.repositorioMensajes.obtenerTodos();
    return this.obtenerUltimosMensajes(mensajes);
  }

  private obtenerUltimosMensajes(mensajes: MensajeSms[]): MensajeSms[] {
    return mensajes
      .sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime())
      .slice(0, LIMITE_MENSAJES);
  }
}
