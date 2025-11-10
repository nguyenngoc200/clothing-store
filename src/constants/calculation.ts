import type { Category, Item } from '@/types/calculation';

export const CATEGORIES: Category[] = [
  { key: 'advertising', label: 'Quảng cáo' },
  { key: 'packaging', label: 'Đóng gói' },
  { key: 'shipping', label: 'Vận chuyển' },
  { key: 'personnel', label: 'Nhân sự' },
  { key: 'rent', label: 'Mặt bằng' },
  { key: 'freeship', label: 'Freeship' },
];

export const emptyItem = (): Item => ({
  label: '',
  amount: undefined,
});
