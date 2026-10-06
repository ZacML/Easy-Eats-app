const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

type LoginResponse = {
  username?: string;
  roles?: string[];
};

export type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
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

let credentials: { username: string; password: string } | null = null;

function authHeaders() {
  if (!credentials) {
    throw new Error('Usuário não autenticado.');
  }

  return {
    Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return [] as T;
  }

  if (!response.ok) {
    const mensagem = await response.text();
    throw new Error(mensagem || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const params = new URLSearchParams({ username, password });

  const response = await fetch(`${API_URL}/usuarios/login?${params.toString()}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Usuário ou senha incorretos.');
  }

  credentials = { username, password };
  return response.json();
}

export function logout() {
  credentials = null;
}

export async function listarProdutos(): Promise<Produto[]> {
  const [produtosResponse, precosResponse] = await Promise.all([
    request<any[]>('/produto'),
    request<any[]>('/preco'),
  ]);

  const precos = new Map<number, number>(
    precosResponse.map((p) => [Number(p.produtoId), Number(p.valor)]),
  );

  return produtosResponse.map((p) => ({
    id: Number(p.id),
    nome: p.nome,
    descricao: p.descricao ?? '',
    preco: precos.get(Number(p.id)) ?? 0,
  }));
}

export async function criarPedido(
  mesa: string,
  cliente: string,
  itens: { produtoId: number; quantidade: number }[],
) {
  return request<Pedido>('/pedido', {
    method: 'POST',
    body: JSON.stringify({ mesa, cliente, itens }),
  });
}

export async function listarPedidos(): Promise<Pedido[]> {
  return request<Pedido[]>('/pedido');
}
