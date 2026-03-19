import { ConfigurarTelegram } from '../../application/ConfigurarTelegram';
import { IRepositorioConfigTelegram } from '../../domain/ports/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../../domain/ports/IEnviadorTelegram';
import { ConfiguracionTelegram } from '../../domain/entities/ConfiguracionTelegram';

describe('ConfigurarTelegram', () => {
  let casoDeUso: ConfigurarTelegram;
  let repositorioConfig: jest.Mocked<IRepositorioConfigTelegram>;
  let enviadorTelegram: jest.Mocked<IEnviadorTelegram>;

  const configMock: ConfiguracionTelegram = {
    id: '1',
    nombre: 'Bot Principal',
    botToken: 'mi-token',
    chatId: 'mi-chat',
    esPredeterminada: true,
  };

  beforeEach(() => {
    repositorioConfig = {
      guardar: jest.fn(),
      obtener: jest.fn(),
      obtenerTodas: jest.fn(),
      obtenerPorId: jest.fn(),
      eliminar: jest.fn(),
    };
    enviadorTelegram = {
      enviarMensaje: jest.fn(),
    };
    casoDeUso = new ConfigurarTelegram(repositorioConfig, enviadorTelegram);
  });

  describe('guardarConfiguracion', () => {
    it('debe guardar la configuración en el repositorio', async () => {
      await casoDeUso.guardarConfiguracion(configMock);

      expect(repositorioConfig.guardar).toHaveBeenCalledWith(configMock);
    });
  });

  describe('obtenerConfiguracion', () => {
    it('debe retornar la configuracion predeterminada', async () => {
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

  describe('obtenerTodas', () => {
    it('debe retornar todas las configuraciones', async () => {
      repositorioConfig.obtenerTodas.mockResolvedValue([configMock]);

      const resultado = await casoDeUso.obtenerTodas();

      expect(resultado).toEqual([configMock]);
    });
  });

  describe('eliminarConfiguracion', () => {
    it('debe eliminar la configuración por id', async () => {
      await casoDeUso.eliminarConfiguracion('1');

      expect(repositorioConfig.eliminar).toHaveBeenCalledWith('1');
    });
  });

  describe('enviarMensajeDePrueba', () => {
    it('debe enviar un mensaje de prueba con la configuracion predeterminada', async () => {
      repositorioConfig.obtener.mockResolvedValue(configMock);
      enviadorTelegram.enviarMensaje.mockResolvedValue();

      await casoDeUso.enviarMensajeDePrueba();

      expect(enviadorTelegram.enviarMensaje).toHaveBeenCalledWith(
        'mi-token',
        'mi-chat',
        expect.stringContaining('SMS Forwarder'),
      );
    });

    it('debe enviar prueba con una configuración específica por id', async () => {
      repositorioConfig.obtenerPorId.mockResolvedValue(configMock);
      enviadorTelegram.enviarMensaje.mockResolvedValue();

      await casoDeUso.enviarMensajeDePrueba('1');

      expect(repositorioConfig.obtenerPorId).toHaveBeenCalledWith('1');
      expect(enviadorTelegram.enviarMensaje).toHaveBeenCalledWith(
        'mi-token',
        'mi-chat',
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
      repositorioConfig.obtener.mockResolvedValue(configMock);
      enviadorTelegram.enviarMensaje.mockRejectedValue(
        new Error('Token invalido'),
      );

      await expect(casoDeUso.enviarMensajeDePrueba()).rejects.toThrow(
        'Token invalido',
      );
    });
  });
});
