export interface Ajustes {
  readonly prefijoMensaje: string;
  readonly reintentoAutomatico: boolean;
  readonly webhookUrl: string;
  readonly webhookActivo: boolean;
  readonly notificacionActiva: boolean;
}

export const AJUSTES_POR_DEFECTO: Ajustes = {
  prefijoMensaje: '',
  reintentoAutomatico: true,
  webhookUrl: '',
  webhookActivo: false,
  notificacionActiva: true,
};
