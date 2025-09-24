import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row">
      <SidebarProvider>
        <Sidebar />

        <div className="flex-1 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
