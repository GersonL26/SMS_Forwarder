import * as Notifications from 'expo-notifications';
import { INotificador } from '../../domain/ports/INotificador';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificadorExpo implements INotificador {
  async notificar(titulo: string, cuerpo: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: cuerpo },
      trigger: null,
    });
  }
}
