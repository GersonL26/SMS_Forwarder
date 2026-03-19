import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ajustes, AJUSTES_POR_DEFECTO } from '../../domain/entities/Ajustes';
import { IRepositorioAjustes } from '../../domain/ports/IRepositorioAjustes';

const CLAVE = '@sms_forwarder/ajustes';

export class RepositorioAjustesAsyncStorage implements IRepositorioAjustes {
  async guardar(ajustes: Ajustes): Promise<void> {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(ajustes));
  }

  async obtener(): Promise<Ajustes> {
    const datos = await AsyncStorage.getItem(CLAVE);
    if (!datos) return AJUSTES_POR_DEFECTO;
    return { ...AJUSTES_POR_DEFECTO, ...JSON.parse(datos) };
  }
}
