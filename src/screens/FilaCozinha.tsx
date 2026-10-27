import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { listarPedidos, listarProdutos, logout, atualizarStatusPedido } from '../services/api';
import { styles } from './styles';
import type { Pedido, StatusPedido } from '../types/pedido';
import type { Produto } from '../types/produto';
import FiltroChips from '../components/FiltroChips';


type Props = {
  onVoltar?: () => void;
  onSair?: () => void;
};

type Coluna = 'ABERTO' | 'EM_PREPARO' | 'FINALIZADO' | 'CANCELADO';

const TITULOS: Record<Coluna, string> = {
  ABERTO: 'Aguardando',
  EM_PREPARO: 'Em preparo',
  FINALIZADO: 'Prontos',
  CANCELADO: 'Cancelados',
};

const COLUNAS: Coluna[] = ['ABERTO', 'EM_PREPARO', 'FINALIZADO', 'CANCELADO'];

const OPCOES_STATUS = COLUNAS.map((c) => ({ id: c, nome: TITULOS[c] }));

const PROXIMO: Partial<Record<StatusPedido, Coluna>> = {
  ABERTO: 'EM_PREPARO',
  EM_PREPARO: 'FINALIZADO',
};

const ANTERIOR: Partial<Record<StatusPedido, Coluna>> = {
  EM_PREPARO: 'ABERTO',
  FINALIZADO: 'EM_PREPARO',
};

const HIT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 };

const LIMITE_HISTORICO = 10;
const ehHistorico = (status: Coluna) => status === 'FINALIZADO' || status === 'CANCELADO';

