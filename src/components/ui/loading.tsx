'use client';

import { LoadingDots } from '@/components/LoadingDots';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
}

export default function Loading(props: LoadingProps) {
  const { className } = props;

  return (
    <div className={cn('p-8 flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-3 text-primary">
        <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
        <LoadingDots />
      </div>
    </div>
  );
}
