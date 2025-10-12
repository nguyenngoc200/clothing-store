import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';

import '@/app/globals.css';
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
  title: 'Clothing Store',
  description: 'Clothing store demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, spaceGrotesk.variable, 'antialiased min-h-screen')}>
        {children}
      </body>
    </html>
  );
}
