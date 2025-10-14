'use client';

import React from 'react';

export default function ErrorMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={className} role="alert">
      <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded">{message}</div>
    </div>
  );
}
