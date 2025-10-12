import { cn } from '@/lib/utils';
import Image from 'next/image';

import Link from 'next/link';

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  href?: string | null;
};

export default function Logo({
  width = 40,
  height = 40,
  className = '',
  alt = 'Logo',
  href = '/',
}: LogoProps) {
  const img = (
    <Image
      src="/logo.png"
      width={width}
      height={height}
      className={cn('min-w-10 min-h-10', className)}
      alt={alt}
    />
  );
  if (href) return <Link href={href}>{img}</Link>;
  return img;
}
