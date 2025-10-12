'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import Logo from '@/components/Logo';
import { Search, Bell, Menu } from 'lucide-react';
import { HEADER_MENU_ITEMS, type HeaderMenuItem } from '@/constants/header';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import MobileMenu from '@/components/header/MobileMenu';
import { createClient } from '@/lib/supabase/client';
import AuthService from '@/services/auth';

export default function Header({ serverUser }: { serverUser?: User | null }) {
  const [user, setUser] = useState<User | null>(serverUser ?? null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    await AuthService.signOut();
    // Clear local state
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = ROUTES.HOME;
  };

  const items: HeaderMenuItem[] = HEADER_MENU_ITEMS;

  return (
    <header className="app-header w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-[#0b0b0b]/50 backdrop-blur">
      <div className="w-full flex items-center justify-between gap-4 px-0 md:px-4 h-14">
        <div className="flex items-center justify-between md:justify-start gap-3 flex-1">
          {/* Mobile: menu button (visible < md) */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="w-10 h-10"
            >
              <Menu size={18} />
            </Button>
          </div>

          <Logo alt="Logo" href={ROUTES.HOME} className="mr-5" />

          {/* Search: only visible on md and up */}
          <div className="relative w-full max-w-md hidden md:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </span>

            <input
              aria-label="Search"
              placeholder="Tìm kiếm..."
              className="block w-full pl-10 pr-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070707] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        {/* Right: notifications + account - hidden on small screens */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell size={18} className="text-slate-700 dark:text-slate-200" />
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">
              3
            </span>
          </Button>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium">{user.email}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Member</span>
                </div>
                <Button variant="destructive" onClick={handleSignOut}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium">Khách</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Đăng nhập</span>
                </div>
                <Button asChild>
                  <a href={ROUTES.LOGIN}>Đăng nhập</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sheet for menu */}
      <MobileMenu
        items={items}
        user={user}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onSignOut={handleSignOut}
      />
    </header>
  );
}
