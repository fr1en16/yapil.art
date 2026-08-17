'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  FileText,
  FileCode,
  FileArchive,
  Music,
  Info,
} from 'lucide-react';
import { R2File } from '@/lib/types';
import { formatBytes, formatDate, triggerFileDownload } from '@/lib/utils';

interface MediaViewerModalProps {
  files: R2File[];
  activeFile: R2File | null;
  onClose: () => void;
  onSelectFile: (file: R2File) => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  files,
  activeFile,
  onClose,
  onSelectFile,
}) => {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = activeFile
    ? files.findIndex((f) => f.key === activeFile.key)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < files.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      onSelectFile(files[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, files, onSelectFile]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      onSelectFile(files[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, files, onSelectFile]);

  // Keyboard navigation
  useEffect(() => {
    if (!activeFile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(z + 0.25, 4));
      } else if (e.key === '-') {
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (e.key === '0') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, handlePrev, handleNext, onClose]);

  // Reset zoom on file change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [activeFile?.key]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (activeFile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeFile]);

  if (!activeFile) return null;

  const copyLink = () => {
    if (!activeFile.url) return;
    navigator.clipboard.writeText(activeFile.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadActiveFile = () => {
    if (!activeFile.url) return;
    triggerFileDownload(activeFile.url, activeFile.name, activeFile.key);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handling for zoomed image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/60 backdrop-blur-md border-b border-zinc-800/80 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Counter & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-xs font-mono text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg shrink-0">
            {currentIndex + 1} / {files.length}
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-zinc-100 truncate max-w-[200px] sm:max-w-md">
            {activeFile.name}
          </h2>
          <span className="hidden sm:inline-block text-xs font-mono uppercase bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
            {activeFile.extension || activeFile.type}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls for images */}
          {activeFile.type === 'image' && (
            <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 mr-2">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Уменьшить (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Сбросить масштаб (0)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Увеличить (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-xl border transition-all ${
              showInfo
                ? 'bg-orange-500 text-white border-orange-400'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title="Информация о файле"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Copy Link */}
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-all"
            title="Скопировать ссылку"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Копировать</span>
              </>
            )}
          </button>

          {/* Download */}
          <button
            onClick={downloadActiveFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all shadow-md shadow-orange-950/40"
            title="Скачать файл"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Скачать</span>
          </button>

          {/* Open in new tab */}
          <a
            href={activeFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all"
            title="Открыть в новой вкладке"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all ml-1"
            title="Закрыть (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Navigation Chevron Left */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-all shadow-xl"
            title="Предыдущий файл (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Navigation Chevron Right */}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-all shadow-xl"
            title="Следующий файл (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Media Container */}
        <div
          ref={containerRef}
          className="relative max-w-full max-h-full flex items-center justify-center select-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {activeFile.type === 'image' ? (
            <img
              src={activeFile.url}
              alt={activeFile.name}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                maxHeight: 'calc(100vh - 160px)',
                maxWidth: 'calc(100vw - 80px)',
              }}
              className="object-contain rounded-lg shadow-2xl pointer-events-auto"
              draggable={false}
            />
          ) : activeFile.type === 'video' ? (
            <div className="w-full max-w-4xl max-h-[80vh] flex items-center justify-center">
              <video
                src={activeFile.url}
                controls
                autoPlay
                playsInline
                className="max-h-[calc(100vh-180px)] max-w-full rounded-2xl shadow-2xl bg-black"
              />
            </div>
          ) : activeFile.type === 'audio' ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl flex flex-col items-center gap-6 max-w-md w-full">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg">
                <Music className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg text-white">{activeFile.name}</p>
                <p className="text-xs text-zinc-400 mt-1">{formatBytes(activeFile.size)}</p>
              </div>
              <audio src={activeFile.url} controls autoPlay className="w-full" />
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl flex flex-col items-center text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-orange-400 mb-4 shadow-lg">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold text-white break-all mb-1">{activeFile.name}</h3>
              <p className="text-xs text-zinc-400 mb-6">{formatBytes(activeFile.size)}</p>
              <div className="flex gap-3">
                <button
                  onClick={downloadActiveFile}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-orange-950/50"
                >
                  <Download className="w-4 h-4" />
                  Скачать файл
                </button>
                <a
                  href={activeFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Открыть
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info Slide-Over Box */}
        {showInfo && (
          <div
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-80 p-4 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 shadow-2xl text-xs z-40 animate-in slide-in-from-bottom-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-orange-500" />
                Свойства файла
              </span>
              <button
                onClick={() => setShowInfo(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Имя:</span>
                <span className="font-mono text-zinc-200 truncate max-w-[180px]" title={activeFile.name}>
                  {activeFile.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Размер:</span>
                <span className="font-mono text-zinc-200">{formatBytes(activeFile.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Тип:</span>
                <span className="font-mono uppercase text-orange-400">
                  {activeFile.extension || activeFile.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Дата:</span>
                <span className="font-mono text-zinc-300">{formatDate(activeFile.lastModified)}</span>
              </div>
              <div className="flex flex-col gap-1 pt-1 border-t border-zinc-800">
                <span className="text-zinc-500">R2 Key:</span>
                <span className="font-mono text-[10px] text-zinc-400 break-all bg-black/40 p-1.5 rounded">
                  {activeFile.key}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div
        className="px-6 py-2.5 bg-black/60 backdrop-blur-md border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hidden sm:flex items-center gap-4">
          <span>Навигация: <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">→</kbd></span>
          <span>Закрыть: <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">Esc</kbd></span>
          {activeFile.type === 'image' && (
            <span>Масштаб: <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">+</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">-</kbd></span>
          )}
        </div>
        <div className="text-zinc-400 text-right w-full sm:w-auto">
          {activeFile.key}
        </div>
      </div>
    </div>
  );
};
