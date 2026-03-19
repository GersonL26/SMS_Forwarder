export interface INotificador {
  notificar(titulo: string, cuerpo: string): Promise<void>;
}
