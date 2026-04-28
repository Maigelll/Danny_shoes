'use client';

import { Header } from '@/components/layout/header';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Configuración" subtitle="Preferencias del sistema y facturación" />
      
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <SettingsIcon className="w-10 h-10 text-brand-blue" />
        </div>
        <h2 className="text-2xl font-bold text-brand-900 mb-2">Configuración del Sistema</h2>
        <p className="text-brand-500 max-w-md">
          Esta sección está en construcción. Aquí podrás configurar las credenciales de facturación electrónica,
          ajustes de la tienda y preferencias de impresión térmica.
        </p>
      </div>
    </div>
  );
}
