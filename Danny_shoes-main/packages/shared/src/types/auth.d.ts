import type { Role } from '../constants/roles';
export interface JwtPayload {
    sub: string;
    email: string;
    tenantId: string;
    storeId: string | null;
    role: Role;
    iat?: number;
    exp?: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    tenantId: string;
    storeId: string | null;
}
