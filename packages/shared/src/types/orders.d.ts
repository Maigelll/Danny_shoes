export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PICKING' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
export interface OrderStatusTransition {
    from: OrderStatus;
    to: OrderStatus;
    allowedRoles: string[];
}
export declare const ORDER_STATUS_TRANSITIONS: OrderStatusTransition[];
export declare const ORDER_STATUS_LABELS: Record<OrderStatus, string>;
