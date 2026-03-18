import { IEnviadorTelegram } from '../../domain/puertos/IEnviadorTelegram';

const URL_BASE_TELEGRAM = 'https://api.telegram.org';

export class EnviadorTelegramApi implements IEnviadorTelegram {
  async enviarMensaje(
    botToken: string,
    chatId: string,
    texto: string,
  ): Promise<void> {
    const url = `${URL_BASE_TELEGRAM}/bot${botToken}/sendMessage`;

    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: texto }),
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(
        error.description || 'Error al enviar mensaje a Telegram',
      );
    }
  }
}
