import Link from 'next/link';

const SAMPLE_PRODUCTS = [
  { id: '1', name: 'Áo khoác len', price: '₫799,000' },
  { id: '2', name: 'Quần jeans classic', price: '₫599,000' },
];

export default function Page() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Sản phẩm</h1>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_PRODUCTS.map((p) => (
          <li key={p.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold">
              <Link href={`/products/${p.id}`}>{p.name}</Link>
            </h2>
            <p className="text-sm text-muted-foreground">Giá: {p.price}</p>
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
