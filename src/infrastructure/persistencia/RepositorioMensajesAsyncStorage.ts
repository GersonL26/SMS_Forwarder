import AsyncStorage from '@react-native-async-storage/async-storage';
import { MensajeSms } from '../../domain/entidades/MensajeSms';
import { IRepositorioMensajes } from '../../domain/puertos/IRepositorioMensajes';

const CLAVE = '@sms_forwarder/mensajes';

export class RepositorioMensajesAsyncStorage implements IRepositorioMensajes {
  async guardar(mensaje: MensajeSms): Promise<void> {
    const mensajes = await this.obtenerTodos();
    mensajes.push(mensaje);
    await AsyncStorage.setItem(CLAVE, JSON.stringify(mensajes));
  }

  async obtenerTodos(): Promise<MensajeSms[]> {
    const datos = await AsyncStorage.getItem(CLAVE);
    if (!datos) return [];

    const registros = JSON.parse(datos) as Array<Record<string, unknown>>;
    return registros.map((registro) => ({
      ...registro,
      fechaHora: new Date(registro.fechaHora as string),
    })) as MensajeSms[];
  }
}
