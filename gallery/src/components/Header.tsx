'use client';

import React from 'react';
import { Cloud, Lock, LogOut } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface HeaderProps {
  currentPrefix: string;
  onNavigate: (prefix: string) => void;
  authRequired?: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPrefix,
  onNavigate,
  authRequired,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={() => onNavigate('')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/30 group-hover:scale-105 transition-transform">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  R2 Gallery
                </span>
                <span className="text-[10px] text-zinc-400 -mt-0.5 font-mono">
                  Cloudflare Storage
                </span>
              </div>
            </div>
          </div>

          {/* Breadcrumbs (Desktop & Tablet) */}
          <div className="hidden sm:flex flex-1 items-center px-4 overflow-x-auto py-1 no-scrollbar">
            <Breadcrumbs currentPrefix={currentPrefix} onNavigate={onNavigate} />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {authRequired && onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-medium transition-all"
                title="Выйти из галереи"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выход</span>
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumbs for Mobile (below header row) */}
        <div className="sm:hidden pb-3 pt-1 border-t border-zinc-900 overflow-x-auto no-scrollbar">
          <Breadcrumbs currentPrefix={currentPrefix} onNavigate={onNavigate} />
        </div>
      </div>
    </header>
  );
};
