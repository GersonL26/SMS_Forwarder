import { EstadoMensaje, MensajeSms } from '../domain/entities/MensajeSms';
import { IRepositorioMensajes } from '../domain/ports/IRepositorioMensajes';
import { IRepositorioConfigTelegram } from '../domain/ports/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../domain/ports/IEnviadorTelegram';
import { IRepositorioAjustes } from '../domain/ports/IRepositorioAjustes';

export class ReintentarMensaje {
  constructor(
    private readonly repositorioMensajes: IRepositorioMensajes,
    private readonly repositorioConfig: IRepositorioConfigTelegram,
    private readonly enviadorTelegram: IEnviadorTelegram,
    private readonly repositorioAjustes: IRepositorioAjustes,
  ) {}

  async ejecutar(mensaje: MensajeSms): Promise<boolean> {
    const config = await this.repositorioConfig.obtener();
    if (!config) return false;

    const ajustes = await this.repositorioAjustes.obtener();
    const prefijo = ajustes.prefijoMensaje
      ? `${ajustes.prefijoMensaje}\n`
      : '';
    try {
      await this.enviadorTelegram.enviarMensaje(
        config.botToken,
        config.chatId,
        `${prefijo}📱 SMS de ${mensaje.remitente}:\n${mensaje.cuerpo}`,
      );

      const mensajeActualizado: MensajeSms = {
        ...mensaje,
        estado: EstadoMensaje.REENVIADO,
        motivoError: undefined,
      };
      await this.repositorioMensajes.actualizar(mensajeActualizado);
      return true;
    } catch {
      return false;
    }
  }
}
