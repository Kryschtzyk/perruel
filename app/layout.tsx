import './globals.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perruel Schnitzeljagd',
  description: '2‑stündige Schnitzeljagd mit Live‑Karte und Admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
