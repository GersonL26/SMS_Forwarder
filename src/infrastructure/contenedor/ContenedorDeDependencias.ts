import { EvaluadorDeReglas } from '../../domain/servicios/EvaluadorDeReglas';
import { EvaluarYReenviarSms } from '../../application/EvaluarYReenviarSms';
import { GestionarReglas } from '../../application/GestionarReglas';
import { ConfigurarTelegram } from '../../application/ConfigurarTelegram';
import { ObtenerRegistroDeMensajes } from '../../application/ObtenerRegistroDeMensajes';
import { ControlarServicioSms } from '../../application/ControlarServicioSms';
import { RepositorioMensajesAsyncStorage } from '../persistencia/RepositorioMensajesAsyncStorage';
import { RepositorioReglasAsyncStorage } from '../persistencia/RepositorioReglasAsyncStorage';
import { RepositorioConfigTelegramAsyncStorage } from '../persistencia/RepositorioConfigTelegramAsyncStorage';
import { EnviadorTelegramApi } from '../telegram/EnviadorTelegramApi';
import { ReceptorSmsNativo } from '../sms/ReceptorSmsNativo';

export class ContenedorDeDependencias {
  private static instancia: ContenedorDeDependencias;

  readonly evaluarYReenviarSms: EvaluarYReenviarSms;
  readonly gestionarReglas: GestionarReglas;
  readonly configurarTelegram: ConfigurarTelegram;
  readonly obtenerRegistroDeMensajes: ObtenerRegistroDeMensajes;
  readonly controlarServicioSms: ControlarServicioSms;

  private constructor() {
    const repositorioMensajes = new RepositorioMensajesAsyncStorage();
    const repositorioReglas = new RepositorioReglasAsyncStorage();
    const repositorioConfig = new RepositorioConfigTelegramAsyncStorage();
    const enviadorTelegram = new EnviadorTelegramApi();
    const receptorSms = new ReceptorSmsNativo();
    const evaluadorDeReglas = new EvaluadorDeReglas();

    this.evaluarYReenviarSms = new EvaluarYReenviarSms(
      repositorioReglas,
      repositorioMensajes,
      repositorioConfig,
      enviadorTelegram,
      evaluadorDeReglas,
    );

    this.gestionarReglas = new GestionarReglas(repositorioReglas);

    this.configurarTelegram = new ConfigurarTelegram(
      repositorioConfig,
      enviadorTelegram,
    );

    this.obtenerRegistroDeMensajes = new ObtenerRegistroDeMensajes(
      repositorioMensajes,
    );

    this.controlarServicioSms = new ControlarServicioSms(
      receptorSms,
      this.evaluarYReenviarSms,
    );
  }

  static obtenerInstancia(): ContenedorDeDependencias {
    if (!ContenedorDeDependencias.instancia) {
      ContenedorDeDependencias.instancia = new ContenedorDeDependencias();
    }
    return ContenedorDeDependencias.instancia;
  }
}
