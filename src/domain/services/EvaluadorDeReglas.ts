import { ReglaDeReenvio, CampoObjetivo } from '../entities/ReglaDeReenvio';

export class EvaluadorDeReglas {
  coincideConAlgunaRegla(
    remitente: string,
    cuerpo: string,
    reglas: ReglaDeReenvio[],
  ): boolean {
    const reglasActivas = reglas.filter((regla) => regla.activa);
    return reglasActivas.some((regla) =>
      this.coincideConRegla(remitente, cuerpo, regla),
    );
  }

  private coincideConRegla(
    remitente: string,
    cuerpo: string,
    regla: ReglaDeReenvio,
  ): boolean {
    const textoAEvaluar =
      regla.campoObjetivo === CampoObjetivo.REMITENTE ? remitente : cuerpo;

    return regla.esRegex
      ? this.coincidePorRegex(textoAEvaluar, regla.patron)
      : this.coincidePorTextoPlano(textoAEvaluar, regla.patron);
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
