import Header from '@/components/header/Header';
import { getUserServer } from '@/lib/supabase/getUserServer';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user: serverUser } = await getUserServer();

  return (
    <div className="min-h-screen container">
      {/* Header is a client component but accepts serverUser as initial state */}
      <Header serverUser={serverUser} />

      <main>{children}</main>

      <footer className="border-t py-6 mt-12">
        <div className="max-w-6xl mx-auto text-sm text-muted-foreground">
          © Quinn & BUIDOI 2025
        </div>
      </footer>
    </div>
  );
}
