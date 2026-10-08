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