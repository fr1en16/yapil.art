'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Cloud, KeyRound, AlertCircle } from 'lucide-react';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    // Check if auth is actually required
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authRequired || data.isAuthenticated) {
          router.replace(redirectUrl);
        }
      })
      .catch(() => {});
  }, [redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError(data.error || 'Неверный пароль');
      }
    } catch {
      setError('Не удалось подключиться к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 shadow-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-orange-950/40 mb-4">
          <Cloud className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">R2 Gallery</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Введите пароль для доступа к медиа-хранилищу
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-1.5">
            Пароль
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              required
              className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-600 rounded-xl px-4 py-3 border border-zinc-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Войти в галерею</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-zinc-500 text-sm">Загрузка...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
