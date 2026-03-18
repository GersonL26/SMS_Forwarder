import { EvaluarYReenviarSms } from '../../application/EvaluarYReenviarSms';
import { EvaluadorDeReglas } from '../../domain/servicios/EvaluadorDeReglas';
import { EstadoMensaje } from '../../domain/entidades/MensajeSms';
import { CampoObjetivo } from '../../domain/entidades/ReglaDeReenvio';
import { IRepositorioReglas } from '../../domain/puertos/IRepositorioReglas';
import { IRepositorioMensajes } from '../../domain/puertos/IRepositorioMensajes';
import { IRepositorioConfigTelegram } from '../../domain/puertos/IRepositorioConfigTelegram';
import { IEnviadorTelegram } from '../../domain/puertos/IEnviadorTelegram';

describe('EvaluarYReenviarSms', () => {
  let casoDeUso: EvaluarYReenviarSms;
  let repositorioReglas: jest.Mocked<IRepositorioReglas>;
  let repositorioMensajes: jest.Mocked<IRepositorioMensajes>;
  let repositorioConfig: jest.Mocked<IRepositorioConfigTelegram>;
  let enviadorTelegram: jest.Mocked<IEnviadorTelegram>;

  beforeEach(() => {
    repositorioReglas = {
      guardar: jest.fn(),
      obtenerTodas: jest.fn(),
      obtenerPorId: jest.fn(),
      eliminar: jest.fn(),
    };
    repositorioMensajes = {
      guardar: jest.fn(),
      obtenerTodos: jest.fn(),
    };
    repositorioConfig = {
      guardar: jest.fn(),
      obtener: jest.fn(),
    };
    enviadorTelegram = {
      enviarMensaje: jest.fn(),
    };

    casoDeUso = new EvaluarYReenviarSms(
      repositorioReglas,
      repositorioMensajes,
      repositorioConfig,
      enviadorTelegram,
      new EvaluadorDeReglas(),
    );
  });

  it('debe registrar como filtrado cuando no coincide con ninguna regla', async () => {
    repositorioReglas.obtenerTodas.mockResolvedValue([]);

    await casoDeUso.ejecutar('+1234567890', 'Hola mundo');

    expect(repositorioMensajes.guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        remitente: '+1234567890',
        cuerpo: 'Hola mundo',
        estado: EstadoMensaje.FILTRADO,
      }),
    );
    expect(enviadorTelegram.enviarMensaje).not.toHaveBeenCalled();
  });

  it('debe reenviar cuando coincide con una regla activa por texto plano', async () => {
    repositorioReglas.obtenerTodas.mockResolvedValue([
      {
        id: '1',
        nombre: 'Banco',
        campoObjetivo: CampoObjetivo.REMITENTE,
        patron: 'banco',
        esRegex: false,
        activa: true,
      },
    ]);
    repositorioConfig.obtener.mockResolvedValue({
      botToken: 'token123',
      chatId: 'chat456',
    });
    enviadorTelegram.enviarMensaje.mockResolvedValue();

    await casoDeUso.ejecutar('Banco Nacion', 'Tu saldo es $1000');

    expect(enviadorTelegram.enviarMensaje).toHaveBeenCalledWith(
      'token123',
      'chat456',
      expect.stringContaining('Banco Nacion'),
    );
    expect(repositorioMensajes.guardar).toHaveBeenCalledWith(
      expect.objectContaining({ estado: EstadoMensaje.REENVIADO }),
    );
  });

  it('debe reenviar cuando coincide con una regla activa por regex', async () => {
    repositorioReglas.obtenerTodas.mockResolvedValue([
      {
        id: '2',
        nombre: 'Codigo OTP',
        campoObjetivo: CampoObjetivo.CUERPO,
        patron: '\\d{6}',
        esRegex: true,
        activa: true,
      },
    ]);
    repositorioConfig.obtener.mockResolvedValue({
      botToken: 'tk',
      chatId: 'ch',
    });
    enviadorTelegram.enviarMensaje.mockResolvedValue();

    await casoDeUso.ejecutar('+999', 'Tu codigo es 482910');

    expect(enviadorTelegram.enviarMensaje).toHaveBeenCalled();
    expect(repositorioMensajes.guardar).toHaveBeenCalledWith(
      expect.objectContaining({ estado: EstadoMensaje.REENVIADO }),
    );
  });

  it('debe ignorar reglas inactivas', async () => {
    repositorioReglas.obtenerTodas.mockResolvedValue([
      {
        id: '1',
        nombre: 'Inactiva',
        campoObjetivo: CampoObjetivo.REMITENTE,
        patron: 'banco',
        esRegex: false,
        activa: false,
      },
    ]);

    await casoDeUso.ejecutar('Banco', 'Hola');

    expect(repositorioMensajes.guardar).toHaveBeenCalledWith(
      expect.objectContaining({ estado: EstadoMensaje.FILTRADO }),
    );
  });

  it('debe registrar error cuando no hay configuracion de Telegram', async () => {
    repositorioReglas.obtenerTodas.mockResolvedValue([
      {
        id: '1',
        nombre: 'Todo',
        campoObjetivo: CampoObjetivo.CUERPO,
        patron: '.*',
        esRegex: true,
        activa: true,
      },
    ]);
    repositorioConfig.obtener.mockResolvedValue(null);

    await casoDeUso.ejecutar('+123', 'Hola');

    expect(repositorioMensajes.guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: EstadoMensaje.ERROR,
        motivoError: 'Configuración de Telegram no encontrada',
      }),
    );
  });

  it('debe registrar error cuando falla el envio a Telegram', async () => {
    repositorioReglas.obtenerTodas.mockResolvedValue([
      {
        id: '1',
        nombre: 'Todo',
        campoObjetivo: CampoObjetivo.CUERPO,
        patron: '.*',
        esRegex: true,
        activa: true,
      },
    ]);
    repositorioConfig.obtener.mockResolvedValue({
      botToken: 'token',
      chatId: 'chat',
    });
    enviadorTelegram.enviarMensaje.mockRejectedValue(
      new Error('Sin conexion a internet'),
    );

    await casoDeUso.ejecutar('+123', 'Hola');

    expect(repositorioMensajes.guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: EstadoMensaje.ERROR,
        motivoError: 'Sin conexion a internet',
      }),
    );
  });

  it('debe registrar error desconocido cuando la excepcion no es Error', async () => {
    repositorioReglas.obtenerTodas.mockResolvedValue([
      {
        id: '1',
        nombre: 'Todo',
        campoObjetivo: CampoObjetivo.CUERPO,
        patron: '.*',
        esRegex: true,
        activa: true,
      },
    ]);
    repositorioConfig.obtener.mockResolvedValue({
      botToken: 'token',
      chatId: 'chat',
    });
    enviadorTelegram.enviarMensaje.mockRejectedValue('fallo desconocido');

    await casoDeUso.ejecutar('+123', 'Hola');

    expect(repositorioMensajes.guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: EstadoMensaje.ERROR,
        motivoError: 'Error desconocido',
      }),
    );
  });
});
