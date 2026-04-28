'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Package, ArrowLeftRight, AlertTriangle, TrendingUp, Warehouse } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface DashboardSummary {
  stores: number;
  pendingOrders: number;
  todaySalesTotal: number;
  todaySalesCount: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, alertsRes] = await Promise.all([
          api.get('/tenants/dashboard'),
          api.get('/inventory/alerts/low-stock'),
        ]);
        setSummary(summaryRes.data);
        setLowStock(alertsRes.data.slice(0, 5));
      } catch {
        // silencioso — user puede no tener permiso para todas
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const kpis = [
    {
      label: 'Ventas hoy',
      value: formatCurrency(summary?.todaySalesTotal ?? 0),
      sub: `${summary?.todaySalesCount ?? 0} transacciones`,
      icon: ShoppingCart,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Pedidos pendientes',
      value: summary?.pendingOrders ?? 0,
      sub: 'Requieren atención',
      icon: ArrowLeftRight,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Locales activos',
      value: summary?.stores ?? 0,
      sub: 'Incluye bodegas',
      icon: Warehouse,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Alertas de stock',
      value: lowStock.length,
      sub: 'SKUs bajo mínimo',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="Resumen operativo en tiempo real" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 font-medium">{kpi.label}</p>
                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas de stock crítico */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Stock Crítico</h3>
              </div>
              <span className="text-xs text-gray-400">{lowStock.length} alertas</span>
            </div>
            <div className="divide-y divide-gray-50">
              {lowStock.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  Sin alertas de stock crítico
                </div>
              ) : (
                lowStock.map((item, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.reference} — T{item.size}</p>
                      <p className="text-xs text-gray-400">{item.store}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {item.available} uds
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Accesos rápidos</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { href: '/dashboard/pos', label: 'Nueva Venta', icon: ShoppingCart, color: 'bg-green-500' },
                { href: '/dashboard/orders', label: 'Pedir a Bodega', icon: ArrowLeftRight, color: 'bg-blue-500' },
                { href: '/dashboard/warehouse', label: 'Ver Pedidos', icon: Warehouse, color: 'bg-orange-500' },
                { href: '/dashboard/inventory', label: 'Inventario', icon: Package, color: 'bg-purple-500' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
