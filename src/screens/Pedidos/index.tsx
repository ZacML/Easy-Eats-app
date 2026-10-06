import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { criarPedido, listarProdutos, logout, Produto } from '../../services/api';

type Props = { usuario?: string; onSair?: () => void };

const LARANJA = '#EA580C';
const TOPO = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 50;
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
    <View style={s.tela}>
      <StatusBar barStyle="dark-content" />

      <View style={s.barra}>
        <Text style={s.marca}>EasyEats</Text>
        <View style={s.barraDireita}>
          <View style={s.avatar}>
            <Text style={s.avatarTexto}>{usuario ? usuario.charAt(0).toUpperCase() : '?'}</Text>
          </View>
          <TouchableOpacity
            style={s.botaoIcone}
            onPress={() => {
              logout();
              onSair?.();
            }}
          >
            <Feather name="log-out" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={s.titulo}>Novo Pedido</Text>
        <Text style={s.subtitulo}>Produtos carregados diretamente da API.</Text>

        <TextInput
          style={s.campo}
          value={mesa}
          onChangeText={setMesa}
          placeholder="Mesa ou identificação"
        />

        <TextInput
          style={[s.campo, { marginTop: 12 }]}
          value={cliente}
          onChangeText={setCliente}
          placeholder="Nome do cliente (opcional)"
        />

        {erro !== '' && (
          <View style={s.erroBox}>
            <Text style={s.erro}>{erro}</Text>
            <TouchableOpacity onPress={carregarProdutos}>
              <Text style={s.tentar}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {carregando ? (
          <ActivityIndicator size="large" color={LARANJA} style={{ marginTop: 32 }} />
        ) : produtos.length === 0 ? (
          <Text style={s.vazio}>Nenhum produto ativo encontrado.</Text>
        ) : (
          <View style={s.grade}>
            {produtos.map((p) => {
              const qtd = carrinho[p.id] ?? 0;

              return (
                <View key={p.id} style={[s.card, qtd > 0 && { borderColor: LARANJA }]}>
                  <TouchableOpacity onPress={() => mudar(p.id, 1)}>
                    <Text style={s.nome}>{p.nome}</Text>
                    <Text style={s.descricao}>{p.descricao}</Text>
                    <Text style={s.preco}>{moeda(p.preco)}</Text>
                  </TouchableOpacity>

                  <View style={s.cardBase}>
                    {qtd > 0 ? (
                      <View style={s.stepper}>
                        <TouchableOpacity onPress={() => mudar(p.id, -1)}>
                          <Feather name="minus" size={18} color={LARANJA} />
                        </TouchableOpacity>
                        <Text style={s.qtd}>{qtd}</Text>
                        <TouchableOpacity onPress={() => mudar(p.id, 1)}>
                          <Feather name="plus" size={18} color={LARANJA} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={s.adicionar}>Adicionar</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {qtdTotal > 0 && (
        <View style={s.rodape}>
          <View>
            <Text style={s.resumoQtd}>{qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'}</Text>
            <Text style={s.resumoTotal}>{moeda(total)}</Text>
          </View>
          <TouchableOpacity style={s.botaoFinalizar} onPress={finalizar} disabled={enviando}>
            <Text style={s.botaoFinalizarTexto}>{enviando ? 'Enviando...' : 'Finalizar pedido'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F8FAFC' },
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: TOPO + 8, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  marca: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  barraDireita: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontWeight: 'bold', color: LARANJA },
  botaoIcone: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  conteudo: { padding: 16, paddingBottom: 110 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 14, color: '#64748B', marginTop: 6, marginBottom: 18 },
  campo: { height: 48, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', color: '#0F172A' },
  erroBox: { marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: '#FEF2F2' },
  erro: { color: '#B91C1C' },
  tentar: { marginTop: 8, color: LARANJA, fontWeight: '700' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  card: { width: '48%', padding: 12, marginBottom: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  nome: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  descricao: { fontSize: 12, lineHeight: 17, color: '#64748B', marginTop: 6, minHeight: 34 },
  preco: { fontSize: 14, fontWeight: 'bold', color: LARANJA, marginTop: 8 },
  cardBase: { marginTop: 10, minHeight: 28, justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtd: { fontWeight: '700', color: '#0F172A' },
  adicionar: { color: '#64748B', fontSize: 12 },
  vazio: { textAlign: 'center', color: '#64748B', marginTop: 32 },
  rodape: { padding: 16, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resumoQtd: { fontSize: 12, color: '#64748B' },
  resumoTotal: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  botaoFinalizar: { height: 48, paddingHorizontal: 20, borderRadius: 10, backgroundColor: LARANJA, justifyContent: 'center' },
  botaoFinalizarTexto: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
