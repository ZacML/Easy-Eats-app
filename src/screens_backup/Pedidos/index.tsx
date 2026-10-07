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
import { Feather } from '@expo/vector-icons';

type Categoria = 'Lanches' | 'Bebidas' | 'Insumos';
type Produto = { id: number; nome: string; preco: number; categoria: Categoria; info: string };
type Props = { usuario: string; onSair: () => void };

const PRODUTOS: Produto[] = [
  { id: 1, nome: 'Hambúrguer Clássico', preco: 22, categoria: 'Lanches', info: 'Pão, carne 180g, queijo, alface e tomate.' },
  { id: 2, nome: 'X-Bacon', preco: 28, categoria: 'Lanches', info: 'Pão, carne 180g, cheddar e bacon.' },
  { id: 3, nome: 'Hot Dog', preco: 15, categoria: 'Lanches', info: 'Pão, salsicha, purê e batata palha.' },
  { id: 4, nome: 'Batata Frita', preco: 14, categoria: 'Lanches', info: 'Porção individual.' },
  { id: 5, nome: 'Coca-Cola', preco: 7, categoria: 'Bebidas', info: 'Lata 350 ml.' },
  { id: 6, nome: 'Água Mineral', preco: 4, categoria: 'Bebidas', info: 'Garrafa 500 ml, sem gás.' },
  { id: 7, nome: 'Suco de Laranja', preco: 9, categoria: 'Bebidas', info: 'Suco natural de 400 ml.' },
  { id: 8, nome: 'Pão de Hambúrguer', preco: 0.9, categoria: 'Insumos', info: 'Unidade.' },
  { id: 9, nome: 'Carne de Hambúrguer 180g', preco: 6.5, categoria: 'Insumos', info: 'Unidade congelada.' },
  { id: 10, nome: 'Queijo Cheddar Fatia', preco: 0.8, categoria: 'Insumos', info: 'Fatia individual.' },
];

const FILTROS = ['Todos', 'Lanches', 'Bebidas', 'Insumos'];
const MESAS = ['Balcão / Retirada', ...Array.from({ length: 8 }, (_, i) => `Mesa ${i + 1}`)];
const ICONE = { Lanches: 'disc', Bebidas: 'coffee', Insumos: 'shopping-bag' } as const;

