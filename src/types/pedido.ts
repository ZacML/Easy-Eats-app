export type StatusPedido =
  | 'ABERTO'
  | 'EM_PREPARO'
  | 'FINALIZADO'
  | 'CANCELADO';

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
  status: StatusPedido;
  itens: ItemPedido[];
};