import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { DynamicFormField } from '@/components/DynamicFormField';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CATEGORIES } from '@/constants/calculation';
import type { Item } from '@/types/calculation';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: string | null;
  tempItem: Item;
  setTempItem: (item: Item) => void;
  onConfirm: (item: Item) => void;
  onCancel: () => void;
};

export default function AddItemDialog({
  open,
  onOpenChange,
  category,
  tempItem,
  setTempItem,
  onConfirm,
  onCancel,
}: Props) {
  const form = useForm<Item>({ defaultValues: tempItem });

  // sync external tempItem -> internal form
  useEffect(() => {
    // Only reset the form when the incoming tempItem actually differs from the
    // current form values to avoid an update loop (parent -> reset -> watch -> setTempItem -> parent)
    try {
      const current = form.getValues();
      if (JSON.stringify(current) !== JSON.stringify(tempItem)) {
        form.reset(tempItem);
      }
    } catch {
      // fallback to always reset if getValues fails for some reason
      form.reset(tempItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempItem]);

  // We avoid continuously syncing form -> tempItem to prevent update loops.
  // Changes are propagated on submit only.

  const submit = form.handleSubmit((data) => {
    // propagate the confirmed data directly to the parent to avoid stale state
    setTempItem(data);
    onConfirm(data);
  });

  // percent-based items removed — only amount is supported now

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm mục mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cho mục mới trong danh mục{' '}
            {CATEGORIES.find((c) => c.key === category)?.label}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4 py-4">
            <DynamicFormField
              control={form.control}
              name="label"
              label="Ghi chú"
              placeholder="Nhập ghi chú"
              type="input"
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field, fieldState: { error } }) => {
                const formatVND = (value: number | undefined | null) => {
                  if (value === null || value === undefined || Number.isNaN(value)) return '';
                  return new Intl.NumberFormat('vi-VN', {
                    maximumFractionDigits: 0,
                  }).format(value);
                };

                // Display formatted string but store a numeric value in the form state.
                return (
                  <FormItem>
                    <FormLabel>Số tiền (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Nhập số tiền"
                        value={formatVND(field.value as unknown as number)}
                        onChange={(e) => {
                          // keep digits only when parsing
                          const digits = String(e.target.value).replace(/[^0-9]/g, '');
                          field.onChange(digits === '' ? undefined : Number(digits));
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm font-medium">
                      {error?.message}
                    </FormMessage>
                  </FormItem>
                );
              }}
            />
          </div>
        </Form>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Hủy
          </Button>

          <Button type="button" onClick={submit}>
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
