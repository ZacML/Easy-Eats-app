import type { LoginResponse } from '../types/auth';
import type { Produto } from '../types/produto';
import type { Pedido, StatusPedido, PaginaPedidos } from '../types/pedido';
import type { Categoria } from '../types/categoria';
import type { Mesa } from '../types/mesa';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.107:8080';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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
    throw new ApiError(response.status, mensagem || `Erro HTTP ${response.status}`);
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

export function setToken(novoToken: string) {
  token = novoToken;
}

// Confirma na API se o token ainda vale. Retorna false só para 401/403;
// falha de rede ou 5xx lança erro para quem chamou decidir (sem apagar a digital).
export async function validarSessao(): Promise<boolean> {
  try {
    await request<unknown>('/mesa'); //arrumar
    return true;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      token = null;
      return false;
    }
    throw e;
  }
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

export async function registrarPushToken(pushToken: string) {
  await request<unknown>('/dispositivos/push-token', {
    method: 'POST',
    body: JSON.stringify({ token: pushToken }),
  });
}