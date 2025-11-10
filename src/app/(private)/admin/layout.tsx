import { User } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

import AdminLayoutClient from './AdminLayoutClient';
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
    <AdminLayoutClient user={user} profile={profile}>
      <div className="container mt-5"> {children}</div>
    </AdminLayoutClient>
  );
}
