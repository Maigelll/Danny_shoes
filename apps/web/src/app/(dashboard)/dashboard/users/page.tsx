'use client';

import { Header } from '@/components/layout/header';
import { Users as UsersIcon } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Usuarios" subtitle="Gestión de personal y roles" />
      
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <UsersIcon className="w-10 h-10 text-brand-purple" />
        </div>
        <h2 className="text-2xl font-bold text-brand-900 mb-2">Módulo de Usuarios</h2>
        <p className="text-brand-500 max-w-md">
          Esta sección está en construcción. Aquí podrás gestionar los accesos, 
          crear nuevos usuarios y asignar roles (Cajero, Bodeguero, Administrador).
        </p>
      </div>
    </div>
  );
}
