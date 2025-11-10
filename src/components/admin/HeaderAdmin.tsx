'use client';

import type { User } from '@supabase/supabase-js';
import { useState } from 'react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/constants/routes';
import AccountBlock from '@/components/admin/AccountBlock';

interface HeaderAdminProps {
  user?: User | null;
}

export default function HeaderAdmin(props: HeaderAdminProps) {
  const { user: initialUser } = props;

  const [user, setUser] = useState<User | null>(initialUser ?? null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear local state
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = ROUTES.HOME;
  };

  return (
    <header className="app-header border top-0 z-30 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-[#0b0b0b]/50 backdrop-blur">
      <div className="w-full flex items-center justify-between gap-4 px-4 h-14">
        {/* Left: search */}
        <div className="flex items-center gap-2">
          <SidebarTrigger />
        </div>

        {/* Center spacer */}
        <div className="flex-1" />

        {/* Right: notifications + account */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-slate-700 dark:text-slate-200"
            >
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">
              3
            </span>
          </button>

          <AccountBlock user={user} onSignOut={handleSignOut} logoutDisplay="text" />
        </div>
      </div>
    </header>
  );
}
