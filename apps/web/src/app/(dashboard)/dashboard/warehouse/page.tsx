'use client';

import { useEffect, useState } from 'react';
import { Clock, Package, CheckCircle, Printer } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { ORDER_STATUS_LABELS } from '@dannyshoes/shared';
import type { OrderStatus } from '@dannyshoes/shared';

export default function WarehousePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/warehouse/orders/pending');
      setOrders(res.data);
    } catch {
      toast.error('Error cargando pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Pedido actualizado a: ${ORDER_STATUS_LABELS[status]}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.error ?? 'Error al actualizar');
    } finally {
      setUpdating(null);
    }
  };

  const retryPrint = async (orderId: string) => {
    try {
      await api.patch('/print/jobs/retry');
      toast.success('Reimpresión enviada a la impresora');
    } catch {
      toast.error('Error al reenviar a impresora');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Panel de Bodega" subtitle="Pedidos pendientes de picking y despacho" />

      <div className="p-6 space-y-4">
        {/* Contador */}
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">{orders.length} pedido(s) pendiente(s)</span>
          </div>
        </div>

        {/* Cards de pedidos */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Todo al día</p>
            <p className="text-sm text-gray-400">No hay pedidos pendientes</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header del pedido */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{order.requestingStore?.name}</span>
                      <span className="text-gray-400 text-sm">solicita</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{order.id.slice(0, 16)}…</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(order.requestedAt)}</span>
                  </div>
                </div>

                {/* Ítems */}
                <div className="px-5 py-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase">
                        <th className="text-left pb-2 font-semibold">Referencia</th>
                        <th className="text-left pb-2 font-semibold">Producto</th>
                        <th className="text-left pb-2 font-semibold">Talla</th>
                        <th className="text-left pb-2 font-semibold">Cant.</th>
                        <th className="text-left pb-2 font-semibold">Ubicación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {order.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-2 font-mono text-xs font-bold text-gray-700">{item.sku?.product?.reference}</td>
                          <td className="py-2 text-gray-800">{item.sku?.product?.name}</td>
                          <td className="py-2">
                            <span className="inline-flex items-center justify-center w-8 h-7 bg-gray-100 rounded text-xs font-bold">
                              {item.sku?.size}
                            </span>
                          </td>
                          <td className="py-2 font-semibold text-gray-800">{item.quantityRequested}</td>
                          <td className="py-2">
                            {item.location?.fullCode ? (
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono font-bold">
                                {item.location.fullCode}
                              </span>
                            ) : (
                              <span className="text-orange-500 text-xs">Sin ubicación</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => updateStatus(order.id, 'CONFIRMED')}
                      disabled={updating === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Confirmar
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateStatus(order.id, 'PICKING')}
                      disabled={updating === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                    >
                      <Package className="w-3 h-3" />
                      Iniciar picking
                    </button>
                  )}
                  {order.status === 'PICKING' && (
                    <button
                      onClick={() => updateStatus(order.id, 'SHIPPED')}
                      disabled={updating === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Despachar
                    </button>
                  )}
                  <button
                    onClick={() => retryPrint(order.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition"
                  >
                    <Printer className="w-3 h-3" />
                    Reimprimir ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
