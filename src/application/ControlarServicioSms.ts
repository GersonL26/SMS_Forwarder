import { IReceptorSms } from '../domain/puertos/IReceptorSms';
import { EvaluarYReenviarSms } from './EvaluarYReenviarSms';

export class ControlarServicioSms {
  constructor(
    private readonly receptorSms: IReceptorSms,
    private readonly evaluarYReenviarSms: EvaluarYReenviarSms,
  ) {}

  iniciar(): void {
    this.receptorSms.iniciarEscucha((remitente, cuerpo) => {
      this.evaluarYReenviarSms.ejecutar(remitente, cuerpo).catch(() => {
        // Error ya registrado en el repositorio de mensajes
      });
    });
  }

  detener(): void {
    this.receptorSms.detenerEscucha();
  }

  estaActivo(): boolean {
    return this.receptorSms.estaEscuchando();
  }
}
