'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, ShoppingCart, Loader2, Receipt } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

interface CartItem {
  skuId: string;
  reference: string;
  name: string;
  size: string;
  unitPrice: number;
  discount: number;
  quantity: number;
}

export default function PosPage() {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [searchSize, setSearchSize] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchProduct = async () => {
    if (!search || !searchSize) { toast.error('Ingresa referencia y talla'); return; }
    setSearching(true);
    try {
      const res = await api.get('/inventory/check', { params: { reference: search.toUpperCase(), size: searchSize } });
      setSearchResult(res.data);
    } catch {
      toast.error('Producto no encontrado');
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const addToCart = (result: any) => {
    const existing = cart.find((i) => i.skuId === result.skuId);
    if (existing) {
      setCart((prev) => prev.map((i) => i.skuId === result.skuId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart((prev) => [...prev, {
        skuId: result.skuId,
        reference: result.reference,
        name: result.reference,
        size: result.size,
        unitPrice: 0,
        discount: 0,
        quantity: 1,
      }]);
    }
    setSearch('');
    setSearchSize('');
    setSearchResult(null);
    toast.success(`${result.reference} T${result.size} agregado`);
  };

  const updatePrice = (skuId: string, price: number) => {
    setCart((prev) => prev.map((i) => i.skuId === skuId ? { ...i, unitPrice: price } : i));
  };

  const removeItem = (skuId: string) => setCart((prev) => prev.filter((i) => i.skuId !== skuId));

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discountTotal = cart.reduce((sum, i) => sum + i.discount * i.quantity, 0);
  const total = subtotal - discountTotal;

  const processSale = async () => {
    if (cart.length === 0) { toast.error('Agrega productos al carrito'); return; }
    if (cart.some((i) => i.unitPrice <= 0)) { toast.error('Todos los productos deben tener precio'); return; }

    setLoading(true);
    try {
      await api.post('/sales', {
        items: cart.map((i) => ({ skuId: i.skuId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount })),
        paymentMethod,
      });
      toast.success('Venta registrada exitosamente');
      setCart([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.error ?? 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Punto de Venta" subtitle="Registrar venta" />

      <div className="flex flex-1 overflow-hidden">
        {/* Buscador */}
        <div className="flex-1 p-6 overflow-auto space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">Buscar producto</h3>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchProduct()}
                placeholder="Referencia (REF-001)"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                value={searchSize}
                onChange={(e) => setSearchSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchProduct()}
                placeholder="Talla"
                className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={searchProduct}
                disabled={searching}
                className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {searchResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{searchResult.reference} — Talla {searchResult.size}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Stock local: <span className="font-medium text-green-700">{searchResult.localStock}</span>
                    {' | '}Bodega: <span className="font-medium">{searchResult.warehouseStock}</span>
                  </p>
                </div>
                <button
                  onClick={() => addToCart(searchResult)}
                  disabled={searchResult.localStock <= 0}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carrito */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Carrito ({cart.length})</h3>
          </div>

          <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
            {cart.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Sin productos</p>
            ) : (
              cart.map((item) => (
                <div key={item.skuId} className="border border-gray-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{item.reference}</p>
                      <p className="text-xs text-gray-500">Talla {item.size} × {item.quantity}</p>
                    </div>
                    <button onClick={() => removeItem(item.skuId)} className="text-gray-300 hover:text-red-500 transition p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="number"
                    value={item.unitPrice || ''}
                    onChange={(e) => updatePrice(item.skuId, +e.target.value)}
                    placeholder="Precio unitario"
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {item.unitPrice > 0 && (
                    <p className="text-xs text-right font-semibold text-gray-700">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Total + pago */}
          <div className="border-t border-gray-100 px-4 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-red-600">{formatCurrency(total)}</span>
            </div>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="MIXTO">Mixto</option>
            </select>

            <button
              onClick={processSale}
              disabled={loading || cart.length === 0}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
              {loading ? 'Procesando...' : 'Registrar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
