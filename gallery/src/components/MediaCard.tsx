'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileCode,
  FileArchive,
  Music,
  Video,
  Copy,
  Check,
  Download,
  Play,
} from 'lucide-react';
import { R2File, ViewMode } from '@/lib/types';
import { formatBytes, formatDate, triggerFileDownload } from '@/lib/utils';

interface MediaCardProps {
  file: R2File;
  onPreview: (file: R2File) => void;
  viewMode?: ViewMode;
}

export const MediaCard: React.FC<MediaCardProps> = ({ file, onPreview, viewMode = 'masonry' }) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!file.url) return;
    navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!file.url) return;
    triggerFileDownload(file.url, file.name, file.key);
  };

  const renderFileIcon = () => {
    switch (file.type) {
      case 'video':
        return <Video className="w-8 h-8 text-blue-400" />;
      case 'audio':
        return <Music className="w-8 h-8 text-purple-400" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-400" />;
      case 'archive':
        return <FileArchive className="w-8 h-8 text-amber-400" />;
      case 'code':
        return <FileCode className="w-8 h-8 text-emerald-400" />;
      case 'document':
        return <FileText className="w-8 h-8 text-sky-400" />;
      default:
        return <FileText className="w-8 h-8 text-zinc-400" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onPreview(file)}
        className="group flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* List Thumbnail */}
          <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0 relative">
            {file.type === 'image' && !imageError ? (
              <img
                src={file.url}
                alt={file.name}
                loading="lazy"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : file.type === 'video' ? (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-blue-400">
                <Play className="w-4 h-4 fill-blue-400/40" />
              </div>
            ) : (
              renderFileIcon()
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-200 group-hover:text-white truncate">
              {file.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{formatBytes(file.size)}</span>
              <span>•</span>
              <span className="uppercase text-[10px] bg-zinc-800 px-1.5 py-0.2 rounded font-mono text-zinc-400">
                {file.extension || file.type}
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">{formatDate(file.lastModified)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyUrl}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/60 rounded-lg transition-colors"
            title="Скопировать ссылку"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={downloadFile}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/60 rounded-lg transition-colors"
            title="Скачать файл"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const isMasonry = viewMode === 'masonry';

  // Grid or Masonry Card
  return (
    <div
      onClick={() => onPreview(file)}
      className={`group relative flex flex-col rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-black/40 overflow-hidden select-none ${
        isMasonry ? 'break-inside-avoid mb-4 inline-block w-full' : ''
      }`}
    >
      {/* Media Preview Box */}
      <div
        className={`relative w-full bg-zinc-950/70 overflow-hidden flex items-center justify-center ${
          isMasonry ? 'min-h-[120px]' : 'aspect-square'
        }`}
      >
        {file.type === 'image' && !imageError ? (
          <>
            {!imageLoaded && (
              <div
                className={`w-full bg-zinc-850 animate-pulse flex items-center justify-center ${
                  isMasonry ? 'aspect-[4/3]' : 'h-full'
                }`}
              >
                <span className="text-xs text-zinc-600 font-mono">загрузка...</span>
              </div>
            )}
            <img
              src={file.url}
              alt={file.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full transition-all duration-300 group-hover:scale-[1.02] ${
                isMasonry ? 'h-auto block' : 'h-full object-cover'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
            />
          </>
        ) : file.type === 'video' ? (
          <div
            className={`relative w-full flex items-center justify-center bg-zinc-950 ${
              isMasonry ? 'aspect-video' : 'h-full'
            }`}
          >
            <video
              src={file.url}
              preload="metadata"
              muted
              playsInline
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
            />
            {/* Play Button Overlay */}
            <div className="absolute w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-orange-500 transition-all duration-200 shadow-lg">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        ) : (
          <div
            className={`w-full flex flex-col items-center justify-center p-5 bg-gradient-to-b from-zinc-900 to-zinc-950 ${
              isMasonry ? 'aspect-[4/3]' : 'h-full'
            }`}
          >
            <div className="w-13 h-13 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
              {renderFileIcon()}
            </div>
            <span className="mt-2.5 text-xs font-mono uppercase font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
              {file.extension || file.type}
            </span>
          </div>
        )}

        {/* Extension Badge (top-left) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10 shadow-sm">
            {file.extension || file.type}
          </span>
        </div>

        {/* Hover Action Overlay (top-right) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={copyUrl}
            className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-zinc-300 hover:text-white border border-white/15 transition-all shadow-md"
            title="Скопировать ссылку"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={downloadFile}
            className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-zinc-300 hover:text-white border border-white/15 transition-all shadow-md"
            title="Скачать файл"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Details */}
      <div className="p-3 bg-zinc-900/90 border-t border-zinc-800/60">
        <p className="text-xs sm:text-sm font-medium text-zinc-200 truncate group-hover:text-orange-400 transition-colors" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.lastModified).split(',')[0]}</span>
        </div>
      </div>
    </div>
  );
};
