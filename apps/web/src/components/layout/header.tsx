'use client';

import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="bg-white border-b border-brand-100 px-6 py-4 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-brand-900">{title}</h1>
        {subtitle && <p className="text-sm text-brand-600/70 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-magenta rounded-full shadow-sm" />
        </button>
        <div className="w-px h-8 bg-brand-100 hidden sm:block" />
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-brand-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-brand-500 font-medium">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>
    </header>
  );
}
