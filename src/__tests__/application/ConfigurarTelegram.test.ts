import { ConfigurarTelegram } from '../../application/ConfigurarTelegram';
import { IRepositorioConfigTelegram } from '../../domain/ports/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../../domain/ports/IEnviadorTelegram';

describe('ConfigurarTelegram', () => {
  let casoDeUso: ConfigurarTelegram;
  let repositorioConfig: jest.Mocked<IRepositorioConfigTelegram>;
  let enviadorTelegram: jest.Mocked<IEnviadorTelegram>;

  beforeEach(() => {
    repositorioConfig = {
      guardar: jest.fn(),
      obtener: jest.fn(),
    };
    enviadorTelegram = {
      enviarMensaje: jest.fn(),
    };
    casoDeUso = new ConfigurarTelegram(repositorioConfig, enviadorTelegram);
  });

  describe('guardarConfiguracion', () => {
    it('debe guardar el token y chatId en el repositorio', async () => {
      await casoDeUso.guardarConfiguracion('mi-token', 'mi-chat');

      expect(repositorioConfig.guardar).toHaveBeenCalledWith({
        botToken: 'mi-token',
        chatId: 'mi-chat',
      });
    });
  });

  describe('obtenerConfiguracion', () => {
    it('debe retornar la configuracion guardada', async () => {
      const configMock = { botToken: 'tk', chatId: 'ch' };
      repositorioConfig.obtener.mockResolvedValue(configMock);

      const resultado = await casoDeUso.obtenerConfiguracion();

      expect(resultado).toEqual(configMock);
    });

    it('debe retornar null si no hay configuracion', async () => {
      repositorioConfig.obtener.mockResolvedValue(null);

      const resultado = await casoDeUso.obtenerConfiguracion();

      expect(resultado).toBeNull();
    });
  });

  describe('enviarMensajeDePrueba', () => {
    it('debe enviar un mensaje de prueba con la configuracion guardada', async () => {
      repositorioConfig.obtener.mockResolvedValue({
        botToken: 'token-bot',
        chatId: 'id-chat',
      });
      enviadorTelegram.enviarMensaje.mockResolvedValue();

      await casoDeUso.enviarMensajeDePrueba();

      expect(enviadorTelegram.enviarMensaje).toHaveBeenCalledWith(
        'token-bot',
        'id-chat',
        expect.stringContaining('SMS Forwarder'),
      );
    });

    it('debe lanzar error si no hay configuracion guardada', async () => {
      repositorioConfig.obtener.mockResolvedValue(null);

      await expect(casoDeUso.enviarMensajeDePrueba()).rejects.toThrow(
        'No hay configuración de Telegram guardada',
      );
    });

    it('debe propagar el error si el envio a Telegram falla', async () => {
      repositorioConfig.obtener.mockResolvedValue({
        botToken: 'tk',
        chatId: 'ch',
      });
      enviadorTelegram.enviarMensaje.mockRejectedValue(
        new Error('Token invalido'),
      );

      await expect(casoDeUso.enviarMensajeDePrueba()).rejects.toThrow(
        'Token invalido',
      );
    });
  });
});
