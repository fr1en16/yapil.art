import { env } from 'cloudflare:workers';

export function getDb() {
  return (env as any)?.DB;
}

export function getCfEnv(key: string): string | undefined {
  return (
    (env as any)?.[key] ||
    (typeof process !== 'undefined' ? (process.env as any)?.[key] : undefined)
  );
}
