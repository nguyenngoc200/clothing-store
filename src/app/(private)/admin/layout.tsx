import { User } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

import HeaderAdmin from '@/components/admin/HeaderAdmin';
import Sidebar from '@/components/sidebar/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getUserServer } from '@/lib/supabase/getUserServer';
import { EInternalRole } from '@/types/ERole';
import { TProfile } from '@/types/TProfile';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getUserServer();

  // only super-admins can access this layout
  const profileRoleRaw = profile && (profile as TProfile).internal_staff_role;

  const userRole = (user as User | undefined)?.role;

  const isSuperAdmin =
    profileRoleRaw === EInternalRole.SuperAdmin || userRole === EInternalRole.SuperAdmin;

  if (!user || !isSuperAdmin) {
    return notFound();
  }

  return (
    <div className="flex flex-row">
      <SidebarProvider>
        <Sidebar user={user} />

        <div className="flex-1 min-h-screen flex flex-col">
          <HeaderAdmin user={user} />
          <main className="flex-1 p-0 py-4 sm:py-0 sm:p-6">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
