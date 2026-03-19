import { EvaluadorDeReglas } from '../../domain/services/EvaluadorDeReglas';
import { CampoObjetivo, ReglaDeReenvio } from '../../domain/entities/ReglaDeReenvio';

describe('EvaluadorDeReglas', () => {
  let evaluador: EvaluadorDeReglas;

  const reglaBase: ReglaDeReenvio = {
    id: '1',
    nombre: 'Test',
    campoObjetivo: CampoObjetivo.CUERPO,
    patron: 'alerta',
    esRegex: false,
    activa: true,
  };

  beforeEach(() => {
    evaluador = new EvaluadorDeReglas();
  });

  it('debe coincidir cuando no hay restricción de horario', () => {
    expect(evaluador.coincideConAlgunaRegla('', 'alerta de seguridad', [reglaBase])).toBe(true);
  });

  it('no debe coincidir cuando el día no está activo', () => {
    const hoy = new Date().getDay();
    const diaInactivo = (hoy + 1) % 7;
    const regla: ReglaDeReenvio = { ...reglaBase, diasActivos: [diaInactivo] };
    expect(evaluador.coincideConAlgunaRegla('', 'alerta', [regla])).toBe(false);
  });

  it('debe coincidir cuando el día actual está activo', () => {
    const hoy = new Date().getDay();
    const regla: ReglaDeReenvio = { ...reglaBase, diasActivos: [hoy] };
    expect(evaluador.coincideConAlgunaRegla('', 'alerta', [regla])).toBe(true);
  });

  it('debe coincidir cuando la hora está dentro del rango', () => {
    const regla: ReglaDeReenvio = { ...reglaBase, horarioInicio: '00:00', horarioFin: '23:59' };
    expect(evaluador.coincideConAlgunaRegla('', 'alerta', [regla])).toBe(true);
  });

  it('no debe coincidir cuando la hora está fuera del rango', () => {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const inicio = ((horaActual + 2) % 24).toString().padStart(2, '0') + ':00';
    const fin = ((horaActual + 4) % 24).toString().padStart(2, '0') + ':00';
    const regla: ReglaDeReenvio = { ...reglaBase, horarioInicio: inicio, horarioFin: fin };
    expect(evaluador.coincideConAlgunaRegla('', 'alerta', [regla])).toBe(false);
  });

  it('debe coincidir con horario nocturno que cruza medianoche', () => {
    const regla: ReglaDeReenvio = { ...reglaBase, horarioInicio: '22:00', horarioFin: '06:00' };
    const ahora = new Date();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();
    const esperado = minutos >= 22 * 60 || minutos <= 6 * 60;
    expect(evaluador.coincideConAlgunaRegla('', 'alerta', [regla])).toBe(esperado);
  });

  it('debe devolver la regla coincidente con obtenerReglaCoincidente', () => {
    const resultado = evaluador.obtenerReglaCoincidente('', 'alerta severa', [reglaBase]);
    expect(resultado).not.toBeNull();
    expect(resultado?.id).toBe('1');
  });

  it('debe devolver null si no hay coincidencia', () => {
    const resultado = evaluador.obtenerReglaCoincidente('', 'todo bien', [reglaBase]);
    expect(resultado).toBeNull();
  });

  it('debe ignorar reglas inactivas', () => {
    const reglaInactiva: ReglaDeReenvio = { ...reglaBase, activa: false };
    expect(evaluador.coincideConAlgunaRegla('', 'alerta', [reglaInactiva])).toBe(false);
  });
});
