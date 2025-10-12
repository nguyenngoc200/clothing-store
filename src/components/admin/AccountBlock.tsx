'use client';

import type { User } from '@supabase/supabase-js';
import React from 'react';
import { Power } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccountBlockProps {
  user?: User | null;
  onSignOut?: () => Promise<void> | void;
  /**
   * Controls how the logout control is displayed:
   * - 'auto' (default): icon on mobile, text on md+
   * - 'icon': always show icon
   * - 'text': always show text
   */
  logoutDisplay?: 'auto' | 'icon' | 'text';
  className?: string;
}

export default function AccountBlock({
  user,
  onSignOut,
  logoutDisplay = 'auto',
  className,
}: AccountBlockProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        logoutDisplay === 'text' && 'hidden md:flex',
        logoutDisplay === 'icon' && 'flex md:hidden',
        className,
      )}
    >
      {user ? (
        <>
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">{user.email}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Member</span>
          </div>
          <div className="flex items-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={onSignOut}
              aria-label="Đăng xuất"
              className="p-2 md:px-3 md:py-1"
            >
              {logoutDisplay === 'icon' ? (
                <Power className="w-4 h-4" />
              ) : logoutDisplay === 'text' ? (
                <span>Đăng xuất</span>
              ) : (
                // auto: icon on mobile, text on md+
                <>
                  <Power className="w-4 h-4 md:hidden" />
                  <span className="hidden md:inline">Đăng xuất</span>
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">Khách</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Đăng nhập</span>
          </div>
          <a href="/login" className="px-3 py-1 rounded bg-sky-600 text-white text-sm font-medium">
            Đăng nhập
          </a>
        </>
      )}
    </div>
  );
}
