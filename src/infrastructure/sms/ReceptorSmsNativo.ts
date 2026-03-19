import { NativeModules, NativeEventEmitter } from 'react-native';
import {
  IReceptorSms,
  CallbackSms,
} from '../../domain/ports/IReceptorSms';

const { SmsListener } = NativeModules;

export class ReceptorSmsNativo implements IReceptorSms {
  private escuchando = false;
  private suscripcion: ReturnType<NativeEventEmitter['addListener']> | null =
    null;

  iniciarEscucha(callback: CallbackSms): void {
    if (this.escuchando) return;

    SmsListener.startListening();

    const emisor = new NativeEventEmitter(SmsListener);
    this.suscripcion = emisor.addListener(
      'sms_received',
      (evento: { remitente: string; cuerpo: string }) => {
        callback(evento.remitente, evento.cuerpo);
      },
    );
    this.escuchando = true;
  }

  detenerEscucha(): void {
    SmsListener.stopListening();

    if (this.suscripcion) {
      this.suscripcion.remove();
      this.suscripcion = null;
    }
    this.escuchando = false;
  }

  estaEscuchando(): boolean {
    return this.escuchando;
  }

  async consultarEstadoNativo(): Promise<boolean> {
    return SmsListener.getEstaEscuchando();
  }

  actualizarConfiguracion(
    token: string,
    chatId: string,
    reglas: string,
    todasConfigs: string,
  ): void {
    SmsListener.actualizarConfiguracion(token, chatId, reglas, todasConfigs);
  }
}
