import {
  ChartColumnStacked,
  LayoutDashboard,
  UsersRound,
  FolderTree,
  Tag,
  Package,
  ShoppingCart,
  SlidersHorizontal,
} from 'lucide-react';

export const SIDEBAR_ITEMS = [
  {
    title: 'Bảng điều khiển',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Khách hàng',
    url: '/admin/customers',
    icon: UsersRound,
  },
  {
    title: 'Danh mục',
    url: '/admin/categories',
    icon: FolderTree,
  },
  {
    title: 'Giảm giá',
    url: '/admin/discounts',
    icon: Tag,
  },
  {
    title: 'Sản phẩm',
    url: '/admin/products',
    icon: Package,
  },

  {
    title: 'Báo cáo',
    url: '/admin/reports',
    icon: ChartColumnStacked,
  },

  {
    title: 'Đơn hàng',
    url: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Cài đặt',
    url: '/admin/settings',
    icon: SlidersHorizontal,
  },
];

export type SidebarItem = (typeof SIDEBAR_ITEMS)[number];
