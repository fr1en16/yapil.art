'use client';

import React from 'react';
import {
  Search,
  X,
  LayoutGrid,
  Columns3,
  List,
  RotateCw,
  Folder,
  FileText,
  HardDrive,
} from 'lucide-react';
import { SortField, SortOrder, ViewMode } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  folderCount: number;
  fileCount: number;
  totalSize: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  sortField,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  folderCount,
  fileCount,
  totalSize,
  isLoading,
  onRefresh,
}) => {
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, field === 'date' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3 border-b border-zinc-800/80">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск файлов и папок..."
          className="w-full bg-zinc-900/90 text-sm text-zinc-200 placeholder-zinc-500 rounded-xl pl-9 pr-9 py-2 border border-zinc-800 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-zinc-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Action Controls & Stats */}
      <div className="flex items-center flex-wrap gap-2 justify-between sm:justify-end text-xs">
        {/* Info stats */}
        <div className="hidden lg:flex items-center gap-3 text-zinc-400 mr-2">
          {folderCount > 0 && (
            <span className="flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-orange-400/80" />
              <span>{folderCount} папок</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>{fileCount} файлов</span>
          </span>
          {totalSize > 0 && (
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formatBytes(totalSize)}</span>
            </span>
          )}
        </div>

        {/* Sort Controls */}
        <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-zinc-300">
          <button
            onClick={() => toggleSort('name')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-all ${
              sortField === 'name' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-white'
            }`}
            title="Сортировать по имени"
          >
            Имя {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('date')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-all ${
              sortField === 'date' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-white'
            }`}
            title="Сортировать по дате изменения"
          >
            Дата {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('size')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-all ${
              sortField === 'size' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-white'
            }`}
            title="Сортировать по размеру"
          >
            Размер {sortField === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-zinc-400">
          <button
            onClick={() => onViewModeChange('masonry')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'masonry' ? 'bg-zinc-800 text-orange-400 shadow-sm' : 'hover:text-white'
            }`}
            title="Мансори (исходные пропорции)"
          >
            <Columns3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-zinc-800 text-orange-400 shadow-sm' : 'hover:text-white'
            }`}
            title="Квадратная сетка"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list' ? 'bg-zinc-800 text-orange-400 shadow-sm' : 'hover:text-white'
            }`}
            title="Список"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all disabled:opacity-50"
          title="Обновить список"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
        </button>
      </div>
    </div>
  );
};
