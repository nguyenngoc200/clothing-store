'use client';

import type { User } from '@supabase/supabase-js';

import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader } from '@/components/ui/sheet';
import { ROUTES } from '@/constants/routes';
import { Power } from 'lucide-react';
import Link from 'next/link';

type Props = {
  user: User | null;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onSignOut: () => Promise<void>;
};

export default function MobileMenu({ user, menuOpen, setMenuOpen, onSignOut }: Props) {
  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="left" className="p-0 gap-0">
        <SheetHeader className="p-0 border-b border-foreground/20 mx-4">
          <div className="flex items-center justify-center w-full">
            <Logo alt="Logo" href={ROUTES.HOME} width={60} height={60} />
          </div>
        </SheetHeader>

        <div className="p-4 flex flex-col h-full">
          <nav className="flex flex-col gap-2">
            {/* Mirror desktop primary links */}
            <Link
              href="/about"
              className="rounded-md p-3 text-base hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Về chúng tôi
            </Link>
            <Link
              href="/contact"
              className="rounded-md p-3 text-base hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Liên hệ
            </Link>
            <Link
              href="/posts"
              className="rounded-md p-3 text-base hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Bài viết
            </Link>
            <Link
              href="/products"
              className="rounded-md p-3 text-base hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Sản phẩm
            </Link>
          </nav>

          <SheetFooter className="px-2 py-4 border-t border-foreground/20">
            {user ? (
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.email}</span>
                  <span className="text-xs text-slate-500">Member</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setMenuOpen(false);
                      onSignOut();
                    }}
                    aria-label="Đăng xuất"
                    className="p-2"
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <a
                href={ROUTES.LOGIN}
                className="block w-full text-center rounded-md p-2 bg-primary text-white"
                onClick={() => setMenuOpen(false)}
              >
                Đăng nhập
              </a>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
