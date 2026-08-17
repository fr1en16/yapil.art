import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Cloudflare R2 Gallery',
  description: 'Легковесная веб-галерея для Cloudflare R2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`dark ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 font-sans">{children}</body>
    </html>
  );
}
