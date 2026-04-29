'use client';

import { useEffect, useState } from 'react';
import { Search, AlertTriangle, Package } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export default function InventoryPage() {
  const user = useAuthStore((s) => s.user);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = 1) => {
    if (!user?.storeId) return;
    try {
      const res = await api.get(`/inventory/store/${user.storeId}`, { params: { page: p, limit: 50 } });
      setStock(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Error cargando inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.storeId]);

  const filtered = stock.filter((s) =>
    s.reference?.toLowerCase().includes(search.toLowerCase()) ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.barcode?.includes(search),
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Inventario" subtitle="Stock en tu local" />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Referencia, nombre o código..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Referencia', 'Nombre', 'Talla', 'Disponible', 'Reservado', 'Ubicación', 'Precio'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Cargando inventario...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Sin resultados</td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.skuId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{item.reference}</td>
                      <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-8 h-7 bg-gray-100 rounded text-xs font-bold text-gray-700">
                          {item.size}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-semibold ${item.isCritical ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.isCritical && <AlertTriangle className="w-3 h-3" />}
                          {item.availableQuantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.reservedQuantity}</td>
                      <td className="px-4 py-3">
                        {item.locationCode ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                            {item.locationCode}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatCurrency(item.salePrice)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => { setPage(p => p - 1); load(page - 1); }} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition">
                Anterior
              </button>
              <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
              <button onClick={() => { setPage(p => p + 1); load(page + 1); }} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition">
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
