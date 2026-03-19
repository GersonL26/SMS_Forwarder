export interface MensajePendiente {
  readonly id: string;
  readonly remitente: string;
  readonly cuerpo: string;
  readonly fechaHora: Date;
  readonly intentos: number;
}
