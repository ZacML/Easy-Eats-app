
import { useState } from 'react';
import Login from './src/screens/Login';
import Pedidos from './src/screens/Pedidos';
import FilaCozinha from './src/screens/FilaCozinha';

export default function App() {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [tela, setTela] = useState<'pedidos' | 'fila'>('pedidos');

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }


  if (tela === 'fila') {
    return (
      <FilaCozinha
        onVoltar={() => setTela('pedidos')}
      />
    );
  }


  return (
    <Pedidos
      usuario={usuario}
      onSair={() => {
        setUsuario(null);
        setTela('pedidos');
      }}
      onAbrirFila={() => setTela('fila')}
    />
  );
}
