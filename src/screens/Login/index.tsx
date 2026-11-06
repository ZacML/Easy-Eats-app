import { Feather, Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { login as loginApi, logout, setToken, validarSessao } from '../../services/api';
import {
  biometriaHabilitada,
  entrarComBiometria,
  habilitarBiometria,
  limparBiometria,
  verificarDisponibilidade,
  type FalhaBiometria,
} from '../../services/biometria';
import { styles, LARANJA } from './styles';
import { registrarDispositivo } from '../../services/notificacoes';

type Props = { onLogin: (username: string) => void };

const MENSAGENS_FALHA: Partial<Record<FalhaBiometria, string>> = {
  nao_reconhecida: 'Digital não reconhecida. Tente novamente.',
  bloqueado: 'Muitas tentativas. Aguarde um instante ou entre com usuário e senha.',
  sem_digital:
    'Nenhuma digital cadastrada. Cadastre uma nas configurações do aparelho ou entre com usuário e senha.',
  invalidada: 'Suas digitais foram alteradas. Entre com usuário e senha para reativar.',
  erro: 'Não foi possível usar a digital. Tente novamente ou entre com usuário e senha.',
};

function perguntarDigital(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Impressão digital',
      'Quer acessar o Easy-Eats usando sua impressão digital?',
      [
        { text: 'Agora não', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Sim, habilitar', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState<'carregando' | 'biometria' | 'senha'>('carregando');

  useEffect(() => {
    biometriaHabilitada().then((ativa) => setModo(ativa ? 'biometria' : 'senha'));
  }, []);

  function concluirLogin(usuario: string) {
    registrarDispositivo()
      .then(() => console.log('Dispositivo registrado com sucesso!'))
      .catch((error) => console.error('Erro ao registrar dispositivo:', error));
    onLogin(usuario);
  }

  // Nunca lança: o login já foi feito, a digital é opcional.
  async function oferecerDigital(token: string, usuario: string) {
    try {
      if (await biometriaHabilitada()) return;
      if ((await verificarDisponibilidade()) !== 'disponivel') return;
      if (!(await perguntarDigital())) return;

      const r = await habilitarBiometria(token, usuario);
      if (!r.ok && r.falha !== 'cancelado') {
        Alert.alert('Impressão digital', 'Não foi possível habilitar a digital agora.');
      }
    } catch (e) {
      console.error('Erro ao oferecer digital:', e);
    }
  }

  async function entrarComDigital() {
    setErro('');
    setCarregando(true);
    try {
      const r = await entrarComBiometria();

      if (!r.ok) {
        if (r.falha === 'cancelado') return;
        if (r.falha === 'invalidada' || r.falha === 'sem_digital') setModo('senha');
        setErro(MENSAGENS_FALHA[r.falha] ?? MENSAGENS_FALHA.erro!);
        return;
      }

      setToken(r.token);
      try {
        if (!(await validarSessao())) {
          await limparBiometria();
          setModo('senha');
          setErro('Sua sessão expirou. Entre com usuário e senha.');
          return;
        }
      } catch {
        // rede/servidor: mantém a digital habilitada
        logout();
        setErro('Não foi possível conectar ao servidor. Tente novamente.');
        return;
      }

      concluirLogin(r.usuario);
    } finally {
      setCarregando(false);
    }
  }

  async function entrar() {
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }

    const usuario = email.trim();

    try {
      setErro('');
      setCarregando(true);
      const token = await loginApi(usuario, senha);
      await oferecerDigital(token, usuario);
      concluirLogin(usuario);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.tela} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" />
      <View style={styles.topo}>
        <View style={styles.logo}>
          <Feather name="truck" size={30} color={LARANJA} />
        </View>
        <Text style={styles.marca}>EasyEats</Text>
        <Text style={styles.slogan}>
          O jeito mais simples de operar seu food truck, do pedido ao caixa.
        </Text>
      </View>

      {modo === 'biometria' ? (
        <View style={styles.form}>
          <View style={styles.bio}>
            <Text style={styles.titulo}>Bem-vindo de volta</Text>
            <Text style={styles.subtitulo}>Use sua digital para entrar</Text>

            <TouchableOpacity
              style={styles.botaoDigital}
              onPress={entrarComDigital}
              disabled={carregando}
              accessibilityLabel="Entrar com impressão digital"
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="finger-print" size={48} color="#fff" />
              )}
            </TouchableOpacity>
            <Text style={styles.bioTexto}>Toque para entrar com a digital</Text>

            {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

            <TouchableOpacity
              onPress={() => {
                setErro('');
                setModo('senha');
              }}
            >
              <Text style={styles.link}>Usar usuário e senha</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : modo === 'senha' ? (
      <View style={styles.form}>
        <Text style={styles.titulo}>Bem-vindo de volta</Text>
        <Text style={styles.subtitulo}>Entre com sua conta para continuar</Text>

        <Text style={styles.label}>Usuário</Text>
        <View style={styles.campo}>
          <Feather name="mail" size={16} color="#94A3B8" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu usuário"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.linha}>
          <Text style={styles.label}>Senha</Text>
        </View>

        <View style={styles.campo}>
          <Feather name="lock" size={16} color="#94A3B8" />
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Sua senha"
            secureTextEntry={!verSenha}
            autoCapitalize="none"
            onSubmitEditing={entrar}
          />
          <TouchableOpacity onPress={() => setVerSenha(!verSenha)}>
            <Feather name={verSenha ? 'eye-off' : 'eye'} size={17} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

        <TouchableOpacity style={styles.botao} onPress={entrar} disabled={carregando}>
          <Text style={styles.botaoTexto}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
          {!carregando && <Feather name="arrow-right" size={16} color="#fff" />}
        </TouchableOpacity>
      </View>
      ) : null}
    </ScrollView>
  );
}