export default function FilaCozinha({ onVoltar, onSair }: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<Coluna | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);
  const emAndamento = useRef(false);
  const [temMais, setTemMais] = useState<Partial<Record<Coluna, boolean>>>({});
  const [carregandoMais, setCarregandoMais] = useState<Coluna | null>(null);

  async function alterarStatus(pedido: Pedido, novoStatus: StatusPedido) {
    if (emAndamento.current) return;

    try {
      emAndamento.current = true;
      setAtualizandoId(pedido.id);
      await atualizarStatusPedido(pedido.id, novoStatus);
      setPedidos((atual) => {
        const movido = { ...pedido, status: novoStatus };
        return ehHistorico(novoStatus)
          ? [movido, ...atual.filter((p) => p.id !== pedido.id)] // mais recente no topo
          : atual.map((p) => (p.id === pedido.id ? movido : p));
      });
    } catch (e) {
      Alert.alert(
        'Erro',
        e instanceof Error ? e.message : 'Não foi possível atualizar o status do pedido.',
      );
    } finally {
      emAndamento.current = false;
      setAtualizandoId(null);
    }
  }

  async function carregarMais(status: Coluna) {
    if (emAndamento.current) return;

    const lista = pedidosDaColuna(status);

    try {
      emAndamento.current = true;
      setCarregandoMais(status);

      const novos = await listarPedidos(status, lista[lista.length - 1]?.dataAlteracao);
      const ids = new Set(pedidos.map((p) => p.id));
      const inéditos = novos.filter((p) => !ids.has(p.id));

      setPedidos((atual) => [...atual, ...inéditos]);
      setTemMais((atual) => ({
        ...atual,
        [status]: novos.length === LIMITE_HISTORICO && inéditos.length > 0,
      }));
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível carregar mais pedidos.');
    } finally {
      emAndamento.current = false;
      setCarregandoMais(null);
    }
  }

  function confirmarCancelamento(pedido: Pedido) {
    if (emAndamento.current) return;

    Alert.alert('Cancelar pedido', 'Deseja realmente cancelar este pedido?', [
      { text: 'Cancelar ação', style: 'cancel' },
      {
        text: 'Confirmar cancelamento',
        style: 'destructive',
        onPress: () => alterarStatus(pedido, 'CANCELADO'),
      },
    ]);
  }

  const carregar = useCallback(async () => {
    try {
      setErro('');
      const [abertos, emPreparo, prontos, cancelados, produtosApi] = await Promise.all([
        listarPedidos('ABERTO'),
        listarPedidos('EM_PREPARO'),
        listarPedidos('FINALIZADO'),
        listarPedidos('CANCELADO'),
        listarProdutos(),
      ]);
      setPedidos([...abertos, ...emPreparo, ...prontos, ...cancelados]);
      setTemMais({
        FINALIZADO: prontos.length === LIMITE_HISTORICO,
        CANCELADO: cancelados.length === LIMITE_HISTORICO,
      });
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
        <TouchableOpacity style={styles.botao}
          onPress={() => {
            logout();
            onSair?.();
          }}
          accessibilityLabel="Sair da conta"
        >
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
                  <Text style={styles.contador}>{`${lista.length}${temMais[status] ? '+' : ''}`}</Text>
                </View>

                {lista.length === 0 ? (
                  <Text style={styles.vazio}>Nenhum pedido.</Text>
                ) : (
                  lista.map((pedido) => {
                    const proximo = PROXIMO[pedido.status];
                    const anterior = ANTERIOR[pedido.status];
                    const atualizando = atualizandoId === pedido.id;
                    const ocupado = atualizandoId !== null;

                    return (
                      <View key={pedido.id} style={styles.pedido}>
                        <View style={styles.pedidoInfo}>
                          <Text style={styles.pedidoTitulo}>Pedido #{pedido.id}</Text>
                          <Text style={styles.pedidoDestino}>
                            {pedido.mesa || pedido.cliente || 'Sem identificação'}
                          </Text>
                          <Text style={styles.pedidoItens}>{descricaoItens(pedido)}</Text>
                        </View>

                        {pedido.status !== 'CANCELADO' && (
                        <View style={styles.pedidoAcoes}>
                          <TouchableOpacity
                            style={[styles.botao, styles.botaoCancelar, ocupado && styles.botaoAvancarDesabilitado]}
                            onPress={() => confirmarCancelamento(pedido)}
                            disabled={ocupado}
                            hitSlop={HIT_SLOP}
                            accessibilityLabel={`Cancelar pedido ${pedido.id}`}
                          >
                            <Feather name="trash-2" size={17} color="#B91C1C" />
                          </TouchableOpacity>

                          {anterior && (
                            <TouchableOpacity
                              style={[styles.botaoFila, ocupado && styles.botaoAvancarDesabilitado]}
                              onPress={() => alterarStatus(pedido, anterior)}
                              disabled={ocupado}
                              hitSlop={HIT_SLOP}
                              accessibilityLabel={`Voltar pedido ${pedido.id} para ${TITULOS[anterior]}`}
                            >
                              <Feather name="arrow-left" size={18} color="#fff" />
                            </TouchableOpacity>
                          )}

                          {proximo && (
                            <TouchableOpacity
                              style={[styles.botaoFila, ocupado && styles.botaoAvancarDesabilitado]}
                              onPress={() => alterarStatus(pedido, proximo)}
                              disabled={ocupado}
                              hitSlop={HIT_SLOP}
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
                        )}
                      </View>
                    );
                  })
                )}
                {temMais[status] && (
                  <TouchableOpacity
                    style={[styles.maisLinha, carregandoMais !== null && styles.botaoAvancarDesabilitado]}
                    onPress={() => carregarMais(status)}
                    disabled={carregandoMais !== null}
                    accessibilityLabel={`Mostrar mais pedidos de ${TITULOS[status]}`}
                  >
                    <View style={styles.tracoMais}><View style={styles.tracoMaisInterno} /></View>
                    {carregandoMais === status ? (
                      <ActivityIndicator size="small" color="#EA580C" />
                    ) : (
                      <Text style={styles.maisTexto}>Mostrar mais</Text>
                    )}
                    <View style={styles.tracoMais}><View style={styles.tracoMaisInterno} /></View>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
