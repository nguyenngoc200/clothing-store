import Link from 'next/link';

const SAMPLE_POSTS = [
  {
    slug: 'ra-mat-bo-suu-tap-moi',
    title: 'Ra mắt bộ sưu tập mới',
    content: 'Chi tiết bài viết về bộ sưu tập thu đông 2025...',
  },
  {
    slug: 'bi-quyet-chon-size',
    title: 'Bí quyết chọn size',
    content: 'Chi tiết hướng dẫn chọn size cho từng vóc dáng...',
  },
];

type Props = { params: { slug: string } };

export default function Page({ params }: Props) {
  const post = SAMPLE_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold">Bài viết không tìm thấy</h1>
        <p>Không tìm thấy bài theo đường dẫn: {params.slug}</p>
        <Link href="/posts">Quay lại danh sách bài viết</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <article className="prose max-w-none mb-6">{post.content}</article>
      <Link href="/posts">← Quay lại</Link>
    </div>
  );
}
