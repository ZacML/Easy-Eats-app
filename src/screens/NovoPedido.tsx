import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Categoria = 'Todos' | 'Lanches' | 'Bebidas' | 'Insumos';

type Produto = {
  id: string;
  nome: string;
  preco: number;
  categoria: Exclude<Categoria, 'Todos'>;
  descricao: string;
};

const CATEGORIAS: Categoria[] = ['Todos', 'Lanches', 'Bebidas', 'Insumos'];
const MESAS = Array.from({ length: 12 }, (_, i) => `Mesa ${i + 1}`);

const PRODUTOS: Produto[] = [
  { id: '1', nome: 'X-Burger', preco: 18.9, categoria: 'Lanches', descricao: 'Pão, carne 180g, queijo e salada.' },
  { id: '2', nome: 'X-Bacon', preco: 22.9, categoria: 'Lanches', descricao: 'Pão, carne 180g, queijo e bacon.' },
  { id: '3', nome: 'Refrigerante Lata', preco: 6, categoria: 'Bebidas', descricao: 'Lata 350ml.' },
  { id: '4', nome: 'Suco Natural', preco: 8.5, categoria: 'Bebidas', descricao: 'Copo 400ml, sabores variados.' },
  { id: '5', nome: 'Pão de Hambúrguer', preco: 0.9, categoria: 'Insumos', descricao: 'Pão brioche, unidade.' },
  { id: '6', nome: 'Carne de Hambúrguer 180g', preco: 6.5, categoria: 'Insumos', descricao: 'Blend bovino congelado, 180g.' },
  { id: '7', nome: 'Queijo Cheddar Fatia', preco: 0.8, categoria: 'Insumos', descricao: 'Fatia de cheddar, unidade.' },
];

