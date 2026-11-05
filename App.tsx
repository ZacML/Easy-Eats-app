
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import Login from './src/screens/Login';
import Pedidos from './src/screens/Pedidos';
import FilaCozinha from './src/screens/FilaCozinha';

export default function App() {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [tela, setTela] = useState<'pedidos' | 'fila'>('pedidos');
  const [abrirFilaPendente, setAbrirFilaPendente] = useState(false);
  const ultimaTratada = useRef<string | null>(null); 

  // Toque na notificação (app aberto, em segundo plano ou encerrado)
  const resposta = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!resposta) return;

    const id = resposta.notification.request.identifier;
    if (ultimaTratada.current === id) return;
    ultimaTratada.current = id;

    if (resposta.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      setAbrirFilaPendente(true);
    }
  }, [resposta]);

  // Só navega quando houver sessão ativa
  useEffect(() => {
    if (usuario && abrirFilaPendente) {
      setTela('fila');
      setAbrirFilaPendente(false);
    }
  }, [usuario, abrirFilaPendente]);
  
  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  if (tela === 'fila') {
    return (
      <FilaCozinha
        onVoltar={() => setTela('pedidos')}
        onSair={() => {
          setUsuario(null);
          setTela('pedidos');
        }}
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
