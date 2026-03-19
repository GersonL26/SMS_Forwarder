import { ObtenerRegistroDeMensajes } from '../../application/ObtenerRegistroDeMensajes';
import { EstadoMensaje, MensajeSms } from '../../domain/entities/MensajeSms';
import { IRepositorioMensajes } from '../../domain/ports/IRepositorioMensajes';

const crearMensajeDePrueba = (
  id: string,
  fechaHora: Date,
): MensajeSms => ({
  id,
  remitente: '+123',
  cuerpo: `Mensaje ${id}`,
  fechaHora,
  estado: EstadoMensaje.REENVIADO,
});

describe('ObtenerRegistroDeMensajes', () => {
  let casoDeUso: ObtenerRegistroDeMensajes;
  let repositorioMensajes: jest.Mocked<IRepositorioMensajes>;

  beforeEach(() => {
    repositorioMensajes = {
      guardar: jest.fn(),
      obtenerTodos: jest.fn(),
      actualizar: jest.fn(),
    };
    casoDeUso = new ObtenerRegistroDeMensajes(repositorioMensajes);
  });

  it('debe retornar los mensajes ordenados del mas reciente al mas antiguo', async () => {
    const mensajes: MensajeSms[] = [
      crearMensajeDePrueba('1', new Date('2026-01-01')),
      crearMensajeDePrueba('3', new Date('2026-03-01')),
      crearMensajeDePrueba('2', new Date('2026-02-01')),
    ];
    repositorioMensajes.obtenerTodos.mockResolvedValue(mensajes);

    const resultado = await casoDeUso.ejecutar();

    expect(resultado[0].id).toBe('3');
    expect(resultado[1].id).toBe('2');
    expect(resultado[2].id).toBe('1');
  });

  it('debe retornar maximo 50 mensajes', async () => {
    const mensajes: MensajeSms[] = Array.from({ length: 60 }, (_, i) =>
      crearMensajeDePrueba(String(i), new Date(2026, 0, i + 1)),
    );
    repositorioMensajes.obtenerTodos.mockResolvedValue(mensajes);

    const resultado = await casoDeUso.ejecutar();

    expect(resultado).toHaveLength(50);
  });

  it('debe retornar lista vacia cuando no hay mensajes', async () => {
    repositorioMensajes.obtenerTodos.mockResolvedValue([]);

    const resultado = await casoDeUso.ejecutar();

    expect(resultado).toEqual([]);
  });
});
