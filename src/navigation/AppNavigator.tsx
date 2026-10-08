
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../screens/Login';
import Pedidos from '../screens/Pedidos';
import NovoPedido from '../screens/NovoPedido';
import FilaCozinha from '../screens/FilaCozinha';

export type RootStackParamList = {
  Login: undefined;
  Pedidos: undefined;
  NovoPedido: undefined;
  FilaCozinha: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Pedidos" component={Pedidos} />
      <Stack.Screen name="NovoPedido" component={NovoPedido} />
      <Stack.Screen name="FilaCozinha" component={FilaCozinha} />
    </Stack.Navigator>
  );
}