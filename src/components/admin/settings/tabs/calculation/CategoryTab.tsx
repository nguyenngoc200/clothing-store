import ItemRow from '@/components/admin/settings/tabs/calculation/ItemRow';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { LoadingDots } from '@/components/LoadingDots';
import type { CalcForm, Category, Item } from '@/types/calculation';

type CategoryTabProps = {
  cat: Category;
  items: Item[];
  onAdd: (category: keyof CalcForm) => void;
  onDelete: (category: keyof CalcForm, index: number) => void;
  loading?: boolean;
};

export function CategoryTab(props: CategoryTabProps) {
  const { cat, items, onAdd, onDelete, loading = false } = props;

  return (
    <TabsContent key={cat.key} value={cat.key} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{cat?.label}</h3>

        <Button
          type="button"
          onClick={() => onAdd(cat?.key)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          disabled={loading}
        >
          Thêm
        </Button>
      </div>

      <div className="space-y-3 relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
            <LoadingDots />
          </div>
        )}

        {items?.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">Chưa có mục nào</div>
        )}

        {items?.map((item: Item, idx: number) => (
          <ItemRow key={idx} item={item} idx={idx} category={cat?.key} onDelete={onDelete} />
        ))}
      </div>
    </TabsContent>
  );
}

export default CategoryTab;
