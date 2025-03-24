import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorProvider } from '@/components/ErrorHandler';
import MobileOptimizedLayout from '@/components/MobileOptimizedLayout';
import ProgressIndicator from '@/components/ProgressIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '전자서명 서비스',
  description: '간편한 전자서명 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <ErrorProvider>
          <MobileOptimizedLayout>
            <main className="min-h-screen bg-gray-50">
              <ProgressIndicator />
              {children}
            </main>
          </MobileOptimizedLayout>
        </ErrorProvider>
      </body>
    </html>
  );
} 