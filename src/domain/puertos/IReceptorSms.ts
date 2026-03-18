export type CallbackSms = (remitente: string, cuerpo: string) => void;

export interface IReceptorSms {
  iniciarEscucha(callback: CallbackSms): void;
  detenerEscucha(): void;
  estaEscuchando(): boolean;
}
