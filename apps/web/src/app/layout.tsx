import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
export const metadata: Metadata = {
  title: {
    default: 'ShopElite — Premium E-Commerce',
    template: '%s | ShopElite',
  },
  description:
    'Discover premium products at unbeatable prices. High-performance headless e-commerce platform.',
  keywords: ['ecommerce', 'shopping', 'electronics', 'premium'],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 72px)', paddingTop: '32px', paddingBottom: '64px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
