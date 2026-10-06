import { useState } from 'react';
import Login from './src/screens/Login';
import Pedidos from './src/screens/Pedidos';

export default function App() {
  const [usuario, setUsuario] = useState<string | null>(null);

  if (!usuario) return <Login onLogin={setUsuario} />;
  return <Pedidos usuario={usuario} onSair={() => setUsuario(null)} />;
}
