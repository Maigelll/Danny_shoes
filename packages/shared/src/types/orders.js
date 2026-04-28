"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_STATUS_LABELS = exports.ORDER_STATUS_TRANSITIONS = void 0;
exports.ORDER_STATUS_TRANSITIONS = [
    { from: 'PENDING', to: 'CONFIRMED', allowedRoles: ['WAREHOUSE_MANAGER', 'WAREHOUSE_OP', 'TENANT_ADMIN'] },
    { from: 'CONFIRMED', to: 'PICKING', allowedRoles: ['WAREHOUSE_OP', 'WAREHOUSE_MANAGER'] },
    { from: 'PICKING', to: 'SHIPPED', allowedRoles: ['WAREHOUSE_OP', 'WAREHOUSE_MANAGER'] },
    { from: 'SHIPPED', to: 'RECEIVED', allowedRoles: ['CASHIER', 'STORE_MANAGER', 'TENANT_ADMIN'] },
    { from: 'PENDING', to: 'CANCELLED', allowedRoles: ['STORE_MANAGER', 'TENANT_ADMIN'] },
    { from: 'CONFIRMED', to: 'CANCELLED', allowedRoles: ['WAREHOUSE_MANAGER', 'TENANT_ADMIN'] },
];
exports.ORDER_STATUS_LABELS = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PICKING: 'En Picking',
    SHIPPED: 'Despachado',
    RECEIVED: 'Recibido',
    CANCELLED: 'Cancelado',
};
//# sourceMappingURL=orders.js.map