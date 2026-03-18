import { ReglaDeReenvio } from '../domain/entidades/ReglaDeReenvio';
import { IRepositorioReglas } from '../domain/puertos/IRepositorioReglas';

export class GestionarReglas {
  constructor(
    private readonly repositorioReglas: IRepositorioReglas,
  ) {}

  async crearRegla(
    datos: Omit<ReglaDeReenvio, 'id'>,
  ): Promise<ReglaDeReenvio> {
    const regla: ReglaDeReenvio = { ...datos, id: this.generarId() };
    await this.repositorioReglas.guardar(regla);
    return regla;
  }

  async editarRegla(regla: ReglaDeReenvio): Promise<void> {
    await this.repositorioReglas.guardar(regla);
  }

  async eliminarRegla(id: string): Promise<void> {
    await this.repositorioReglas.eliminar(id);
  }

  async obtenerReglas(): Promise<ReglaDeReenvio[]> {
    return this.repositorioReglas.obtenerTodas();
  }

  async alternarEstado(id: string): Promise<ReglaDeReenvio> {
    const regla = await this.repositorioReglas.obtenerPorId(id);

    if (!regla) {
      throw new Error(`Regla con id ${id} no encontrada`);
    }

    const reglaActualizada: ReglaDeReenvio = {
      ...regla,
      activa: !regla.activa,
    };
    await this.repositorioReglas.guardar(reglaActualizada);
    return reglaActualizada;
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
