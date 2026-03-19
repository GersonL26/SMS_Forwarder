import { ConfiguracionTelegram } from '../domain/entities/ConfiguracionTelegram';
import { IRepositorioConfigTelegram } from '../domain/ports/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../domain/ports/IEnviadorTelegram';

export class ConfigurarTelegram {
  constructor(
    private readonly repositorioConfig: IRepositorioConfigTelegram,
    private readonly enviadorTelegram: IEnviadorTelegram,
  ) {}

  async guardarConfiguracion(config: ConfiguracionTelegram): Promise<void> {
    await this.repositorioConfig.guardar(config);
  }

  async obtenerConfiguracion(): Promise<ConfiguracionTelegram | null> {
    return this.repositorioConfig.obtener();
  }

  async obtenerTodas(): Promise<ConfiguracionTelegram[]> {
    return this.repositorioConfig.obtenerTodas();
  }

  async eliminarConfiguracion(id: string): Promise<void> {
    await this.repositorioConfig.eliminar(id);
  }

  async enviarMensajeDePrueba(configId?: string): Promise<void> {
    const config = configId
      ? await this.repositorioConfig.obtenerPorId(configId)
      : await this.repositorioConfig.obtener();

    if (!config) {
      throw new Error('No hay configuración de Telegram guardada');
    }

    await this.enviadorTelegram.enviarMensaje(
      config.botToken,
      config.chatId,
      '✅ SMS Forwarder: Conexión exitosa. El bot está configurado correctamente.',
    );
  }
}
