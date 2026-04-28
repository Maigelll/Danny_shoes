'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@dannyshoes/shared';
import type { OrderStatus } from '@dannyshoes/shared';
import { NewOrderModal } from '@/components/orders/new-order-modal';
import { toast } from 'sonner';

const STATUS_ICON: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PICKING: Package,
  SHIPPED: Truck,
  RECEIVED: CheckCircle,
  CANCELLED: XCircle,
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PICKING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-orange-100 text-orange-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      toast.error('Error cargando pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) =>
    o.requestingStore?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.fulfillingStore?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.includes(search),
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Pedidos Inter-tienda" subtitle="Solicitudes entre locales y bodega" />

      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por local o ID..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo pedido
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pedido</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Local solicitante</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bodega</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ítems</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Sin pedidos</td></tr>
                ) : (
                  filtered.map((order) => {
                    const StatusIcon = STATUS_ICON[order.status] ?? Clock;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs text-gray-500">{order.id.slice(0, 8)}…</span>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-800">{order.requestingStore?.name}</td>
                        <td className="px-5 py-3 text-gray-600">{order.fulfillingStore?.name}</td>
                        <td className="px-5 py-3 text-gray-600">{order.items?.length ?? 0} ítem(s)</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(order.requestedAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showNewOrder && (
        <NewOrderModal
          onClose={() => setShowNewOrder(false)}
          onCreated={() => { setShowNewOrder(false); load(); }}
        />
      )}
    </div>
  );
}
