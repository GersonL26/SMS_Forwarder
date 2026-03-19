export interface DatosWebhook {
  readonly remitente: string;
  readonly cuerpo: string;
  readonly fechaHora: string;
}

export interface IEnviadorWebhook {
  enviar(url: string, datos: DatosWebhook): Promise<void>;
}
