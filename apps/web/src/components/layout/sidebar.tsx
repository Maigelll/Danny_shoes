'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  ArrowLeftRight, Users, Settings, ShoppingBag, LogOut,
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
    <aside className="w-64 min-h-screen bg-gray-900 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">DannyShoes</p>
          <p className="text-gray-400 text-xs">{user?.role?.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
