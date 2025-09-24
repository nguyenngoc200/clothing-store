import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">Home</Link>
          <nav className="flex items-center gap-4">
            <Link href="/about">About</Link>
            <Link href="/login">Login</Link>
          </nav>
        </div>
      </header>

      <main className="py-8 px-6 max-w-6xl mx-auto">{children}</main>

      <footer className="border-t py-6 mt-12">
        <div className="max-w-6xl mx-auto text-sm text-muted-foreground">© Quinn Store 2025</div>
      </footer>
    </div>
  );
}
