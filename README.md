# DannyShoes — Sistema SaaS de Gestión de Calzado

Sistema ERP/POS cloud-native para empresas de calzado. Cubre bodega central, locales físicos, facturación electrónica y dashboard ejecutivo en tiempo real.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend:** NestJS 10 + TypeScript
- **Base de datos:** PostgreSQL 16 + Redis 7
- **Mobile:** React Native (Expo) — Dashboard Ejecutivo
- **Print Agent:** Go — Impresión térmica directa (Epson ESC/POS)
- **Monorepo:** pnpm workspaces + Turborepo

## Estructura del Proyecto

```
Danny_shoes/
├── apps/
│   ├── web/          # Next.js — POS + Bodega + Admin
│   ├── api/          # NestJS — Backend principal
│   └── mobile/       # React Native — App ejecutiva
├── packages/
│   ├── database/     # Prisma schema + migraciones
│   ├── shared/       # Tipos y utilidades compartidas
│   └── ui/           # Componentes UI compartidos
├── infrastructure/
│   └── docker/       # Configuración Docker
└── docker-compose.yml
```

## Inicio Rápido (Desarrollo Local)

### Requisitos
- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

### Setup

```bash
# Instalar dependencias
pnpm install

# Levantar PostgreSQL + Redis local
docker-compose up -d

# Correr migraciones de base de datos
pnpm db:migrate

# Iniciar todos los servicios en desarrollo
pnpm dev
```

### Servicios locales
| Servicio | URL |
|----------|-----|
| Web (POS/Admin) | http://localhost:3000 |
| API (NestJS) | http://localhost:4000 |
| API Docs (Swagger) | http://localhost:4000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| **IAM** | Autenticación, roles RBAC/ABAC, multi-tenant |
| **Inventario** | SKUs, stock por tienda, ubicaciones en estantería |
| **POS** | Ventas, caja, devoluciones, clientes |
| **Bodega** | Pedidos inter-tienda, picking, recepción de mercancía |
| **Finanzas** | Cuadre de caja, cartera, factura electrónica |
| **Analytics** | Dashboard ejecutivo, KPIs en tiempo real, alertas |
| **PrintDispatch** | Impresión térmica automática vía DannyAgent |

## Equipo

| Rol | Contacto |
|-----|----------|
| Product Owner / Dev | [@Maigelll](https://github.com/Maigelll) |
| Colaborador / Dev | [@steban](https://github.com/steban) |
