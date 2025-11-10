'use client';

import { User } from '@supabase/supabase-js';
import { ReactNode } from 'react';

import HeaderAdmin from '@/components/admin/HeaderAdmin';
import Sidebar from '@/components/sidebar/Sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { TProfile } from '@/types/TProfile';

interface AdminLayoutClientProps {
  user: User;
  profile: TProfile | null;
  children: ReactNode;
}

function AdminLayoutContent(props: AdminLayoutClientProps) {
  const { user, children } = props;
  const { state } = useSidebar();
  const isExpanded = state === 'expanded';

  return (
    <div
      className={cn(
        'grid w-full transition-all duration-300',
        isExpanded
          ? 'grid-cols-[1fr] md:grid-cols-[254px_1fr]'
          : 'grid-cols-[1fr] md:grid-cols-[48px_1fr]',
      )}
    >
      <Sidebar user={user} />

      <div className="min-w-0">
        <HeaderAdmin user={user} />

        <main className="overflow-auto min-w-0">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayoutClient({ user, profile, children }: AdminLayoutClientProps) {
  return (
    <div className="min-h-screen w-full">
      <SidebarProvider>
        <AdminLayoutContent user={user} profile={profile}>
          {children}
        </AdminLayoutContent>
      </SidebarProvider>
    </div>
  );
}
