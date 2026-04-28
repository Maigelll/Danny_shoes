"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATOR_ROLES = exports.MANAGER_ROLES = exports.ADMIN_ROLES = exports.ROLE_HIERARCHY = exports.ROLES = void 0;
exports.ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    TENANT_ADMIN: 'TENANT_ADMIN',
    STORE_MANAGER: 'STORE_MANAGER',
    WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
    CASHIER: 'CASHIER',
    WAREHOUSE_OP: 'WAREHOUSE_OP',
    VIEWER: 'VIEWER',
};
exports.ROLE_HIERARCHY = {
    SUPER_ADMIN: 100,
    TENANT_ADMIN: 80,
    STORE_MANAGER: 60,
    WAREHOUSE_MANAGER: 60,
    CASHIER: 40,
    WAREHOUSE_OP: 40,
    VIEWER: 20,
};
exports.ADMIN_ROLES = ['SUPER_ADMIN', 'TENANT_ADMIN'];
exports.MANAGER_ROLES = [...exports.ADMIN_ROLES, 'STORE_MANAGER', 'WAREHOUSE_MANAGER'];
exports.OPERATOR_ROLES = [...exports.MANAGER_ROLES, 'CASHIER', 'WAREHOUSE_OP'];
//# sourceMappingURL=roles.js.map