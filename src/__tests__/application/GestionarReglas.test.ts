import { GestionarReglas } from '../../application/GestionarReglas';
import { CampoObjetivo, ReglaDeReenvio } from '../../domain/entidades/ReglaDeReenvio';
import { IRepositorioReglas } from '../../domain/puertos/IRepositorioReglas';

describe('GestionarReglas', () => {
  let casoDeUso: GestionarReglas;
  let repositorioReglas: jest.Mocked<IRepositorioReglas>;

  beforeEach(() => {
    repositorioReglas = {
      guardar: jest.fn(),
      obtenerTodas: jest.fn(),
      obtenerPorId: jest.fn(),
      eliminar: jest.fn(),
    };
    casoDeUso = new GestionarReglas(repositorioReglas);
  });

  describe('crearRegla', () => {
    it('debe crear una regla con id generado y guardarla', async () => {
      const datos = {
        nombre: 'Banco',
        campoObjetivo: CampoObjetivo.REMITENTE,
        patron: 'banco',
        esRegex: false,
        activa: true,
      };

      const resultado = await casoDeUso.crearRegla(datos);

      expect(resultado.id).toBeDefined();
      expect(resultado.nombre).toBe('Banco');
      expect(resultado.patron).toBe('banco');
      expect(repositorioReglas.guardar).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Banco' }),
      );
    });
  });

  describe('editarRegla', () => {
    it('debe guardar la regla editada', async () => {
      const regla: ReglaDeReenvio = {
        id: 'abc',
        nombre: 'Editada',
        campoObjetivo: CampoObjetivo.CUERPO,
        patron: 'urgente',
        esRegex: false,
        activa: true,
      };

      await casoDeUso.editarRegla(regla);

      expect(repositorioReglas.guardar).toHaveBeenCalledWith(regla);
    });
  });

  describe('eliminarRegla', () => {
    it('debe eliminar la regla por id', async () => {
      await casoDeUso.eliminarRegla('abc');

      expect(repositorioReglas.eliminar).toHaveBeenCalledWith('abc');
    });
  });

  describe('obtenerReglas', () => {
    it('debe retornar todas las reglas', async () => {
      const reglasMock: ReglaDeReenvio[] = [
        {
          id: '1',
          nombre: 'R1',
          campoObjetivo: CampoObjetivo.REMITENTE,
          patron: 'test',
          esRegex: false,
          activa: true,
        },
      ];
      repositorioReglas.obtenerTodas.mockResolvedValue(reglasMock);

      const resultado = await casoDeUso.obtenerReglas();

      expect(resultado).toEqual(reglasMock);
    });
  });

  describe('alternarEstado', () => {
    it('debe activar una regla inactiva', async () => {
      repositorioReglas.obtenerPorId.mockResolvedValue({
        id: '1',
        nombre: 'R1',
        campoObjetivo: CampoObjetivo.REMITENTE,
        patron: 'test',
        esRegex: false,
        activa: false,
      });

      const resultado = await casoDeUso.alternarEstado('1');

      expect(resultado.activa).toBe(true);
      expect(repositorioReglas.guardar).toHaveBeenCalledWith(
        expect.objectContaining({ activa: true }),
      );
    });

    it('debe desactivar una regla activa', async () => {
      repositorioReglas.obtenerPorId.mockResolvedValue({
        id: '1',
        nombre: 'R1',
        campoObjetivo: CampoObjetivo.REMITENTE,
        patron: 'test',
        esRegex: false,
        activa: true,
      });

      const resultado = await casoDeUso.alternarEstado('1');

      expect(resultado.activa).toBe(false);
    });

    it('debe lanzar error cuando la regla no existe', async () => {
      repositorioReglas.obtenerPorId.mockResolvedValue(null);

      await expect(casoDeUso.alternarEstado('inexistente')).rejects.toThrow(
        'Regla con id inexistente no encontrada',
      );
    });
  });
});
