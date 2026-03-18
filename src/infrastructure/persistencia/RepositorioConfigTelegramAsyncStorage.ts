import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfiguracionTelegram } from '../../domain/entidades/ConfiguracionTelegram';
import { IRepositorioConfigTelegram } from '../../domain/puertos/IRepositorioConfigTelegram';

const CLAVE = '@sms_forwarder/config_telegram';

export class RepositorioConfigTelegramAsyncStorage
  implements IRepositorioConfigTelegram
{
  async guardar(configuracion: ConfiguracionTelegram): Promise<void> {
    const configOfuscada = {
      botToken: this.ofuscar(configuracion.botToken),
      chatId: configuracion.chatId,
    };
    await AsyncStorage.setItem(CLAVE, JSON.stringify(configOfuscada));
  }

  async obtener(): Promise<ConfiguracionTelegram | null> {
    const datos = await AsyncStorage.getItem(CLAVE);
    if (!datos) return null;

    const configOfuscada = JSON.parse(datos);
    return {
      botToken: this.desofuscar(configOfuscada.botToken),
      chatId: configOfuscada.chatId,
    };
  }

  private ofuscar(valor: string): string {
    return btoa(valor);
  }

  private desofuscar(valor: string): string {
    return atob(valor);
  }
}
