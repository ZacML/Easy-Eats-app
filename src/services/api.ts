import type { LoginResponse } from '../types/auth';
import type { Produto } from '../types/produto';
import type { Pedido, StatusPedido, PaginaPedidos } from '../types/pedido';
import type { Categoria } from '../types/categoria';
import type { Mesa } from '../types/mesa';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

export async function atualizarStatusPedido(id: number, status: StatusPedido) {
  return request<Pedido>(`/pedido/${id}/status/${status}`, {
    method: 'PATCH',
  });
}

export async function listarMesas(): Promise<Mesa[]> {
  const mesas = await request<Mesa[]>('/mesa');

  return mesas.filter(
    (mesa) => mesa.flativo === 'S'
  );
}

let token: string | null = null;

function authHeaders() {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ username, password }).toString(),
  });

  if (!response.ok) {
    const mensagem = await response.text();
    throw new Error(mensagem || 'Falha no login.');
  }

  token = (await response.text()).trim();

  return token;
}

export function logout() {
  token = null;
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

export async function listarPedidos(status?: StatusPedido, antesDe?: string): Promise<Pedido[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (antesDe) params.set('antesDe', antesDe);
  const query = params.toString();

  return request<Pedido[]>(`/pedido${query ? `?${query}` : ''}`);
}

// export async function listarPedidosPaginado(
//   params: { status: StatusPedido; offset: number; limit: number; data?: string },
//   signal?: AbortSignal,
// ): Promise<PaginaPedidos> {
//   const query = new URLSearchParams({
//     status: params.status,
//     offset: String(params.offset),
//     limit: String(params.limit),
//   });
//   if (params.data) query.set('data', params.data);

//   return request<PaginaPedidos>(`/pedido?${query.toString()}`, { signal });
// }
