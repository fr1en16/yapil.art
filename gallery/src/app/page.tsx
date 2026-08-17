'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Toolbar } from '@/components/Toolbar';
import { FolderCard } from '@/components/FolderCard';
import { MediaCard } from '@/components/MediaCard';
import { MediaViewerModal } from '@/components/MediaViewerModal';
import { EmptyState } from '@/components/EmptyState';
import { R2File, FilesApiResponse, SortField, SortOrder, ViewMode } from '@/lib/types';
import { cleanPrefix } from '@/lib/utils';

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefix from URL query params
  const prefixParam = searchParams.get('prefix') || '';
  const currentPrefix = cleanPrefix(prefixParam);

  // States
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<R2File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI filters & controls - Default to Masonry
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');

  // Modal active file
  const [activeFile, setActiveFile] = useState<R2File | null>(null);

  // Auth state
  const [authRequired, setAuthRequired] = useState(false);

  // Check auth requirement on mount
  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        setAuthRequired(Boolean(data.authRequired));
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch {}
  };

  // Fetch files when prefix changes
  const fetchFiles = useCallback(async (prefixToFetch: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/files?prefix=${encodeURIComponent(prefixToFetch)}`, {
        cache: 'no-store',
      });
      const data: FilesApiResponse = await res.json();

      if (!res.ok || data.error) {
        if (data.isConfigured === false) {
          setIsConfigured(false);
        } else {
          setErrorMessage(data.error || 'Ошибка загрузки файлов');
        }
      } else {
        setIsConfigured(true);
        setFolders(data.folders || []);
        setFiles(data.files || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Сетевая ошибка';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles(currentPrefix);
    setSearchQuery('');
    setActiveFile(null);
  }, [currentPrefix, fetchFiles]);

  // Navigate to folder
  const navigateToPrefix = (newPrefix: string) => {
    const cleaned = cleanPrefix(newPrefix);
    if (cleaned) {
      router.push(`/?prefix=${encodeURIComponent(cleaned)}`);
    } else {
      router.push('/');
    }
  };

  // Filter and sort items
  const filteredFolders = useMemo(() => {
    let result = [...folders];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => f.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const cmp = a.localeCompare(b);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [folders, searchQuery, sortOrder]);

  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.extension.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === 'date') {
        cmp = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
      } else if (sortField === 'size') {
        cmp = a.size - b.size;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [files, searchQuery, sortField, sortOrder]);

  const totalSize = useMemo(() => {
    return files.reduce((acc, file) => acc + (file.size || 0), 0);
  }, [files]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      {/* Header */}
      <Header
        currentPrefix={currentPrefix}
        onNavigate={navigateToPrefix}
        authRequired={authRequired}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Unconfigured R2 Credentials Warning */}
        {!isConfigured && <EmptyState type="unconfigured" />}

        {/* Normal Loaded Content */}
        {isConfigured && (
          <>
            {/* Toolbar */}
            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortField(field);
                setSortOrder(order);
              }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              folderCount={filteredFolders.length}
              fileCount={filteredFiles.length}
              totalSize={totalSize}
              isLoading={isLoading}
              onRefresh={() => fetchFiles(currentPrefix)}
            />

            {/* Error state */}
            {errorMessage && (
              <EmptyState
                type="error"
                errorMessage={errorMessage}
                onNavigateRoot={() => navigateToPrefix('')}
              />
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <div className="py-8">
                {viewMode === 'masonry' ? (
                  <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-2xl bg-zinc-900/80 animate-pulse border border-zinc-800/60 break-inside-avoid ${
                          i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-80'
                        }`}
                      />
                    ))}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-2xl bg-zinc-900/80 animate-pulse border border-zinc-800/60"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl bg-zinc-900/80 animate-pulse border border-zinc-800/60"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content Display */}
            {!isLoading && !errorMessage && (
              <div className="py-6">
                {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                  searchQuery ? (
                    <EmptyState
                      type="search_empty"
                      searchQuery={searchQuery}
                      onClearSearch={() => setSearchQuery('')}
                    />
                  ) : (
                    <EmptyState
                      type="empty"
                      onNavigateRoot={() => navigateToPrefix('')}
                    />
                  )
                ) : (
                  <div className="space-y-6">
                    {/* Folders Section */}
                    {filteredFolders.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Папки ({filteredFolders.length})
                          </span>
                        </div>
                        <div
                          className={
                            viewMode === 'list'
                              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'
                              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'
                          }
                        >
                          {filteredFolders.map((folderPrefix) => (
                            <FolderCard
                              key={folderPrefix}
                              prefix={folderPrefix}
                              onClick={() => navigateToPrefix(folderPrefix)}
                              viewMode={viewMode === 'list' ? 'list' : 'grid'}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files Section */}
                    {filteredFiles.length > 0 && (
                      <div>
                        {filteredFolders.length > 0 && (
                          <div className="flex items-center gap-2 mb-3 pt-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                              Файлы ({filteredFiles.length})
                            </span>
                          </div>
                        )}
                        {viewMode === 'masonry' ? (
                          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4">
                            {filteredFiles.map((file) => (
                              <MediaCard
                                key={file.key}
                                file={file}
                                onPreview={(f) => setActiveFile(f)}
                                viewMode="masonry"
                              />
                            ))}
                          </div>
                        ) : viewMode === 'grid' ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredFiles.map((file) => (
                              <MediaCard
                                key={file.key}
                                file={file}
                                onPreview={(f) => setActiveFile(f)}
                                viewMode="grid"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredFiles.map((file) => (
                              <MediaCard
                                key={file.key}
                                file={file}
                                onPreview={(f) => setActiveFile(f)}
                                viewMode="list"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Media Lightbox Viewer */}
      <MediaViewerModal
        files={filteredFiles}
        activeFile={activeFile}
        onClose={() => setActiveFile(null)}
        onSelectFile={(f) => setActiveFile(f)}
      />
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-sm">
          Загрузка галереи...
        </div>
      }
    >
      <GalleryContent />
    </Suspense>
  );
}
