const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

type LoginResponse = {
  username?: string;
  roles?: string[];
};

export type Categoria = {
  id: number;
  nome: string;
  flativo: string;
};

export type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoriaId: number;
};

export type ItemPedido = {
  id?: number;
  pedidoId?: number;
  produtoId: number;
  quantidade: number;
  valorUnitario?: number;
};

export type Pedido = {
  id: number;
  dataCriacao: string;
  dataAlteracao?: string;
  mesa?: string;
  cliente?: string;
  status: 'ABERTO' | 'EM_PREPARO' | 'FINALIZADO' | 'CANCELADO';
  itens: ItemPedido[];
};

export type Mesa = {
  id: number;
  numero: number;
  flativo: string;
};

export async function listarMesas(): Promise<Mesa[]> {
  const mesas = await request<Mesa[]>('/mesa');

  return mesas.filter(
    (mesa) => mesa.flativo === 'S'
  );
}

let credentials: { username: string; password: string } | null = null;

function authHeaders() {
  if (!credentials) throw new Error('Usuário não autenticado.');

  return {
    Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  });

  if (response.status === 204) return [] as T;

  if (!response.ok) {
    const mensagem = await response.text();
    throw new Error(mensagem || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const params = new URLSearchParams({ username, password });
  const response = await fetch(`${API_URL}/usuarios/login?${params.toString()}`, { method: 'POST' });

  if (!response.ok) throw new Error('Usuário ou senha incorretos.');

  credentials = { username, password };
  return response.json();
}

export function logout() {
  credentials = null;
}

export async function listarCategorias(): Promise<Categoria[]> {
  const categorias = await request<Categoria[]>('/categorias');
  return categorias.filter((categoria) => categoria.flativo === 'S');
}

export async function listarProdutos(): Promise<Produto[]> {
  const [produtosResponse, precosResponse] = await Promise.all([
    request<any[]>('/produto'),
    request<any[]>('/preco'),
  ]);

  const precos = new Map<number, number>(
    precosResponse.map((p) => [Number(p.produtoId), Number(p.valor)]),
  );

  return produtosResponse
    .filter((p) => p.categoriaId != null)
    .map((p) => ({
      id: Number(p.id),
      nome: p.nome,
      descricao: p.descricao ?? '',
      preco: precos.get(Number(p.id)) ?? 0,
      categoriaId: Number(p.categoriaId),
    }));
}

export async function criarPedido(
  mesaId: number,
  cliente: string,
  itens: { produtoId: number; quantidade: number }[],
) {
  return request<Pedido>('/pedido', {
    method: 'POST',
    body: JSON.stringify({
      mesaId,
      cliente,
      itens,
    }),
  });
}

export async function listarPedidos(): Promise<Pedido[]> {
  return request<Pedido[]>('/pedido');
}
