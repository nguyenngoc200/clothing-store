'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingDots } from '../LoadingDots';

export default function Loading({ className }: { className?: string }) {
  return (
    <div className={cn('p-8 flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-3 text-primary">
        <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
        <LoadingDots />
      </div>
    </div>
  );
}
