import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';

type Props = { onLogin: (email: string) => void };

const LARANJA = '#EA580C';
const TOPO = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 50;

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');

  function entrar() {
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    // TODO: chame a sua API de login aqui
    onLogin(email.trim());
  }

  return (
    <ScrollView contentContainerStyle={s.tela} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" />

      <View style={s.topo}>
        <View style={s.logo}>
          <Feather name="truck" size={30} color={LARANJA} />
        </View>
        <Text style={s.marca}>EasyEats</Text>
        <Text style={s.slogan}>
          O jeito mais simples de operar seu food truck, do pedido ao caixa.
        </Text>
      </View>

      <View style={s.form}>
        <Text style={s.titulo}>Bem-vindo de volta</Text>
        <Text style={s.subtitulo}>Entre com sua conta para continuar</Text>

        <Text style={s.label}>Email</Text>
        <View style={s.campo}>
          <Feather name="mail" size={16} color="#94A3B8" />
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="voce@seunegocio.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={s.linha}>
          <Text style={s.label}>Senha</Text>
          <Text style={s.esqueceu}>Esqueceu a senha?</Text>
        </View>
        <View style={s.campo}>
          <Feather name="lock" size={16} color="#94A3B8" />
          <TextInput
            style={s.input}
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

        {erro !== '' && <Text style={s.erro}>{erro}</Text>}

        <TouchableOpacity style={s.botao} onPress={entrar}>
          <Text style={s.botaoTexto}>Entrar</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>

        <Text style={s.rodape}>EasyEats POS © {new Date().getFullYear()}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flexGrow: 1, backgroundColor: '#fff' },
  topo: { backgroundColor: '#1E232B', padding: 28, paddingTop: TOPO + 40, paddingBottom: 44 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  marca: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  slogan: { fontSize: 15, lineHeight: 22, color: '#E2E8F0', marginTop: 8 },
  form: { flex: 1, padding: 28, paddingTop: 32 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  esqueceu: { fontSize: 14, color: LARANJA, fontWeight: '500' },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#E8EEFC',
  },
  input: { flex: 1, fontSize: 15, color: '#0F172A' },
  erro: {
    marginTop: 16,
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    color: '#B91C1C',
    backgroundColor: '#FEF2F2',
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 10,
    backgroundColor: LARANJA,
    marginTop: 24,
  },
  botaoTexto: { fontSize: 15, fontWeight: '600', color: '#fff' },
  rodape: { textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 'auto', paddingTop: 40 },
});