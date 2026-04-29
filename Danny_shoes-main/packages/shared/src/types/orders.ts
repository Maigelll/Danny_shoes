export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKING'
  | 'SHIPPED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface OrderStatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: string[];
}

export const ORDER_STATUS_TRANSITIONS: OrderStatusTransition[] = [
  { from: 'PENDING', to: 'CONFIRMED', allowedRoles: ['WAREHOUSE_MANAGER', 'WAREHOUSE_OP', 'TENANT_ADMIN'] },
  { from: 'CONFIRMED', to: 'PICKING', allowedRoles: ['WAREHOUSE_OP', 'WAREHOUSE_MANAGER'] },
  { from: 'PICKING', to: 'SHIPPED', allowedRoles: ['WAREHOUSE_OP', 'WAREHOUSE_MANAGER'] },
  { from: 'SHIPPED', to: 'RECEIVED', allowedRoles: ['CASHIER', 'STORE_MANAGER', 'TENANT_ADMIN'] },
  { from: 'PENDING', to: 'CANCELLED', allowedRoles: ['STORE_MANAGER', 'TENANT_ADMIN'] },
  { from: 'CONFIRMED', to: 'CANCELLED', allowedRoles: ['WAREHOUSE_MANAGER', 'TENANT_ADMIN'] },
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PICKING: 'En Picking',
  SHIPPED: 'Despachado',
  RECEIVED: 'Recibido',
  CANCELLED: 'Cancelado',
};
