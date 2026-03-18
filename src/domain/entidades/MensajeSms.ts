export enum EstadoMensaje {
  REENVIADO = 'reenviado',
  FILTRADO = 'filtrado',
  ERROR = 'error',
}

export interface MensajeSms {
  readonly id: string;
  readonly remitente: string;
  readonly cuerpo: string;
  readonly fechaHora: Date;
  readonly estado: EstadoMensaje;
  readonly motivoError?: string;
}
