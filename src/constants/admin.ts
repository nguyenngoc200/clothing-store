export const ADMIN_MODULES = [
  { name: 'Khách hàng', href: '/admin/customers', icon: '🛍️', description: 'Quản lý khách hàng' },
  {
    name: 'Danh mục',
    href: '/admin/categories',
    icon: '📁',
    description: 'Quản lý danh mục sản phẩm',
  },
  {
    name: 'Giảm giá',
    href: '/admin/discounts',
    icon: '🎫',
    description: 'Quản lý mã giảm giá',
  },
  { name: 'Sản phẩm', href: '/admin/products', icon: '📦', description: 'Quản lý sản phẩm' },
  {
    name: 'Giảm giá sản phẩm',
    href: '/admin/product-discounts',
    icon: '🔗',
    description: 'Quản lý quan hệ sản phẩm - giảm giá',
  },
  { name: 'Đơn hàng', href: '/admin/orders', icon: '🛒', description: 'Quản lý đơn hàng' },
  {
    name: 'Sản phẩm trong đơn',
    href: '/admin/order-products',
    icon: '📋',
    description: 'Quản lý các mục trong đơn hàng',
  },
];

export type AdminModule = (typeof ADMIN_MODULES)[number];
