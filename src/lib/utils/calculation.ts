/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CalcForm, Item } from '@/types/calculation';

export class CalculationUtils {
  /**
   * Normalize a DB payload (arbitrary record) into the CalcForm shape used by the UI.
   */
  static normalizePayload(payload: Record<string, unknown> | undefined): CalcForm {
    if (!payload) return {};

    const norm = (key: string): Item[] => {
      const val = payload[key];
      if (Array.isArray(val)) {
        return (val as unknown[]).map((v) => {
          if (typeof v === 'number') return { label: 'Default', type: 'amount', amount: v } as Item;

          const obj = v as Record<string, unknown> | undefined;
          const label = (obj?.label as string) ?? '';
          // coerce numeric-like strings to numbers as a convenience
          const parseNumber = (x: unknown): number | undefined => {
            if (typeof x === 'number') return x;
            if (typeof x === 'string') {
              const n = parseFloat(x);
              return Number.isFinite(n) ? n : undefined;
            }
            return undefined;
          };

          // Prefer explicit amount. If only percent exists and it's numeric we
          // cannot reliably convert it to an absolute VND amount here because
          // that depends on a product price. Keep percent parsing for
          // backward-compatibility but store only amount in the Item shape.
          const amount = parseNumber(obj?.amount);
          // If amount missing but percent present, leave amount undefined.
          return { label, amount } as Item;
        });
      }

      if (typeof val === 'number') return [{ label: 'Default', amount: val }];
      return [];
    };

    return {
      advertising: norm('advertising'),
      packaging: norm('packaging'),
      shipping: norm('shipping'),
      personnel: norm('personnel'),
      rent: norm('rent'),
      freeship: norm('freeship'),
    };
  }

  /**
   * Build a plain payload for persistence from the CalcForm values.
   */
  static buildPayload(values: CalcForm): Record<string, unknown> {
    const map = (arr: Item[] = []) =>
      arr.map((i) => ({
        label: i.label ?? '',
        // persist only absolute amounts; percent removed
        amount: typeof i.amount === 'number' ? i.amount : null,
      }));

    return {
      advertising: map(values.advertising ?? []),
      packaging: map(values.packaging ?? []),
      shipping: map(values.shipping ?? []),
      personnel: map(values.personnel ?? []),
      rent: map(values.rent ?? []),
      freeship: map(values.freeship ?? []),
    };
  }

  /**
   * Helpers to operate on field arrays used in the CalculationSettings UI.
   * fieldsMap should be an object mapping CalcForm keys to react-hook-form
   * field array helpers (the value returned by useFieldArray).
   */
  static getFieldsForCategory(fieldsMap: Record<string, any>, cat: keyof CalcForm) {
    return fieldsMap[cat as string] ?? fieldsMap['advertising'];
  }

  static openAdd(
    setTempItem: (v: Item) => void,
    setAddDialog: (s: any) => void,
    emptyItemFn: () => Item,
  ) {
    setTempItem(emptyItemFn());
    setAddDialog({ open: true, category: null });
  }

  static confirmAdd(
    fieldsMap: Record<string, any>,
    category: keyof CalcForm | null,
    tempItem: Item,
    setAddDialog: (s: any) => void,
    setTempItem: (v: Item) => void,
    emptyItemFn: () => Item,
  ) {
    if (!category) return;
    const fields = CalculationUtils.getFieldsForCategory(fieldsMap, category);

    // Remove empty items
    const currentItems = fields.fields;
    for (let i = currentItems.length - 1; i >= 0; i--) {
      const item = currentItems[i] as Item;
      if (!item.label && (item.amount === undefined || item.amount === null)) {
        fields.remove(i);
      }
    }

    fields.append(tempItem);
    setAddDialog({ open: false, category: null });
    setTempItem(emptyItemFn());
  }

  static openDelete(setDeleteDialog: (s: any) => void, category: keyof CalcForm, index: number) {
    setDeleteDialog({ open: true, category, index });
  }

  static confirmDelete(
    fieldsMap: Record<string, any>,
    deleteDialog: { open: boolean; category: keyof CalcForm | null; index: number | null },
    setDeleteDialog: (s: any) => void,
  ) {
    if (deleteDialog.category === null || deleteDialog.index === null) return;
    const fields = CalculationUtils.getFieldsForCategory(fieldsMap, deleteDialog.category);
    fields.remove(deleteDialog.index);
    setDeleteDialog({ open: false, category: null, index: null });
  }
}

export default CalculationUtils;
