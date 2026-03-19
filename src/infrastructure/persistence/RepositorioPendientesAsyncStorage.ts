import AsyncStorage from '@react-native-async-storage/async-storage';
import { MensajePendiente } from '../../domain/entities/MensajePendiente';
import { IRepositorioPendientes } from '../../domain/ports/IRepositorioPendientes';

const CLAVE = '@sms_forwarder/pendientes';

export class RepositorioPendientesAsyncStorage implements IRepositorioPendientes {
  async agregar(mensaje: MensajePendiente): Promise<void> {
    const pendientes = await this.obtenerTodos();
    pendientes.push(mensaje);
    await AsyncStorage.setItem(CLAVE, JSON.stringify(pendientes));
  }

  async obtenerTodos(): Promise<MensajePendiente[]> {
    const datos = await AsyncStorage.getItem(CLAVE);
    if (!datos) return [];

    const registros = JSON.parse(datos) as Array<Record<string, unknown>>;
    return registros.map((registro) => ({
      ...registro,
      fechaHora: new Date(registro.fechaHora as string),
    })) as MensajePendiente[];
  }

  async eliminar(id: string): Promise<void> {
    const pendientes = await this.obtenerTodos();
    const filtrados = pendientes.filter((p) => p.id !== id);
    await AsyncStorage.setItem(CLAVE, JSON.stringify(filtrados));
  }

  async actualizar(mensaje: MensajePendiente): Promise<void> {
    const pendientes = await this.obtenerTodos();
    const indice = pendientes.findIndex((p) => p.id === mensaje.id);
    if (indice >= 0) {
      pendientes[indice] = mensaje;
      await AsyncStorage.setItem(CLAVE, JSON.stringify(pendientes));
    }
  }
}