const LARANJA = '#EA580C';
const TOPO = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 50;
const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function Pedidos({ usuario, onSair }: Props) {
  const [filtro, setFiltro] = useState('Todos');
  const [mesa, setMesa] = useState('');
  const [mesasAbertas, setMesasAbertas] = useState(false);
  const [cliente, setCliente] = useState('');
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [infoId, setInfoId] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; erro: boolean } | null>(null);

  const visiveis = PRODUTOS.filter((p) => filtro === 'Todos' || p.categoria === filtro);
  const itens = PRODUTOS.filter((p) => carrinho[p.id]);
  const qtdTotal = itens.reduce((soma, p) => soma + carrinho[p.id], 0);
  const total = itens.reduce((soma, p) => soma + carrinho[p.id] * p.preco, 0);

  function mudar(id: number, delta: number) {
    setAviso(null);
    setCarrinho((atual) => {
      const qtd = (atual[id] ?? 0) + delta;
      const novo = { ...atual };
      if (qtd > 0) novo[id] = qtd;
      else delete novo[id];
      return novo;
    });
  }

  function finalizar() {
    if (!mesa && !cliente.trim()) {
      setAviso({ texto: 'Selecione a mesa ou informe o nome do cliente.', erro: true });
      return;
    }
    // TODO: envie { mesa, cliente, itens, total } para a sua API
    setCarrinho({});
    setMesa('');
    setCliente('');
    setAviso({ texto: 'Pedido enviado para a cozinha.', erro: false });
  }

  return (
    <View style={s.tela}>
      <StatusBar barStyle="dark-content" />

      <View style={s.barra}>
        <Text style={s.marca}>EasyEats</Text>
        <View style={s.barraDireita}>
          <View style={s.avatar}>
            <Text style={s.avatarTexto}>{usuario.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={s.botaoIcone} onPress={onSair}>
            <Feather name="log-out" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={s.titulo}>Novo Pedido</Text>
        <Text style={s.subtitulo}>Monte o pedido do cliente selecionando os produtos abaixo</Text>

        <TouchableOpacity style={s.campo} onPress={() => setMesasAbertas(!mesasAbertas)}>
          <Text style={{ color: mesa ? '#0F172A' : '#64748B' }}>{mesa || 'Selecione a mesa...'}</Text>
          <Feather name={mesasAbertas ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" />
        </TouchableOpacity>

        {mesasAbertas && (
          <View style={s.lista}>
            {MESAS.map((m) => (
              <TouchableOpacity
                key={m}
                style={s.opcao}
                onPress={() => {
                  setMesa(m);
                  setMesasAbertas(false);
                  setAviso(null);
                }}
              >
                <Text style={{ color: m === mesa ? LARANJA : '#0F172A' }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TextInput
          style={[s.campo, { marginTop: 12 }]}
          value={cliente}
          onChangeText={setCliente}
          placeholder="Ou nome do cliente (balcão/retirada)"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
          {FILTROS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.chip, f === filtro && s.chipAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[s.chipTexto, f === filtro && { color: '#fff' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.grade}>
          {visiveis.map((p) => {
            const qtd = carrinho[p.id] ?? 0;
            return (
              <View key={p.id} style={[s.card, qtd > 0 && { borderColor: LARANJA }]}>
                <TouchableOpacity style={s.cardTopo} onPress={() => mudar(p.id, 1)}>
                  <View style={s.icone}>
                    <Feather name={ICONE[p.categoria]} size={18} color={LARANJA} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.nome}>{p.nome}</Text>
                    <Text style={s.preco}>{moeda(p.preco)}</Text>
                  </View>
                </TouchableOpacity>

                {infoId === p.id && <Text style={s.info}>{p.info}</Text>}

                <View style={s.cardBase}>
                  {qtd > 0 ? (
                    <View style={s.stepper}>
                      <TouchableOpacity hitSlop={8} onPress={() => mudar(p.id, -1)}>
                        <Feather name="minus" size={16} color="#0F172A" />
                      </TouchableOpacity>
                      <Text style={s.qtd}>{qtd}</Text>
                      <TouchableOpacity hitSlop={8} onPress={() => mudar(p.id, 1)}>
                        <Feather name="plus" size={16} color="#0F172A" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View />
                  )}
                  <TouchableOpacity
                    style={s.botaoInfo}
                    onPress={() => setInfoId(infoId === p.id ? null : p.id)}
                  >
                    <Feather name="info" size={14} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {(aviso || qtdTotal > 0) && (
        <View style={s.rodape}>
          {aviso && (
            <Text style={[s.aviso, aviso.erro ? s.avisoErro : s.avisoOk]}>{aviso.texto}</Text>
          )}
          {qtdTotal > 0 && (
            <View style={s.resumo}>
              <View style={{ flex: 1 }}>
                <Text style={s.resumoQtd}>
                  {qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'}
                </Text>
                <Text style={s.resumoTotal}>{moeda(total)}</Text>
              </View>
              <TouchableOpacity style={s.botaoFinalizar} onPress={finalizar}>
                <Text style={s.botaoFinalizarTexto}>Finalizar pedido</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const borda = { borderWidth: 1, borderColor: '#E2E8F0' } as const;

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F8FAFC' },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: TOPO + 8,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  marca: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  barraDireita: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontWeight: 'bold', color: LARANJA },
  botaoIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...borda,
  },
  conteudo: { padding: 16, paddingBottom: 32 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 14, lineHeight: 21, color: '#64748B', marginTop: 6, marginBottom: 18 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 14,
    ...borda,
  },
  lista: { marginTop: 4, borderRadius: 10, backgroundColor: '#fff', ...borda },
  opcao: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  chips: { marginTop: 16 },
  chip: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    marginRight: 8,
    ...borda,
  },
  chipAtivo: { backgroundColor: LARANJA, borderColor: LARANJA },
  chipTexto: { fontSize: 14, fontWeight: '600', color: '#334155' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  card: { width: '48%', padding: 12, marginBottom: 12, borderRadius: 12, backgroundColor: '#fff', ...borda },
  cardTopo: { flexDirection: 'row', gap: 8 },
  icone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  preco: { fontSize: 14, fontWeight: 'bold', color: LARANJA, marginTop: 4 },
  info: { fontSize: 12, lineHeight: 17, color: '#64748B', marginTop: 8 },
  cardBase: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtd: { fontSize: 14, fontWeight: '600', minWidth: 16, textAlign: 'center' },
  botaoInfo: {
    width: 34,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rodape: { padding: 16, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  aviso: { fontSize: 14, padding: 10, borderRadius: 10 },
  avisoErro: { color: '#B91C1C', backgroundColor: '#FEF2F2' },
  avisoOk: { color: '#047857', backgroundColor: '#ECFDF5' },
  resumo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  resumoQtd: { fontSize: 12, color: '#64748B' },
  resumoTotal: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  botaoFinalizar: { height: 48, paddingHorizontal: 22, borderRadius: 10, backgroundColor: LARANJA, justifyContent: 'center' },
  botaoFinalizarTexto: { fontSize: 15, fontWeight: '600', color: '#fff' },
});