const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function NovoPedido() {
  const [mesa, setMesa] = useState<string | null>(null);
  const [cliente, setCliente] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Todos');
  const [mesaAberta, setMesaAberta] = useState(false);
  const [carrinho, setCarrinho] = useState<Record<string, number>>({});

  const produtos = useMemo(
    () => PRODUTOS.filter((p) => categoria === 'Todos' || p.categoria === categoria),
    [categoria],
  );

  const itens = Object.values(carrinho).reduce((a, q) => a + q, 0);
  const total = PRODUTOS.reduce((a, p) => a + p.preco * (carrinho[p.id] ?? 0), 0);

  const alterar = (id: string, delta: number) =>
    setCarrinho((c) => {
      const qtd = Math.max(0, (c[id] ?? 0) + delta);
      const { [id]: _, ...resto } = c;
      return qtd ? { ...resto, [id]: qtd } : resto;
    });

  const finalizar = () => {
    if (!mesa && !cliente.trim()) {
      Alert.alert('Atenção', 'Selecione a mesa ou informe o nome do cliente.');
      return;
    }
    Alert.alert('Pedido criado', `${mesa ?? cliente.trim()} — ${itens} item(ns), ${moeda(total)}`);
    setCarrinho({});
    setMesa(null);
    setCliente('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.iconBtn}><Text style={styles.iconTxt}>☰</Text></View>
        <View style={styles.headerRight}>
          <View style={styles.iconBtn}><Text style={styles.iconTxt}>☾</Text></View>
          <View style={styles.iconBtn}>
            <Text style={styles.iconTxt}>🔔</Text>
            <View style={styles.badge}><Text style={styles.badgeTxt}>2</Text></View>
          </View>
          <View style={[styles.iconBtn, styles.avatar]}><Text style={styles.avatarTxt}>A</Text></View>
          <View style={styles.iconBtn}><Text style={styles.iconTxt}>⎋</Text></View>
        </View>
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Novo Pedido</Text>
            <Text style={styles.subtitle}>Monte o pedido do cliente selecionando os produtos abaixo</Text>

            <Pressable style={styles.input} onPress={() => setMesaAberta(true)}>
              <Text style={[styles.inputTxt, !mesa && styles.placeholder]}>{mesa ?? 'Selecione a mesa...'}</Text>
              <Text style={styles.placeholder}>▾</Text>
            </Pressable>

            <TextInput
              style={[styles.input, styles.inputTxt]}
              placeholder="Ou nome do cliente (balcão/retirada)"
              placeholderTextColor="#9ca3af"
              value={cliente}
              onChangeText={setCliente}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {CATEGORIAS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategoria(c)}
                  style={[styles.chip, categoria === c && styles.chipAtivo]}
                >
                  <Text style={[styles.chipTxt, categoria === c && styles.chipTxtAtivo]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => {
          const qtd = carrinho[item.id] ?? 0;
          return (
            <Pressable style={[styles.card, qtd > 0 && styles.cardAtivo]} onPress={() => alterar(item.id, 1)}>
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}><Text style={styles.cardIconTxt}>🧺</Text></View>
                <Text style={styles.cardNome}>{item.nome}</Text>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.preco}>{moeda(item.preco)}</Text>
                {qtd > 0 ? (
                  <View style={styles.stepper}>
                    <Pressable hitSlop={8} onPress={() => alterar(item.id, -1)}>
                      <Text style={styles.stepTxt}>−</Text>
                    </Pressable>
                    <Text style={styles.qtd}>{qtd}</Text>
                    <Pressable hitSlop={8} onPress={() => alterar(item.id, 1)}>
                      <Text style={styles.stepTxt}>+</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.info} hitSlop={8} onPress={() => Alert.alert(item.nome, item.descricao)}>
                    <Text style={styles.infoTxt}>i</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum produto nesta categoria.</Text>}
      />

      {itens > 0 && (
        <Pressable style={styles.footer} onPress={finalizar}>
          <Text style={styles.footerTxt}>{itens} item(ns) · {moeda(total)}</Text>
          <Text style={styles.footerAcao}>Finalizar pedido</Text>
        </Pressable>
      )}

      <Modal transparent animationType="fade" visible={mesaAberta} onRequestClose={() => setMesaAberta(false)}>
        <Pressable style={styles.overlay} onPress={() => setMesaAberta(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitulo}>Selecione a mesa</Text>
            <ScrollView>
              {MESAS.map((m) => (
                <Pressable
                  key={m}
                  style={styles.sheetItem}
                  onPress={() => {
                    setMesa(m);
                    setMesaAberta(false);
                  }}
                >
                  <Text style={[styles.sheetTxt, m === mesa && styles.sheetTxtAtivo]}>{m}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const LARANJA = '#ea580c';
const BORDA = '#e5e7eb';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDA,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDA,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { fontSize: 16, color: '#374151' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatar: { backgroundColor: '#ffedd5', borderColor: '#fed7aa' },
  avatarTxt: { color: LARANJA, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 120 },
  title: { fontSize: 30, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 6, marginBottom: 20 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: BORDA,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputTxt: { fontSize: 15, color: '#111827' },
  placeholder: { color: '#6b7280' },
  chips: { marginBottom: 16, marginTop: 4 },
  chip: {
    paddingHorizontal: 18,
    height: 38,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDA,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  chipAtivo: { backgroundColor: LARANJA, borderColor: LARANJA },
  chipTxt: { fontSize: 14, fontWeight: '600', color: '#374151' },
  chipTxtAtivo: { color: '#fff' },
  row: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDA,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  cardAtivo: { borderColor: LARANJA },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff1e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconTxt: { fontSize: 16 },
  cardNome: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  preco: { color: LARANJA, fontWeight: '800', fontSize: 14 },
  info: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTxt: { fontStyle: 'italic', color: '#374151', fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepTxt: { fontSize: 20, fontWeight: '700', color: LARANJA, paddingHorizontal: 4 },
  qtd: { fontWeight: '700', color: '#111827', minWidth: 14, textAlign: 'center' },
  vazio: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: LARANJA,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTxt: { color: '#fff', fontWeight: '600' },
  footerAcao: { color: '#fff', fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#fff', borderRadius: 14, padding: 16, maxHeight: '70%' },
  sheetTitulo: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sheetItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sheetTxt: { fontSize: 16, color: '#111827' },
  sheetTxtAtivo: { color: LARANJA, fontWeight: '700' },
});
