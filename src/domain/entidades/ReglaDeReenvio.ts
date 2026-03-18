export enum CampoObjetivo {
  REMITENTE = 'remitente',
  CUERPO = 'cuerpo',
}

export interface ReglaDeReenvio {
  readonly id: string;
  readonly nombre: string;
  readonly campoObjetivo: CampoObjetivo;
  readonly patron: string;
  readonly esRegex: boolean;
  readonly activa: boolean;
}
