import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { login as loginApi } from '../../services/api';
import { styles, LARANJA } from './styles';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }

    try {
      setErro('');
      setCarregando(true);
      await loginApi(email.trim(), senha);
      navigation.replace('Pedidos');
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
    </ScrollView>
  );
}
