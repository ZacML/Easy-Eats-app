import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { criarPedido, listarProdutos, logout } from '../../services/api';
import { styles, LARANJA } from './styles';
import { Produto } from '../../types/produto';

type Props = { usuario?: string; onSair?: () => void };

const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function Pedidos({ usuario = '', onSair }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mesa, setMesa] = useState('');
  const [cliente, setCliente] = useState('');
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setErro('');
      setCarregando(true);
      setProdutos(await listarProdutos());
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  }

  function mudar(id: number, delta: number) {
    setCarrinho((atual) => {
      const qtd = Math.max(0, (atual[id] ?? 0) + delta);
      const novo = { ...atual };
      if (qtd === 0) delete novo[id];
      else novo[id] = qtd;
      return novo;
    });
  }

  const itens = useMemo(
    () => produtos.filter((p) => (carrinho[p.id] ?? 0) > 0),
    [produtos, carrinho],
  );

  const qtdTotal = itens.reduce((total, p) => total + carrinho[p.id], 0);
  const total = itens.reduce((sum, p) => sum + carrinho[p.id] * p.preco, 0);

  async function finalizar() {
    if (!mesa.trim() && !cliente.trim()) {
      Alert.alert('Atenção', 'Informe a mesa ou o nome do cliente.');
      return;
    }

    if (!itens.length) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto.');
      return;
    }

    try {
      setEnviando(true);

      await criarPedido(
        mesa.trim(),
        cliente.trim(),
        itens.map((p) => ({
          produtoId: p.id,
          quantidade: carrinho[p.id],
        })),
      );

      setCarrinho({});
      setMesa('');
      setCliente('');
      Alert.alert('Sucesso', 'Pedido enviado para a cozinha.');
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível criar o pedido.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.tela}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.barra}>
        <Text style={styles.marca}>EasyEats</Text>
        <View style={styles.barraDireita}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{usuario ? usuario.charAt(0).toUpperCase() : '?'}</Text>
          </View>
          <TouchableOpacity
            style={styles.botaoIcone}
            onPress={() => {
              logout();
              onSair?.();
            }}
          >
            <Feather name="log-out" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Novo Pedido</Text>
        <Text style={styles.subtitulo}>Produtos carregados diretamente da API.</Text>

        <TextInput
          style={styles.campo}
          value={mesa}
          onChangeText={setMesa}
          placeholder="Mesa ou identificação"
        />

        <TextInput
          style={[styles.campo, { marginTop: 12 }]}
          value={cliente}
          onChangeText={setCliente}
          placeholder="Nome do cliente (opcional)"
        />

        {erro !== '' && (
          <View style={styles.erroBox}>
            <Text style={styles.erro}>{erro}</Text>
            <TouchableOpacity onPress={carregarProdutos}>
              <Text style={styles.tentar}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {carregando ? (
          <ActivityIndicator size="large" color={LARANJA} style={{ marginTop: 32 }} />
        ) : produtos.length === 0 ? (
          <Text style={styles.vazio}>Nenhum produto ativo encontrado.</Text>
        ) : (
          <View style={styles.grade}>
            {produtos.map((p) => {
              const qtd = carrinho[p.id] ?? 0;

              return (
                <View key={p.id} style={[styles.card, qtd > 0 && { borderColor: LARANJA }]}>
                  <TouchableOpacity onPress={() => mudar(p.id, 1)}>
                    <Text style={styles.nome}>{p.nome}</Text>
                    <Text style={styles.descricao}>{p.descricao}</Text>
                    <Text style={styles.preco}>{moeda(p.preco)}</Text>
                  </TouchableOpacity>

                  <View style={styles.cardBase}>
                    {qtd > 0 ? (
                      <View style={styles.stepper}>
                        <TouchableOpacity onPress={() => mudar(p.id, -1)}>
                          <Feather name="minus" size={18} color={LARANJA} />
                        </TouchableOpacity>
                        <Text style={styles.qtd}>{qtd}</Text>
                        <TouchableOpacity onPress={() => mudar(p.id, 1)}>
                          <Feather name="plus" size={18} color={LARANJA} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.adicionar}>Adicionar</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {qtdTotal > 0 && (
        <View style={styles.rodape}>
          <View>
            <Text style={styles.resumoQtd}>{qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'}</Text>
            <Text style={styles.resumoTotal}>{moeda(total)}</Text>
          </View>
          <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizar} disabled={enviando}>
            <Text style={styles.botaoFinalizarTexto}>{enviando ? 'Enviando...' : 'Finalizar pedido'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
