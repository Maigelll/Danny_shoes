'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function NewOrderModal({ onClose, onCreated }: Props) {
  const [stores, setStores] = useState<any[]>([]);
  const [fulfillingStoreId, setFulfillingStoreId] = useState('');
  const [items, setItems] = useState([{ reference: '', size: '', quantity: 1, skuId: '' }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/stores').then((r) => {
      setStores(r.data.filter((s: any) => s.isCentralWarehouse || s.type === 'WAREHOUSE'));
    });
  }, []);

  const addItem = () => setItems((prev) => [...prev, { reference: '', size: '', quantity: 1, skuId: '' }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const resolveSkuId = async (reference: string, size: string): Promise<string | null> => {
    try {
      const res = await api.get('/inventory/check', { params: { reference, size } });
      return res.data.skuId ?? null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillingStoreId) { toast.error('Selecciona la bodega'); return; }

    setLoading(true);
    try {
      const resolvedItems = await Promise.all(
        items.map(async (item) => {
          const skuId = await resolveSkuId(item.reference, item.size);
          if (!skuId) throw new Error(`SKU no encontrado: ${item.reference} T${item.size}`);
          return { skuId, quantity: item.quantity };
        }),
      );

      await api.post('/orders', { fulfillingStoreId, items: resolvedItems });
      toast.success('Pedido creado — ticket imprimiéndose en bodega');
      onCreated();
    } catch (err: any) {
      toast.error(err.message ?? err?.response?.data?.message?.error ?? 'Error al crear pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Nuevo pedido a bodega</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bodega destino</label>
            <select
              value={fulfillingStoreId}
              onChange={(e) => setFulfillingStoreId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Seleccionar bodega...</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Zapatos solicitados</label>
              <button type="button" onClick={addItem} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>

            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  placeholder="Ref. (ej: REF-001)"
                  value={item.reference}
                  onChange={(e) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, reference: e.target.value } : it))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  placeholder="Talla"
                  value={item.size}
                  onChange={(e) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, size: e.target.value } : it))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, quantity: +e.target.value } : it))}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="p-2 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
