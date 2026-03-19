import { IEnviadorWebhook, DatosWebhook } from '../../domain/ports/IEnviadorWebhook';

export class EnviadorWebhookHttp implements IEnviadorWebhook {
  async enviar(url: string, datos: DatosWebhook): Promise<void> {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) {
      throw new Error(`Webhook respondió con status ${respuesta.status}`);
    }
  }
}
