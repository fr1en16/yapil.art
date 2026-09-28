/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />
/// <reference types="@astrojs/cloudflare" />

type D1Database = import('@cloudflare/workers-types').D1Database;

type ENV = {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  CUSTOM_WEBHOOK_URL?: string;
  ANALYTICS_USERNAME?: string;
  ANALYTICS_PASSWORD?: string;
};

declare namespace App {
  interface Locals extends import('@astrojs/cloudflare').Runtime<ENV> {}
}

declare module 'cloudflare:workers' {
  export const env: {
    DB?: D1Database;
    [key: string]: any;
  };
}
