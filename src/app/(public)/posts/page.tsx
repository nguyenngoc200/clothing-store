import Link from 'next/link';

const SAMPLE_POSTS = [
  {
    slug: 'ra-mat-bo-suu-tap-moi',
    title: 'Ra mắt bộ sưu tập mới',
    excerpt: 'Khám phá bộ sưu tập thu đông 2025 của chúng tôi.',
  },
  {
    slug: 'bi-quyet-chon-size',
    title: 'Bí quyết chọn size',
    excerpt: 'Hướng dẫn chọn size phù hợp cho từng vóc dáng.',
  },
];

export default function Page() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Bài viết mới nhất</h1>

      <ul className="space-y-4">
        {SAMPLE_POSTS.map((p) => (
          <li key={p.slug} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">
              <Link href={`/posts/${p.slug}`}>{p.title}</Link>
            </h2>
            <p className="text-sm text-muted-foreground">{p.excerpt}</p>
          </li>
        ))}
      </ul>

      <nav className="mt-8 flex gap-4">
        <Link href="/">Trang chủ</Link>
        <Link href="/about">Về chúng tôi</Link>
      </nav>
    </div>
  );
}
