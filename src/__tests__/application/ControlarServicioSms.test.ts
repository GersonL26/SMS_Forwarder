import { ControlarServicioSms } from '../../application/ControlarServicioSms';
import { EvaluarYReenviarSms } from '../../application/EvaluarYReenviarSms';
import { IReceptorSms, CallbackSms } from '../../domain/ports/IReceptorSms';

describe('ControlarServicioSms', () => {
  let casoDeUso: ControlarServicioSms;
  let receptorSms: jest.Mocked<IReceptorSms>;
  let evaluarYReenviar: jest.Mocked<Pick<EvaluarYReenviarSms, 'ejecutar'>>;

  beforeEach(() => {
    receptorSms = {
      iniciarEscucha: jest.fn(),
      detenerEscucha: jest.fn(),
      estaEscuchando: jest.fn(),
    };
    evaluarYReenviar = {
      ejecutar: jest.fn().mockResolvedValue(undefined),
    };
    casoDeUso = new ControlarServicioSms(
      receptorSms,
      evaluarYReenviar as unknown as EvaluarYReenviarSms,
    );
  });

  describe('iniciar', () => {
    it('debe iniciar la escucha de SMS', () => {
      casoDeUso.iniciar();

      expect(receptorSms.iniciarEscucha).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('debe ejecutar el caso de uso al recibir un SMS', () => {
      receptorSms.iniciarEscucha.mockImplementation(
        (callback: CallbackSms) => {
          callback('+5491100001111', 'SMS de prueba');
        },
      );

      casoDeUso.iniciar();

      expect(evaluarYReenviar.ejecutar).toHaveBeenCalledWith(
        '+5491100001111',
        'SMS de prueba',
      );
    });
  });

  describe('detener', () => {
    it('debe detener la escucha de SMS', () => {
      casoDeUso.detener();

      expect(receptorSms.detenerEscucha).toHaveBeenCalled();
    });
  });

  describe('estaActivo', () => {
    it('debe retornar true cuando el receptor esta escuchando', () => {
      receptorSms.estaEscuchando.mockReturnValue(true);

      expect(casoDeUso.estaActivo()).toBe(true);
    });

    it('debe retornar false cuando el receptor no esta escuchando', () => {
      receptorSms.estaEscuchando.mockReturnValue(false);

      expect(casoDeUso.estaActivo()).toBe(false);
    });
  });
});
