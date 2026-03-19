import { ReglaDeReenvio, CampoObjetivo } from '../entities/ReglaDeReenvio';

export class EvaluadorDeReglas {
  coincideConAlgunaRegla(
    remitente: string,
    cuerpo: string,
    reglas: ReglaDeReenvio[],
  ): boolean {
    return this.obtenerReglaCoincidente(remitente, cuerpo, reglas) !== null;
  }

  obtenerReglaCoincidente(
    remitente: string,
    cuerpo: string,
    reglas: ReglaDeReenvio[],
  ): ReglaDeReenvio | null {
    const reglasActivas = reglas.filter((regla) => regla.activa);
    return reglasActivas.find((regla) =>
      this.coincideConRegla(remitente, cuerpo, regla),
    ) ?? null;
  }

  private coincideConRegla(
    remitente: string,
    cuerpo: string,
    regla: ReglaDeReenvio,
  ): boolean {
    if (!this.estaDentroDeHorario(regla)) return false;

    const textoAEvaluar =
      regla.campoObjetivo === CampoObjetivo.REMITENTE ? remitente : cuerpo;

    return regla.esRegex
      ? this.coincidePorRegex(textoAEvaluar, regla.patron)
      : this.coincidePorTextoPlano(textoAEvaluar, regla.patron);
  }

  private estaDentroDeHorario(regla: ReglaDeReenvio, ahora = new Date()): boolean {
    if (regla.diasActivos && regla.diasActivos.length > 0) {
      if (!regla.diasActivos.includes(ahora.getDay())) return false;
    }

    if (regla.horarioInicio && regla.horarioFin) {
      const minutos = ahora.getHours() * 60 + ahora.getMinutes();
      const [hi, mi] = regla.horarioInicio.split(':').map(Number);
      const [hf, mf] = regla.horarioFin.split(':').map(Number);
      const inicio = hi * 60 + mi;
      const fin = hf * 60 + mf;

      if (inicio <= fin) {
        if (minutos < inicio || minutos > fin) return false;
      } else {
        if (minutos < inicio && minutos > fin) return false;
      }
    }

    return true;
  }

  private coincidePorTextoPlano(texto: string, patron: string): boolean {
    return texto.toLowerCase().includes(patron.toLowerCase());
  }

  private coincidePorRegex(texto: string, patron: string): boolean {
    try {
      const regex = new RegExp(patron, 'i');
      return regex.test(texto);
    } catch {
      return false;
    }
  }
}
