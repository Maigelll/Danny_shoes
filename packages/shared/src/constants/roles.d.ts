export declare const ROLES: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly TENANT_ADMIN: "TENANT_ADMIN";
    readonly STORE_MANAGER: "STORE_MANAGER";
    readonly WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER";
    readonly CASHIER: "CASHIER";
    readonly WAREHOUSE_OP: "WAREHOUSE_OP";
    readonly VIEWER: "VIEWER";
};
export type Role = (typeof ROLES)[keyof typeof ROLES];
export declare const ROLE_HIERARCHY: Record<Role, number>;
export declare const ADMIN_ROLES: Role[];
export declare const MANAGER_ROLES: Role[];
export declare const OPERATOR_ROLES: Role[];
