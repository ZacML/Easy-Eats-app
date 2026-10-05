import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Pedido = { id: string; mesa: string; itens: string[] };

const aguardando: Pedido[] = [];
const emPreparo: Pedido[] = [];
const prontos: Pedido[] = [];

const RESUMO = [
  { rotulo: 'Aguardando', valor: aguardando.length, icone: '⏳', fundo: '#fef3c7', cor: '#d97706' },
  { rotulo: 'Em Preparo', valor: emPreparo.length, icone: '🍳', fundo: '#ffedd5', cor: '#ea580c' },
  { rotulo: 'Prontos', valor: prontos.length, icone: '✓', fundo: '#dcfce7', cor: '#16a34a' },
];

function ListaPedidos({ titulo, pedidos, vazio }: { titulo: string; pedidos: Pedido[]; vazio: string }) {
  return (
    <View style={styles.painel}>
      <Text style={styles.painelTitulo}>{titulo}</Text>
      {pedidos.length === 0 ? (
        <Text style={styles.vazio}>{vazio}</Text>
      ) : (
        pedidos.map((p) => (
          <View key={p.id} style={styles.pedido}>
            <Text style={styles.pedidoMesa}>{p.mesa}</Text>
            <Text style={styles.pedidoItens}>{p.itens.join(', ')}</Text>
          </View>
        ))
      )}
    </View>
  );
}

export default function FilaCozinha() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.iconBtn}><Text style={styles.iconTxt}>☾</Text></View>
        <View style={styles.iconBtn}>
          <Text style={styles.iconTxt}>🔔</Text>
          <View style={styles.badge}><Text style={styles.badgeTxt}>2</Text></View>
        </View>
        <View style={styles.usuario}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>A</Text></View>
          <View>
            <Text style={styles.usuarioNome}>Administrador</Text>
            <Text style={styles.usuarioPapel}>ADMINISTRADOR</Text>
          </View>
        </View>
        <View style={styles.iconBtn}><Text style={styles.iconTxt}>⎋</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Fila da Cozinha</Text>
        <Text style={styles.subtitle}>Acompanhe o preparo dos pedidos em andamento</Text>

        <View style={styles.resumo}>
          {RESUMO.map((r) => (
            <View key={r.rotulo} style={styles.card}>
              <View style={[styles.cardIcone, { backgroundColor: r.fundo }]}>
                <Text style={[styles.cardIconeTxt, { color: r.cor }]}>{r.icone}</Text>
              </View>
              <View>
                <Text style={styles.cardValor}>{r.valor}</Text>
                <Text style={styles.cardRotulo}>{r.rotulo}</Text>
              </View>
            </View>
          ))}
        </View>

        <ListaPedidos
          titulo="Pedidos em Andamento"
          pedidos={[...aguardando, ...emPreparo]}
          vazio="Nenhum pedido em andamento no momento."
        />
        <ListaPedidos titulo="Prontos para Entrega" pedidos={prontos} vazio="Nenhum pedido pronto no momento." />
      </ScrollView>
    </SafeAreaView>
  );
}

const BORDA = '#e5e7eb';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDA,
  },
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
  usuario: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 4 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#ea580c', fontWeight: '700' },
  usuarioNome: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  usuarioPapel: { fontSize: 10, fontWeight: '800', color: '#7c3aed' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 15, color: '#6b7280', marginTop: 6, marginBottom: 20 },
  resumo: { gap: 12, marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDA,
    padding: 16,
  },
  cardIcone: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardIconeTxt: { fontSize: 16, fontWeight: '700' },
  cardValor: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  cardRotulo: { fontSize: 14, color: '#6b7280' },
  painel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDA,
    padding: 18,
    marginBottom: 16,
  },
  painelTitulo: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 14 },
  vazio: { textAlign: 'center', color: '#9ca3af', fontSize: 14, paddingVertical: 8 },
  pedido: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  pedidoMesa: { fontWeight: '700', color: '#111827' },
  pedidoItens: { color: '#6b7280', marginTop: 2 },
});
