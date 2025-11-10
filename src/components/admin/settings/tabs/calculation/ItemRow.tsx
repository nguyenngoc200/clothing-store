import { Button } from '@/components/ui/button';
import type { CalcForm, Item } from '@/types/calculation';

type ItemRowProps = {
  item: Item;
  idx: number;
  category: keyof CalcForm;
  onDelete: (category: keyof CalcForm, index: number) => void;
};

export default function ItemRow(props: ItemRowProps) {
  const { item, idx, category, onDelete } = props;

  return (
    <div
      key={idx}
      className="flex flex-col sm:flex-row gap-4 p-3 border rounded bg-gray-50 items-center"
    >
      <div className="flex-1 text-sm">
        <span className="font-medium">{item.label || '(Không có ghi chú)'}</span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 font-semibold">
          {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(item.amount || 0)}₫
        </span>
      </div>

      <Button
        type="button"
        onClick={() => onDelete(category, idx)}
        className="text-white px-3 py-1 rounded bg-destructive hover:bg-destructive/90"
      >
        Xóa
      </Button>
    </div>
  );
}
