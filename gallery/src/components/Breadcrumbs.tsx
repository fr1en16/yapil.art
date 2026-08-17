'use client';

import React from 'react';
import { Home, ChevronRight, Folder } from 'lucide-react';

interface BreadcrumbsProps {
  currentPrefix: string;
  onNavigate: (prefix: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPrefix, onNavigate }) => {
  // Split prefix into parts (e.g., "media/photos/summer/" -> ["media", "photos", "summer"])
  const parts = currentPrefix.split('/').filter(Boolean);

  return (
    <nav aria-label="Хлебные крошки" className="flex items-center flex-wrap gap-1 text-sm font-medium">
      <button
        onClick={() => onNavigate('')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
          parts.length === 0
            ? 'bg-zinc-800 text-white font-semibold'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
        }`}
        title="Корень хранилища"
      >
        <Home className="w-4 h-4 text-orange-500" />
        <span>Root</span>
      </button>

      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        // Build prefix up to this segment including trailing slash
        const segmentPrefix = parts.slice(0, index + 1).join('/') + '/';

        return (
          <React.Fragment key={segmentPrefix}>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <button
              onClick={() => onNavigate(segmentPrefix)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all max-w-[200px] truncate ${
                isLast
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm ring-1 ring-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
              title={part}
            >
              <Folder className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">{part}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
