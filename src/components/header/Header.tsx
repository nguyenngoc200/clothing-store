'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import MobileMenu from '@/components/header/MobileMenu';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/client';
import AuthService from '@/services/auth.service';
import { Bell, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
// navigation links will replace the search input

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

  return (
    <header className="app-header container w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-[#0b0b0b]/50 backdrop-blur">
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

          {/* Nav: visible on md and up (replaces search) */}
          <div className="w-full max-w-md hidden md:block">
            <nav className="flex items-center gap-4">
              <Link href="/about" className="text-sm font-medium hover:underline">
                Về chúng tôi
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:underline">
                Liên hệ
              </Link>
              <Link href="/posts" className="text-sm font-medium hover:underline">
                Bài viết
              </Link>
              <Link href="/products" className="text-sm font-medium hover:underline">
                Sản phẩm
              </Link>
            </nav>
          </div>
        </div>

        {/* Right: notifications + account - hidden on small screens */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell size={18} className="text-slate-700 dark:text-slate-200" />
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">
              0
            </span>
          </Button>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Avatar + dropdown */}
                <div className="flex items-center gap-2">
                  {/* Use Radix dropdown component already available */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
                        {user.user_metadata?.avatar_url ? (
                          <Image
                            src={user.user_metadata.avatar_url}
                            alt={user.email || 'avatar'}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700">
                            {user.email ? user.email.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <div className="px-2 py-2">
                        <div className="mb-2">
                          <div className="text-sm font-medium">{user.email}</div>
                          <div className="text-xs text-slate-500">Member</div>
                        </div>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="block w-full cursor-pointer">
                            Go admin
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onSelect={handleSignOut}
                          variant="destructive"
                          className="cursor-pointer"
                        >
                          Đăng xuất
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium">Khách</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Đăng nhập</span>
                </div>
                <Button asChild>
                  <Link href={ROUTES.LOGIN}>Đăng nhập</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sheet for menu */}
      <MobileMenu
        user={user}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onSignOut={handleSignOut}
      />
    </header>
  );
}
