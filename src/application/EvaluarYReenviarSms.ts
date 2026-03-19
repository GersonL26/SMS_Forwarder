import { EstadoMensaje, MensajeSms } from '../domain/entities/MensajeSms';
import { MensajePendiente } from '../domain/entities/MensajePendiente';
import { IRepositorioReglas } from '../domain/ports/IRepositorioReglas';
import { IRepositorioMensajes } from '../domain/ports/IRepositorioMensajes';
import { IRepositorioConfigTelegram } from '../domain/ports/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../domain/ports/IEnviadorTelegram';
import { IRepositorioAjustes } from '../domain/ports/IRepositorioAjustes';
import { IRepositorioPendientes } from '../domain/ports/IRepositorioPendientes';
import { IMonitorDeRed } from '../domain/ports/IMonitorDeRed';
import { IEnviadorWebhook } from '../domain/ports/IEnviadorWebhook';
import { INotificador } from '../domain/ports/INotificador';
import { EvaluadorDeReglas } from '../domain/services/EvaluadorDeReglas';

export class EvaluarYReenviarSms {
  constructor(
    private readonly repositorioReglas: IRepositorioReglas,
    private readonly repositorioMensajes: IRepositorioMensajes,
    private readonly repositorioConfig: IRepositorioConfigTelegram,
    private readonly enviadorTelegram: IEnviadorTelegram,
    private readonly evaluadorDeReglas: EvaluadorDeReglas,
    private readonly repositorioAjustes: IRepositorioAjustes,
    private readonly repositorioPendientes: IRepositorioPendientes,
    private readonly monitorDeRed: IMonitorDeRed,
    private readonly enviadorWebhook: IEnviadorWebhook,
    private readonly notificador: INotificador,
  ) {}

  async ejecutar(remitente: string, cuerpo: string): Promise<void> {
    const reglas = await this.repositorioReglas.obtenerTodas();
    const reglaCoincidente = this.evaluadorDeReglas.obtenerReglaCoincidente(
      remitente,
      cuerpo,
      reglas,
    );

    if (!reglaCoincidente) {
      await this.registrarMensaje(remitente, cuerpo, EstadoMensaje.FILTRADO);
      return;
    }

    await this.intentarReenviar(remitente, cuerpo, reglaCoincidente.configTelegramId);
  }

  private async intentarReenviar(
    remitente: string,
    cuerpo: string,
    configTelegramId?: string,
  ): Promise<void> {
    const config = configTelegramId
      ? await this.repositorioConfig.obtenerPorId(configTelegramId)
      : await this.repositorioConfig.obtener();

    if (!config) {
      await this.registrarMensaje(
        remitente,
        cuerpo,
        EstadoMensaje.ERROR,
        'Configuración de Telegram no encontrada',
      );
      return;
    }

    try {
      const ajustes = await this.repositorioAjustes.obtener();
      const prefijo = ajustes.prefijoMensaje
        ? `${ajustes.prefijoMensaje}\n`
        : '';
      const textoTelegram = `${prefijo}📱 SMS de ${remitente}:\n${cuerpo}`;
      await this.enviadorTelegram.enviarMensaje(
        config.botToken,
        config.chatId,
        textoTelegram,
      );
      await this.enviarWebhookSiActivo(ajustes, remitente, cuerpo);
      await this.notificarSiActivo(ajustes, remitente);
      await this.registrarMensaje(remitente, cuerpo, EstadoMensaje.REENVIADO);
    } catch (error) {
      const ajustes = await this.repositorioAjustes.obtener();
      const conectado = await this.monitorDeRed.estaConectado();

      if (!conectado && ajustes.reintentoAutomatico) {
        await this.encolarParaReintento(remitente, cuerpo);
        return;
      }

      const motivo =
        error instanceof Error ? error.message : 'Error desconocido';
      await this.registrarMensaje(
        remitente,
        cuerpo,
        EstadoMensaje.ERROR,
        motivo,
      );
    }
  }

  private async encolarParaReintento(
    remitente: string,
    cuerpo: string,
  ): Promise<void> {
    const pendiente: MensajePendiente = {
      id: this.generarId(),
      remitente,
      cuerpo,
      fechaHora: new Date(),
      intentos: 0,
    };
    await this.repositorioPendientes.agregar(pendiente);
    await this.registrarMensaje(
      remitente,
      cuerpo,
      EstadoMensaje.ERROR,
      'Sin conexión — encolado para reintento automático',
    );
  }

  private async registrarMensaje(
    remitente: string,
    cuerpo: string,
    estado: EstadoMensaje,
    motivoError?: string,
  ): Promise<void> {
    const mensaje: MensajeSms = {
      id: this.generarId(),
      remitente,
      cuerpo,
      fechaHora: new Date(),
      estado,
      motivoError,
    };
    await this.repositorioMensajes.guardar(mensaje);
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private async enviarWebhookSiActivo(
    ajustes: { webhookActivo: boolean; webhookUrl: string },
    remitente: string,
    cuerpo: string,
  ): Promise<void> {
    if (!ajustes.webhookActivo || !ajustes.webhookUrl) return;

    try {
      await this.enviadorWebhook.enviar(ajustes.webhookUrl, {
        remitente,
        cuerpo,
        fechaHora: new Date().toISOString(),
      });
    } catch {
      // Webhook failure should not block the main flow
    }
  }

  private async notificarSiActivo(
    ajustes: { notificacionActiva: boolean },
    remitente: string,
  ): Promise<void> {
    if (!ajustes.notificacionActiva) return;

    try {
      await this.notificador.notificar(
        'SMS Reenviado',
        `Mensaje de ${remitente} reenviado a Telegram`,
      );
    } catch {
      // Notification failure should not block the main flow
    }
  }
}
