import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { listarPedidos, listarProdutos, logout, Pedido, Produto } from '../services/api';

type Coluna = 'ABERTO' | 'EM_PREPARO' | 'FINALIZADO';

const TITULOS: Record<Coluna, string> = {
  ABERTO: 'Aguardando',
  EM_PREPARO: 'Em preparo',
  FINALIZADO: 'Prontos',
};

export default function FilaCozinha() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      setErro('');
      setCarregando(true);
      const [pedidosApi, produtosApi] = await Promise.all([
        listarPedidos(),
        listarProdutos(),
      ]);
      setPedidos(pedidosApi);
      setProdutos(produtosApi);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar a fila.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const nomes = useMemo(
    () => new Map(produtos.map((p) => [p.id, p.nome])),
    [produtos],
  );

  function descricaoItens(pedido: Pedido) {
    return pedido.itens
      .map((item) => `${item.quantidade}x ${nomes.get(item.produtoId) ?? `Produto #${item.produtoId}`}`)
      .join(', ');
  }

  function pedidosDaColuna(status: Coluna) {
    return pedidos.filter((p) => p.status === status);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.tituloHeader}>Fila da Cozinha</Text>
        <TouchableOpacity style={s.botao} onPress={carregar}>
          <Feather name="refresh-cw" size={17} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity style={s.botao} onPress={logout}>
          <Feather name="log-out" size={17} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Pedidos</Text>
        <Text style={s.subtitle}>Dados atualizados diretamente pela API.</Text>

        {erro !== '' && (
          <View style={s.erroBox}>
            <Text style={s.erro}>{erro}</Text>
            <TouchableOpacity onPress={carregar}>
              <Text style={s.tentar}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {carregando ? (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        ) : (
          (['ABERTO', 'EM_PREPARO', 'FINALIZADO'] as Coluna[]).map((status) => {
            const lista = pedidosDaColuna(status);

            return (
              <View key={status} style={s.painel}>
                <View style={s.painelTituloLinha}>
                  <Text style={s.painelTitulo}>{TITULOS[status]}</Text>
                  <Text style={s.contador}>{lista.length}</Text>
                </View>

                {lista.length === 0 ? (
                  <Text style={s.vazio}>Nenhum pedido.</Text>
                ) : (
                  lista.map((pedido) => (
                    <View key={pedido.id} style={s.pedido}>
                      <Text style={s.pedidoTitulo}>Pedido #{pedido.id}</Text>
                      <Text style={s.pedidoDestino}>
                        {pedido.mesa || pedido.cliente || 'Sem identificação'}
                      </Text>
                      <Text style={s.pedidoItens}>{descricaoItens(pedido)}</Text>
                    </View>
                  ))
                )}
              </View>
            );
          })
        )}

        <View style={s.painel}>
          <Text style={s.painelTitulo}>Cancelados</Text>
          <Text style={s.vazio}>
            {pedidos.filter((p) => p.status === 'CANCELADO').length} pedido(s)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tituloHeader: { flex: 1, fontSize: 17, fontWeight: '800', color: '#0F172A' },
  botao: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 6, marginBottom: 20 },
  erroBox: { padding: 12, borderRadius: 10, backgroundColor: '#FEF2F2', marginBottom: 16 },
  erro: { color: '#B91C1C' },
  tentar: { marginTop: 8, color: '#EA580C', fontWeight: '700' },
  painel: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 16 },
  painelTituloLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  painelTitulo: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0F172A' },
  contador: { minWidth: 28, textAlign: 'center', paddingVertical: 4, borderRadius: 12, backgroundColor: '#F1F5F9', color: '#334155', fontWeight: '700' },
  vazio: { textAlign: 'center', color: '#9CA3AF', paddingVertical: 8 },
  pedido: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  pedidoTitulo: { fontWeight: '800', color: '#111827' },
  pedidoDestino: { marginTop: 3, fontWeight: '600', color: '#EA580C' },
  pedidoItens: { marginTop: 4, color: '#6B7280', lineHeight: 19 },
});
