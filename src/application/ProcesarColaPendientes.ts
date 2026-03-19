import { EstadoMensaje, MensajeSms } from '../domain/entities/MensajeSms';
import { IRepositorioPendientes } from '../domain/ports/IRepositorioPendientes';
import { IRepositorioMensajes } from '../domain/ports/IRepositorioMensajes';
import { IRepositorioConfigTelegram } from '../domain/ports/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../domain/ports/IEnviadorTelegram';
import { IRepositorioAjustes } from '../domain/ports/IRepositorioAjustes';

const MAXIMO_INTENTOS = 5;

export class ProcesarColaPendientes {
  constructor(
    private readonly repositorioPendientes: IRepositorioPendientes,
    private readonly repositorioMensajes: IRepositorioMensajes,
    private readonly repositorioConfig: IRepositorioConfigTelegram,
    private readonly enviadorTelegram: IEnviadorTelegram,
    private readonly repositorioAjustes: IRepositorioAjustes,
  ) {}

  async ejecutar(): Promise<void> {
    const config = await this.repositorioConfig.obtener();
    if (!config) return;

    const pendientes = await this.repositorioPendientes.obtenerTodos();
    if (pendientes.length === 0) return;

    const ajustes = await this.repositorioAjustes.obtener();
    const prefijo = ajustes.prefijoMensaje
      ? `${ajustes.prefijoMensaje}\n`
      : '';

    for (const pendiente of pendientes) {
      try {
        const textoTelegram = `${prefijo}📱 SMS de ${pendiente.remitente}:\n${pendiente.cuerpo}`;
        await this.enviadorTelegram.enviarMensaje(
          config.botToken,
          config.chatId,
          textoTelegram,
        );
        await this.repositorioPendientes.eliminar(pendiente.id);
        await this.registrarMensaje(
          pendiente.remitente,
          pendiente.cuerpo,
          EstadoMensaje.REENVIADO,
        );
      } catch {
        const intentosActualizados = pendiente.intentos + 1;
        if (intentosActualizados >= MAXIMO_INTENTOS) {
          await this.repositorioPendientes.eliminar(pendiente.id);
          await this.registrarMensaje(
            pendiente.remitente,
            pendiente.cuerpo,
            EstadoMensaje.ERROR,
            `Falló después de ${MAXIMO_INTENTOS} intentos`,
          );
        } else {
          await this.repositorioPendientes.actualizar({
            ...pendiente,
            intentos: intentosActualizados,
          });
        }
      }
    }
  }

  private async registrarMensaje(
    remitente: string,
    cuerpo: string,
    estado: EstadoMensaje,
    motivoError?: string,
  ): Promise<void> {
    const mensaje: MensajeSms = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      remitente,
      cuerpo,
      fechaHora: new Date(),
      estado,
      motivoError,
    };
    await this.repositorioMensajes.guardar(mensaje);
  }
}
