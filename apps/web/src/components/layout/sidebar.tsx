'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  ArrowLeftRight, Users, Settings, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
  { href: '/dashboard/pos', label: 'Punto de Venta', icon: ShoppingCart, roles: ['CASHIER', 'STORE_MANAGER', 'TENANT_ADMIN'] },
  { href: '/dashboard/inventory', label: 'Inventario', icon: Package, roles: ['*'] },
  { href: '/dashboard/orders', label: 'Pedidos', icon: ArrowLeftRight, roles: ['CASHIER', 'STORE_MANAGER', 'WAREHOUSE_OP', 'WAREHOUSE_MANAGER', 'TENANT_ADMIN'] },
  { href: '/dashboard/warehouse', label: 'Bodega', icon: Warehouse, roles: ['WAREHOUSE_OP', 'WAREHOUSE_MANAGER', 'TENANT_ADMIN'] },
  { href: '/dashboard/users', label: 'Usuarios', icon: Users, roles: ['TENANT_ADMIN'] },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings, roles: ['TENANT_ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const visibleItems = navItems.filter(
    (item) => item.roles.includes('*') || item.roles.includes(user?.role ?? ''),
  );

  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0d1040 0%, #1a0d50 60%, #2d1060 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        {/* Mini círculo azul del logo */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{
            background: 'radial-gradient(circle at 40% 35%, #2a7ee8 0%, #1a5fc4 55%, #0d3a8a 100%)',
            boxShadow: '0 0 12px rgba(26,95,196,0.5)',
          }}
        >
          <span className="text-white font-black text-xs tracking-tight">DS</span>
        </div>
        <div>
          <p
            className="font-black text-sm leading-tight"
            style={{
              background: 'linear-gradient(90deg, #ffffff 30%, #e879f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            DANNY<span style={{ WebkitTextFillColor: '#e879f9' }}>Shoes</span>
          </p>
          <p className="text-purple-300/60 text-xs">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'text-white shadow-md'
                  : 'text-purple-200/70 hover:text-white hover:bg-white/8',
              )}
              style={isActive ? {
                background: 'linear-gradient(90deg, #6b2fc6 0%, #c62fc6 100%)',
                boxShadow: '0 2px 12px rgba(198,47,198,0.35)',
              } : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6b2fc6 0%, #c62fc6 100%)' }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-purple-300/60 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-purple-200/60 hover:text-white hover:bg-white/8 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
