export interface IMonitorDeRed {
  estaConectado(): Promise<boolean>;
  alRecuperarConexion(callback: () => void): () => void;
}
