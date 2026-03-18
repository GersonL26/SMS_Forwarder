export interface IEnviadorTelegram {
  enviarMensaje(botToken: string, chatId: string, texto: string): Promise<void>;
}
