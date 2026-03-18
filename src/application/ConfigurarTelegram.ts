import { ConfiguracionTelegram } from '../domain/entities/ConfiguracionTelegram';
import { IRepositorioConfigTelegram } from '../domain/ports/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../domain/ports/IEnviadorTelegram';

export class ConfigurarTelegram {
  constructor(
    private readonly repositorioConfig: IRepositorioConfigTelegram,
    private readonly enviadorTelegram: IEnviadorTelegram,
  ) {}

  async guardarConfiguracion(
    botToken: string,
    chatId: string,
  ): Promise<void> {
    const configuracion: ConfiguracionTelegram = { botToken, chatId };
    await this.repositorioConfig.guardar(configuracion);
  }

  async obtenerConfiguracion(): Promise<ConfiguracionTelegram | null> {
    return this.repositorioConfig.obtener();
  }

  async enviarMensajeDePrueba(): Promise<void> {
    const config = await this.repositorioConfig.obtener();

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
