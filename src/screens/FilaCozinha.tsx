import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { listarPedidos, listarProdutos, logout, atualizarStatusPedido } from '../services/api';
import { styles } from './styles';
import type { Pedido, StatusPedido } from '../types/pedido';
import type { Produto } from '../types/produto';
import FiltroChips from '../components/FiltroChips';


type Props = {
  onVoltar?: () => void;
};

type Coluna = 'ABERTO' | 'EM_PREPARO' | 'FINALIZADO';

const TITULOS: Record<Coluna, string> = {
  ABERTO: 'Aguardando',
  EM_PREPARO: 'Em preparo',
  FINALIZADO: 'Prontos',
};

const COLUNAS: Coluna[] = ['ABERTO', 'EM_PREPARO', 'FINALIZADO'];

const OPCOES_STATUS = COLUNAS.map((c) => ({ id: c, nome: TITULOS[c] }));

const PROXIMO: Partial<Record<StatusPedido, Coluna>> = {
  ABERTO: 'EM_PREPARO',
  EM_PREPARO: 'FINALIZADO',
};

export default function FilaCozinha({ onVoltar }: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<Coluna | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  async function avancar(pedido: Pedido) {
    const proximo = PROXIMO[pedido.status];
    if (!proximo) return;

    try {
      setErro('');
      setAtualizandoId(pedido.id);
      await atualizarStatusPedido(pedido.id, proximo);
      setPedidos((atual) =>
        atual.map((p) => (p.id === pedido.id ? { ...p, status: proximo } : p)),
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível atualizar o status.');
    } finally {
      setAtualizandoId(null);
    }
  }

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.botao}
          onPress={onVoltar}
          accessibilityLabel="Voltar para pedidos"
        >
          <Feather name="arrow-left" size={20} color="#EA580C" />
        </TouchableOpacity>

        <Text style={styles.tituloHeader}>Fila da Cozinha</Text>
        <TouchableOpacity style={styles.botao} onPress={carregar}>
          <Feather name="refresh-cw" size={17} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao} onPress={logout}>
          <Feather name="log-out" size={17} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Pedidos</Text>
        <Text style={styles.subtitle}>Dados atualizados diretamente pela API.</Text>

        {erro !== '' && (
          <View style={styles.erroBox}>
            <Text style={styles.erro}>{erro}</Text>
            <TouchableOpacity onPress={carregar}>
              <Text style={styles.tentar}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!carregando && (
          <View style={styles.filtro}>
            <FiltroChips
              opcoes={OPCOES_STATUS}
              selecionado={filtroStatus}
              onSelecionar={setFiltroStatus}
            />
          </View>
        )}

        {carregando ? (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        ) : (
          (filtroStatus ? [filtroStatus] : COLUNAS).map((status) => {
            const lista = pedidosDaColuna(status);

            return (
              <View key={status} style={styles.painel}>
                <View style={styles.painelTituloLinha}>
                  <Text style={styles.painelTitulo}>{TITULOS[status]}</Text>
                  <Text style={styles.contador}>{lista.length}</Text>
                </View>

                {lista.length === 0 ? (
                  <Text style={styles.vazio}>Nenhum pedido.</Text>
                ) : (
                  lista.map((pedido) => {
                    const proximo = PROXIMO[pedido.status];
                    const atualizando = atualizandoId === pedido.id;

                    return (
                      <View key={pedido.id} style={styles.pedido}>
                        <View style={styles.pedidoInfo}>
                          <Text style={styles.pedidoTitulo}>Pedido #{pedido.id}</Text>
                          <Text style={styles.pedidoDestino}>
                            {pedido.mesa || pedido.cliente || 'Sem identificação'}
                          </Text>
                          <Text style={styles.pedidoItens}>{descricaoItens(pedido)}</Text>
                        </View>

                        {proximo && (
                          <TouchableOpacity
                            style={[styles.botaoAvancar, atualizando && styles.botaoAvancarDesabilitado]}
                            onPress={() => avancar(pedido)}
                            disabled={atualizando}
                            accessibilityLabel={`Avançar pedido ${pedido.id} para ${TITULOS[proximo]}`}
                          >
                            {atualizando ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Feather name="arrow-right" size={18} color="#fff" />
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            );
          })
        )}

        {filtroStatus == null && (
          <View style={styles.painel}>
            <Text style={styles.painelTitulo}>Cancelados</Text>
            <Text style={styles.vazio}>
              {pedidos.filter((p) => p.status === 'CANCELADO').length} pedido(s)
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
