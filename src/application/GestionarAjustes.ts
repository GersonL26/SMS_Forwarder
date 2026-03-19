import { Ajustes } from '../domain/entities/Ajustes';
import { IRepositorioAjustes } from '../domain/ports/IRepositorioAjustes';

export class GestionarAjustes {
  constructor(
    private readonly repositorioAjustes: IRepositorioAjustes,
  ) {}

  async obtenerAjustes(): Promise<Ajustes> {
    return this.repositorioAjustes.obtener();
  }

  async guardarAjustes(ajustes: Ajustes): Promise<void> {
    await this.repositorioAjustes.guardar(ajustes);
  }
}
