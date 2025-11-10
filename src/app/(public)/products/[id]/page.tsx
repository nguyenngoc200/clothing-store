import Link from 'next/link';

const SAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Áo khoác len',
    price: '₫799,000',
    desc: 'Áo khoác len ấm áp, phù hợp mùa đông.',
  },
  {
    id: '2',
    name: 'Quần jeans classic',
    price: '₫599,000',
    desc: 'Quần jeans form classic, dễ phối đồ.',
  },
];

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  const product = SAMPLE_PRODUCTS.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold">Sản phẩm không tìm thấy</h1>
        <p>Không tìm thấy sản phẩm với id: {params.id}</p>
        <Link href="/products">Quay lại danh sách sản phẩm</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <p className="text-lg font-semibold mb-4">Giá: {product.price}</p>
      <p className="mb-6">{product.desc}</p>

      <nav className="flex gap-4">
        <Link href="/products">← Quay lại sản phẩm</Link>
        <Link href="/contact">Liên hệ</Link>
      </nav>
    </div>
  );
}
