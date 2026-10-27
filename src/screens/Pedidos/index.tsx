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
import {
  criarPedido,
  listarCategorias,
  listarProdutos,
  listarMesas,
  logout,
} from '../../services/api';
import { styles, LARANJA } from './styles';
import type { Produto } from '../../types/produto';
import type { Categoria } from '../../types/categoria';
import type { Mesa } from '../../types/mesa';
import FiltroChips from '../../components/FiltroChips';

type Props = { usuario?: string; onSair?: () => void; onAbrirFila?: () => void };


const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function Pedidos({ usuario = '', onSair, onAbrirFila }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  const [mesaAberta, setMesaAberta] = useState(false);
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

      const [
        produtosApi,
        categoriasApi,
        mesasApi,
      ] = await Promise.all([
        listarProdutos(),
        listarCategorias(),
        listarMesas(),
      ]);

      setProdutos(produtosApi);
      setCategorias(categoriasApi);
      setMesas(mesasApi);

    } catch (e) {

      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível carregar os dados.'
      );
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

  const produtosFiltrados = useMemo(
    () => categoriaSelecionada == null
      ? produtos
      : produtos.filter((p) => p.categoriaId === categoriaSelecionada),
    [produtos, categoriaSelecionada],
  );

  const itens = useMemo(
    () => produtos.filter((p) => (carrinho[p.id] ?? 0) > 0),
    [produtos, carrinho],
  );

  const qtdTotal = itens.reduce((total, p) => total + carrinho[p.id], 0);
  const total = itens.reduce((sum, p) => sum + carrinho[p.id] * p.preco, 0);

  async function finalizar() {
    if (mesaSelecionada == null) {
      Alert.alert(
        'Atenção',
        'Selecione uma mesa.'
      );

      return;
    }

    if (!itens.length) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto.');
      return;
    }

    try {
      setEnviando(true);

      await criarPedido(
        mesaSelecionada,
        cliente.trim(),
        itens.map((p) => ({
          produtoId: p.id,
          quantidade: carrinho[p.id],
        })),
      );

      setCarrinho({});
      setMesaSelecionada(null);
      setMesaAberta(false);
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

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}>
          <Text style={styles.titulo}>Novo Pedido</Text>

          <TouchableOpacity
            onPress={onAbrirFila}
            disabled={!onAbrirFila}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: LARANJA,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 8,
              gap: 6,
            }}
          >
            <Feather name="clipboard" size={17} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              Fila
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitulo}>
          Produtos carregados diretamente da API.
        </Text>


        <View style={styles.comboboxContainer}>

          <Text style={styles.comboboxLabel}>
            Mesa
          </Text>

          <TouchableOpacity
            style={styles.combobox}
            onPress={() => setMesaAberta(!mesaAberta)}
          >

            <Text
              style={[
                styles.comboboxTexto,
                mesaSelecionada == null && styles.placeholder,
              ]}
            >
              {mesaSelecionada == null
                ? 'Selecione uma mesa'
                : `Mesa ${mesas.find(
                  (mesa) => mesa.id === mesaSelecionada
                )?.numero
                }`
              }
            </Text>

            <Feather
              name={mesaAberta ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#64748B"
            />

          </TouchableOpacity>


          {mesaAberta && (

            <View style={styles.listaMesas}>

              {mesas.length === 0 ? (

                <Text style={styles.semMesas}>
                  Nenhuma mesa cadastrada.
                </Text>

              ) : (

                mesas.map((mesaItem) => (

                  <TouchableOpacity
                    key={mesaItem.id}
                    style={[
                      styles.opcaoMesa,
                      mesaSelecionada === mesaItem.id &&
                      styles.opcaoMesaSelecionada,
                    ]}
                    onPress={() => {

                      setMesaSelecionada(
                        mesaItem.id
                      );

                      setMesaAberta(false);
                    }}
                  >

                    <View style={styles.mesaIcone}>
                      <Feather
                        name="grid"
                        size={16}
                        color={LARANJA}
                      />
                    </View>

                    <Text style={styles.opcaoMesaTexto}>
                      Mesa {mesaItem.numero}
                    </Text>

                    {mesaSelecionada === mesaItem.id && (
                      <Feather
                        name="check"
                        size={18}
                        color={LARANJA}
                      />
                    )}

                  </TouchableOpacity>

                ))

              )}

            </View>

          )}

        </View>

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

        {!carregando && categorias.length > 0 && (
          <FiltroChips
            opcoes={categorias}
            selecionado={categoriaSelecionada}
            onSelecionar={setCategoriaSelecionada}
          />
        )}

        {carregando ? (
          <ActivityIndicator size="large" color={LARANJA} style={{ marginTop: 32 }} />
        ) : produtos.length === 0 ? (
          <Text style={styles.vazio}>Nenhum produto ativo encontrado.</Text>
        ) : produtosFiltrados.length === 0 ? (
          <Text style={styles.vazio}>Nenhum produto nesta categoria.</Text>
        ) : (
          <View style={styles.grade}>
            {produtosFiltrados.map((p) => {
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
                      <TouchableOpacity onPress={() => mudar(p.id, 1)}>
                        <Text style={[styles.adicionar, { color: LARANJA }]}>
                          Adicionar
                        </Text>
                      </TouchableOpacity>
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
