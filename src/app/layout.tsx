import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';

import '@/app/globals.css';
import { QueryClientProvider } from '@/components/providers/QueryProvider';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'BUIDOI 2HAND',
  description: 'BUIDOI 2HAND - HIGH HAND',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, spaceGrotesk.variable, 'antialiased min-h-screen')}>
        <QueryClientProvider>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
