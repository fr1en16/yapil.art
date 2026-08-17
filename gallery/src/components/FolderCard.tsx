'use client';

import React from 'react';
import { Folder, ArrowRight } from 'lucide-react';
import { getFolderName } from '@/lib/utils';

interface FolderCardProps {
  prefix: string;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
}

export const FolderCard: React.FC<FolderCardProps> = ({ prefix, onClick, viewMode = 'grid' }) => {
  const name = getFolderName(prefix);

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-orange-500/30 transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform shrink-0">
            <Folder className="w-5 h-5 fill-orange-400/20" />
          </div>
          <span className="font-medium text-sm text-zinc-200 group-hover:text-orange-400 transition-colors truncate">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
          <span>Папка</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-4 aspect-square rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-orange-500/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-orange-950/20 select-none overflow-hidden"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-300 shadow-inner">
        <Folder className="w-7 h-7 sm:w-8 sm:h-8 fill-orange-400/20" />
      </div>

      <div className="mt-3 w-full text-center px-1">
        <p className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-orange-400 transition-colors truncate">
          {name}
        </p>
        <span className="text-[10px] text-zinc-500 font-normal">Папка</span>
      </div>

      {/* Subtle indicator arrow */}
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
