import { ConfiguracionTelegram } from '../entidades/ConfiguracionTelegram';

export interface IRepositorioConfigTelegram {
  guardar(configuracion: ConfiguracionTelegram): Promise<void>;
  obtener(): Promise<ConfiguracionTelegram | null>;
}
