import { FileType } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IMAGE_EXTENSIONS = new Set(['webp', 'jpg', 'jpeg', 'png', 'svg', 'gif', 'avif', 'bmp', 'ico', 'tiff']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'mkv', 'avi', 'ogv', 'm4v']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a']);
const PDF_EXTENSIONS = new Set(['pdf']);
const ARCHIVE_EXTENSIONS = new Set(['zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'tgz']);
const CODE_EXTENSIONS = new Set(['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'scss', 'py', 'sh', 'yaml', 'yml', 'md', 'sql']);
const DOCUMENT_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf']);

export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) return '';
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

export function detectFileType(filename: string): FileType {
  const ext = getFileExtension(filename);
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (AUDIO_EXTENSIONS.has(ext)) return 'audio';
  if (PDF_EXTENSIONS.has(ext)) return 'pdf';
  if (ARCHIVE_EXTENSIONS.has(ext)) return 'archive';
  if (CODE_EXTENSIONS.has(ext)) return 'code';
  if (DOCUMENT_EXTENSIONS.has(ext)) return 'document';
  return 'other';
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function cleanPrefix(prefix: string): string {
  if (!prefix) return '';
  // Ensure trailing slash for directory prefixes
  let cleaned = prefix.replace(/^\/+/, '');
  if (cleaned.length > 0 && !cleaned.endsWith('/')) {
    cleaned += '/';
  }
  return cleaned;
}

export function getFolderName(prefix: string): string {
  const parts = prefix.replace(/\/$/, '').split('/');
  return parts[parts.length - 1] || prefix;
}

export async function triggerFileDownload(url: string, filename: string, key?: string): Promise<void> {
  // If we have an R2 key, the fastest and most reliable direct browser download is /api/download?key=...
  if (key) {
    const downloadUrl = `/api/download?key=${encodeURIComponent(key)}&name=${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch {
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
