import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'GNK Otel Platformu',
  description: "Erdem'in Seçtiği En İyi Oteller",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-sans">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}