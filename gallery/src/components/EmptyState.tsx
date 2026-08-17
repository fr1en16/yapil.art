'use client';

import React from 'react';
import { FolderOpen, SearchX, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'unconfigured' | 'empty' | 'search_empty' | 'error';
  searchQuery?: string;
  errorMessage?: string;
  onClearSearch?: () => void;
  onNavigateRoot?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  errorMessage,
  onClearSearch,
  onNavigateRoot,
}) => {
  if (type === 'unconfigured') {
    return (
      <div className="my-12 p-8 sm:p-12 rounded-3xl bg-zinc-900/60 border border-orange-500/30 shadow-2xl max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto mb-6 shadow-inner">
          <KeyRound className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Настройка Cloudflare R2</h3>
        <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
          Для отображения файлов заполните учетные данные R2 в файле{' '}
          <code className="text-orange-400 bg-zinc-950 px-2 py-0.5 rounded font-mono text-xs">
            .env.local
          </code>
        </p>

        <div className="bg-zinc-950/90 rounded-2xl p-5 text-left font-mono text-xs text-zinc-300 border border-zinc-800 space-y-2 select-all mb-6">
          <p className="text-zinc-500"># gallery/.env.local</p>
          <p>
            <span className="text-orange-400">R2_ACCOUNT_ID</span>=
            <span className="text-zinc-500">ваш_account_id</span>
          </p>
          <p>
            <span className="text-orange-400">R2_ACCESS_KEY_ID</span>=
            <span className="text-zinc-500">ваш_access_key_id</span>
          </p>
          <p>
            <span className="text-orange-400">R2_SECRET_ACCESS_KEY</span>=
            <span className="text-zinc-500">ваш_secret_key</span>
          </p>
          <p>
            <span className="text-orange-400">R2_BUCKET_NAME</span>=
            <span className="text-zinc-300">yapil</span>
          </p>
          <p className="text-zinc-500 mt-2"># Опционально:</p>
          <p>
            <span className="text-zinc-400">NEXT_PUBLIC_R2_PUBLIC_DOMAIN</span>=
            <span className="text-zinc-500">https://media.domain.com</span>
          </p>
          <p>
            <span className="text-zinc-400">APP_PASSWORD</span>=
            <span className="text-zinc-500">пароль_для_входа</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-zinc-500">
          <span>После сохранения переменных обновите страницу.</span>
        </div>
      </div>
    );
  }

  if (type === 'search_empty') {
    return (
      <div className="my-16 flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200 mb-1">Ничего не найдено</h3>
        <p className="text-xs text-zinc-500 max-w-sm mb-4">
          По запросу <span className="text-zinc-300 font-medium">«{searchQuery}»</span> в этой папке нет совпадений.
        </p>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
          >
            Очистить поиск
          </button>
        )}
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="my-16 flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-red-400 mb-1">Ошибка подключения к R2</h3>
        <p className="text-xs text-zinc-400 max-w-md mb-4 break-words">
          {errorMessage || 'Не удалось получить список объектов из Cloudflare R2.'}
        </p>
        {onNavigateRoot && (
          <button
            onClick={onNavigateRoot}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
          >
            Вернуться в корень
          </button>
        )}
      </div>
    );
  }

  // type === 'empty'
  return (
    <div className="my-16 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
        <FolderOpen className="w-8 h-8 text-orange-400/60" />
      </div>
      <h3 className="text-base font-semibold text-zinc-200 mb-1">Папка пуста</h3>
      <p className="text-xs text-zinc-500 max-w-sm mb-4">
        В этой директории нет файлов или вложенных папок.
      </p>
      {onNavigateRoot && (
        <button
          onClick={onNavigateRoot}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
        >
          Вернуться в корень
        </button>
      )}
    </div>
  );
};
