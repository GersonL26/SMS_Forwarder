import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReglaDeReenvio } from '../../domain/entities/ReglaDeReenvio';
import { IRepositorioReglas } from '../../domain/ports/IRepositorioReglas';

const CLAVE = '@sms_forwarder/reglas';

export class RepositorioReglasAsyncStorage implements IRepositorioReglas {
  async guardar(regla: ReglaDeReenvio): Promise<void> {
    const reglas = await this.obtenerTodas();
    const indice = reglas.findIndex((r) => r.id === regla.id);

    if (indice >= 0) {
      reglas[indice] = regla;
    } else {
      reglas.push(regla);
    }

    await AsyncStorage.setItem(CLAVE, JSON.stringify(reglas));
  }

  async obtenerTodas(): Promise<ReglaDeReenvio[]> {
    const datos = await AsyncStorage.getItem(CLAVE);
    if (!datos) return [];
    return JSON.parse(datos) as ReglaDeReenvio[];
  }

  async obtenerPorId(id: string): Promise<ReglaDeReenvio | null> {
    const reglas = await this.obtenerTodas();
    return reglas.find((r) => r.id === id) ?? null;
  }

  async eliminar(id: string): Promise<void> {
    const reglas = await this.obtenerTodas();
    const filtradas = reglas.filter((r) => r.id !== id);
    await AsyncStorage.setItem(CLAVE, JSON.stringify(filtradas));
  }
}
