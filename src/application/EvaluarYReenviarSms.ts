import { EstadoMensaje, MensajeSms } from '../domain/entities/MensajeSms';
import { IRepositorioReglas } from '../domain/ports/IRepositorioReglas';
import { IRepositorioMensajes } from '../domain/ports/IRepositorioMensajes';
import { IRepositorioConfigTelegram } from '../domain/ports/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../domain/ports/IEnviadorTelegram';
import { EvaluadorDeReglas } from '../domain/services/EvaluadorDeReglas';

export class EvaluarYReenviarSms {
  constructor(
    private readonly repositorioReglas: IRepositorioReglas,
    private readonly repositorioMensajes: IRepositorioMensajes,
    private readonly repositorioConfig: IRepositorioConfigTelegram,
    private readonly enviadorTelegram: IEnviadorTelegram,
    private readonly evaluadorDeReglas: EvaluadorDeReglas,
  ) {}

  async ejecutar(remitente: string, cuerpo: string): Promise<void> {
    const reglas = await this.repositorioReglas.obtenerTodas();
    const coincide = this.evaluadorDeReglas.coincideConAlgunaRegla(
      remitente,
      cuerpo,
      reglas,
    );

    if (!coincide) {
      await this.registrarMensaje(remitente, cuerpo, EstadoMensaje.FILTRADO);
      return;
    }

    await this.intentarReenviar(remitente, cuerpo);
  }

  private async intentarReenviar(
    remitente: string,
    cuerpo: string,
  ): Promise<void> {
    const config = await this.repositorioConfig.obtener();

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
      const textoTelegram = `📱 SMS de ${remitente}:\n${cuerpo}`;
      await this.enviadorTelegram.enviarMensaje(
        config.botToken,
        config.chatId,
        textoTelegram,
      );
      await this.registrarMensaje(remitente, cuerpo, EstadoMensaje.REENVIADO);
    } catch (error) {
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
}
