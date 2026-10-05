import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NovoPedido from './src/screens/NovoPedido';

export default function App() {
  return (
    <SafeAreaProvider>
      <NovoPedido />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
