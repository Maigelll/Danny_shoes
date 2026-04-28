'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña muy corta'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { user, tokens } = res.data;
      setAuth(user, tokens);
      toast.success(`Bienvenido, ${user.firstName}`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.error ?? 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Gradiente que replica el fondo del logo: navy → morado → magenta */
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0d1040 0%, #2d1060 35%, #6b2fc6 65%, #c62fc6 100%)',
      }}
    >
      {/* Círculo decorativo que evoca el círculo azul del logo */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1a5fc4 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #c62fc6 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / cabecera */}
        <div className="text-center mb-8">
          {/* Círculo azul del logo replicado en miniatura */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-2xl"
            style={{ background: 'radial-gradient(circle at 40% 35%, #2a7ee8 0%, #1a5fc4 50%, #0d3a8a 100%)' }}
          >
            <span
              className="text-white font-black text-xl tracking-tight"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              DS
            </span>
          </div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #ffffff 40%, #e879f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            DANNY<span style={{ WebkitTextFillColor: '#e879f9' }}>Shoes</span>
          </h1>
          <p className="text-purple-200 text-sm mt-1 opacity-80">Sistema de Gestión</p>
        </div>

        {/* Card de login */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-1.5">
                Correo electrónico
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="correo@empresa.com"
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/25 rounded-lg text-sm text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-[#c62fc6] focus:border-transparent transition"
              />
              {errors.email && (
                <p className="text-pink-300 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-100 mb-1.5">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/25 rounded-lg text-sm text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-[#c62fc6] focus:border-transparent transition"
              />
              {errors.password && (
                <p className="text-pink-300 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-60"
              style={{
                background: loading
                  ? 'rgba(198,47,198,0.5)'
                  : 'linear-gradient(90deg, #6b2fc6 0%, #c62fc6 100%)',
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-purple-300/60 mt-6">
          DannyShoes SaaS © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
