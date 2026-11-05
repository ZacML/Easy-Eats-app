import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { registrarPushToken } from './api';

// Exibe a notificação também com o app aberto.
// (SDK 53+: shouldShowBanner/shouldShowList; em SDK anterior use shouldShowAlert)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function obterPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    // O canal precisa existir antes de pedir a permissão (Android 13+).
    await Notifications.setNotificationChannelAsync('pedidos', {
      name: 'Pedidos prontos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EA580C',
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null; // app segue funcionando sem notificações

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

export async function registrarDispositivo() {
  const token = await obterPushToken();
  if (!token) return;
  if (__DEV__) console.log('Expo push token:', token); // só para testar na etapa 1
  await registrarPushToken(token);
}