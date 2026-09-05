import urls from '../data/media-urls.json';
import posters from '../data/video-posters.json';

/** Resolve a build-time media path only after its R2 upload has been verified. */
export function mediaUrl(source: string): string {
  const url = (urls as Record<string, string>)[source];
  if (!url) throw new Error(`Media has not been uploaded to R2: ${source}`);
  return url;
}

export function videoPoster(video: string): string {
  const poster = (posters as Record<string, string>)[video];
  if (!poster) throw new Error(`Video poster has not been uploaded to R2: ${video}`);
  return poster;
}
