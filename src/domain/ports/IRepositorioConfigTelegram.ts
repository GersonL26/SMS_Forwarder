import { ConfiguracionTelegram } from '../entities/ConfiguracionTelegram';

export interface IRepositorioConfigTelegram {
  guardar(configuracion: ConfiguracionTelegram): Promise<void>;
  obtener(): Promise<ConfiguracionTelegram | null>;
  obtenerTodas(): Promise<ConfiguracionTelegram[]>;
  obtenerPorId(id: string): Promise<ConfiguracionTelegram | null>;
  eliminar(id: string): Promise<void>;
}
