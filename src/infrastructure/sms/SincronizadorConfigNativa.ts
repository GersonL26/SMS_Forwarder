import { NativeModules } from 'react-native';
import { IRepositorioConfigTelegram } from '../../domain/ports/IRepositorioConfigTelegram';
import { IRepositorioReglas } from '../../domain/ports/IRepositorioReglas';

/**
 * Sincroniza la configuracion de Telegram y las reglas al modulo nativo
 * (SharedPreferences de Android) para que el ForegroundService pueda
 * reenviar SMS sin depender del hilo JS de React Native.
 */
export class SincronizadorConfigNativa {
  constructor(
    private readonly repositorioConfig: IRepositorioConfigTelegram,
    private readonly repositorioReglas: IRepositorioReglas,
  ) {}

  async sincronizar(): Promise<void> {
    const { SmsListener } = NativeModules;
    if (!SmsListener?.actualizarConfiguracion) return;

    const [configPredeterminada, todasConfigs, reglas] = await Promise.all([
      this.repositorioConfig.obtener(),
      this.repositorioConfig.obtenerTodas(),
      this.repositorioReglas.obtenerTodas(),
    ]);

    if (!configPredeterminada) return;

    SmsListener.actualizarConfiguracion(
      configPredeterminada.botToken,
      configPredeterminada.chatId,
      JSON.stringify(reglas),
      JSON.stringify(todasConfigs),
    );
  }
}
