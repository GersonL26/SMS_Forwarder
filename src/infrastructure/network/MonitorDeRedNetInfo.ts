import NetInfo from '@react-native-community/netinfo';
import { IMonitorDeRed } from '../../domain/ports/IMonitorDeRed';

export class MonitorDeRedNetInfo implements IMonitorDeRed {
  async estaConectado(): Promise<boolean> {
    const estado = await NetInfo.fetch();
    return estado.isConnected === true;
  }

  alRecuperarConexion(callback: () => void): () => void {
    let estabaDesconectado = false;

    const cancelar = NetInfo.addEventListener((estado) => {
      const conectado = estado.isConnected === true;

      if (!conectado) {
        estabaDesconectado = true;
      }

      if (conectado && estabaDesconectado) {
        estabaDesconectado = false;
        callback();
      }
    });

    return cancelar;
  }
}
