import { AppRegistry } from 'react-native';
import { ContenedorDeDependencias } from './src/infrastructure/container/ContenedorDeDependencias';

const SmsReceivedHeadlessTask = async (taskData: {
  remitente: string;
  cuerpo: string;
}) => {
  const { remitente, cuerpo } = taskData;
  if (!remitente || !cuerpo) return;

  try {
    const contenedor = ContenedorDeDependencias.obtenerInstancia();
    await contenedor.evaluarYReenviarSms.ejecutar(remitente, cuerpo);
  } catch (error) {
    console.error('Error en HeadlessTask SMS:', error);
  }
};

AppRegistry.registerHeadlessTask(
  'SmsReceivedHeadlessTask',
  () => SmsReceivedHeadlessTask,
);
