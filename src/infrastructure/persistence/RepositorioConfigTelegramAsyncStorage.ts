import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfiguracionTelegram } from '../../domain/entities/ConfiguracionTelegram';
import { IRepositorioConfigTelegram } from '../../domain/ports/IRepositorioConfigTelegram';

const CLAVE = '@sms_forwarder/configs_telegram';

export class RepositorioConfigTelegramAsyncStorage
  implements IRepositorioConfigTelegram
{
  async guardar(configuracion: ConfiguracionTelegram): Promise<void> {
    const todas = await this.obtenerTodas();
    const indice = todas.findIndex((c) => c.id === configuracion.id);
    if (indice >= 0) {
      todas[indice] = configuracion;
    } else {
      todas.push(configuracion);
    }
    await this.guardarTodas(todas);
  }

  async obtener(): Promise<ConfiguracionTelegram | null> {
    const todas = await this.obtenerTodas();
    return todas.find((c) => c.esPredeterminada) ?? todas[0] ?? null;
  }

  async obtenerTodas(): Promise<ConfiguracionTelegram[]> {
    const datos = await AsyncStorage.getItem(CLAVE);
    if (!datos) return [];
    const lista = JSON.parse(datos) as Array<Record<string, unknown>>;
    return lista.map((c) => ({
      id: c.id as string,
      nombre: c.nombre as string,
      botToken: this.desofuscar(c.botToken as string),
      chatId: c.chatId as string,
      esPredeterminada: c.esPredeterminada as boolean,
    }));
  }

  async obtenerPorId(id: string): Promise<ConfiguracionTelegram | null> {
    const todas = await this.obtenerTodas();
    return todas.find((c) => c.id === id) ?? null;
  }

  async eliminar(id: string): Promise<void> {
    const todas = await this.obtenerTodas();
    const filtradas = todas.filter((c) => c.id !== id);
    await this.guardarTodas(filtradas);
  }

  private async guardarTodas(configs: ConfiguracionTelegram[]): Promise<void> {
    const ofuscadas = configs.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      botToken: this.ofuscar(c.botToken),
      chatId: c.chatId,
      esPredeterminada: c.esPredeterminada,
    }));
    await AsyncStorage.setItem(CLAVE, JSON.stringify(ofuscadas));
  }

  private ofuscar(valor: string): string {
    return btoa(valor);
  }

  private desofuscar(valor: string): string {
    return atob(valor);
  }
}
