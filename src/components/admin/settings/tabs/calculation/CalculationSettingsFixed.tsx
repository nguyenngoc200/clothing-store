import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from '@/components/ui/form';
import { calculationService } from '@/services/calculation.service';
// Dialog UI moved to AddItemDialog component
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Item, CalcForm } from '@/types/calculation';
import { CATEGORIES, emptyItem } from '@/constants/calculation';

// types and constants extracted to shared files

import CalculationUtils from '@/lib/utils/calculation';
import CategoryTab from './CategoryTab';
import AddItemDialog from './modals/AddItemDialog';
import SaveChangesBar from './modals/SaveChangesBar';
import DeleteConfirmDialog from './modals/DeleteConfirmDialog';

export default function CalculationSettingsFixed() {
  const [saved, setSaved] = useState<CalcForm | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('advertising');
  const [addDialog, setAddDialog] = useState<{ open: boolean; category: keyof CalcForm | null }>({
    open: false,
    category: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    category: keyof CalcForm | null;
    index: number | null;
  }>({ open: false, category: null, index: null });
  const [tempItem, setTempItem] = useState<Item>(emptyItem());
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm<CalcForm>({
    defaultValues: {
      advertising: [],
      packaging: [],
      shipping: [],
      personnel: [],
      rent: [],
      freeship: [],
    },
  });

  const { reset, control, formState } = form;

  useEffect(() => {
    setHasChanges(formState.isDirty);
  }, [formState.isDirty]);

  const advFields = useFieldArray({ control, name: 'advertising' });
  const packFields = useFieldArray({ control, name: 'packaging' });
  const shipFields = useFieldArray({ control, name: 'shipping' });
  const persFields = useFieldArray({ control, name: 'personnel' });
  const rentFields = useFieldArray({ control, name: 'rent' });
  const freeFields = useFieldArray({ control, name: 'freeship' });

  const fieldsMap = {
    advertising: advFields,
    packaging: packFields,
    shipping: shipFields,
    personnel: persFields,
    rent: rentFields,
    freeship: freeFields,
  } as const;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    calculationService
      .getAll()
      .then((res) => {
        if (!mounted) return;
        const rows = (res?.data as any[]) || [];
        console.debug('calculation settings rows (raw):', rows);
        if (rows.length) {
          // Build payload object mapping tab -> data for normalizePayload
          const payloadObj: Record<string, unknown> = {};
          rows.forEach((r) => {
            if (!r) return;
            const tab = r.tab as string | undefined;
            if (!tab) return;

            // Prefer explicit `data` column; fall back to possible per-column values
            let value: unknown = r.data ?? null;

            // Some older migrations or schemas may have stored JSON in dedicated columns
            // (e.g. r.advertising, r.packaging) or as JSON text. Check and parse if needed.
            if (value == null) {
              const maybe = r[tab];
              if (maybe !== undefined) value = maybe;
            }

            if (typeof value === 'string') {
              try {
                value = JSON.parse(value);
              } catch {
                // leave as string if not JSON
              }
            }

            payloadObj[tab] = value;
          });

          console.debug('calculation payloadObj (parsed):', payloadObj);
          const vals = CalculationUtils.normalizePayload(payloadObj);
          setSaved(vals);
          reset(vals);
          setLoading(false);
        } else {
          // no rows -> ensure form is empty/default
          const empty = CalculationUtils.normalizePayload(undefined);
          setSaved(empty);
          reset(empty);
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      mounted = false;
      setLoading(false);
    };
  }, [reset]);

  async function onSubmit(values: CalcForm) {
    const payload = CalculationUtils.buildPayload(values);

    try {
      // send batch payload (data object) and server will split into per-tab rows
      await calculationService.upsert({ data: payload });
      setSaved(payload as CalcForm);
      reset(payload as CalcForm);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save calculation settings', err);
    }
  }

  function onCancel() {
    if (saved) reset(saved);
  }

  // getFieldsForCategory moved into CalculationUtils; keep a local alias if needed
  // const getFieldsForCategory = (cat: keyof CalcForm) => CalculationUtils.getFieldsForCategory(fieldsMap, cat);

  function handleAddClick(category: keyof CalcForm) {
    // Use util to open add dialog and reset temp
    CalculationUtils.openAdd(setTempItem, setAddDialog, emptyItem);
    // set category explicitly so the dialog shows correct category
    setAddDialog((s) => ({ ...s, category }));
  }

  function handleConfirmAdd(item?: Item) {
    const toAdd = item ?? tempItem;
    CalculationUtils.confirmAdd(
      fieldsMap,
      addDialog.category,
      toAdd,
      setAddDialog,
      setTempItem,
      emptyItem,
    );
  }

  function handleDeleteClick(category: keyof CalcForm, index: number) {
    CalculationUtils.openDelete(setDeleteDialog, category, index);
  }

  function handleConfirmDelete() {
    CalculationUtils.confirmDelete(fieldsMap, deleteDialog, setDeleteDialog);
  }

  const allVals = form.watch();

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <p className="text-sm text-neutral-600 mb-4">
            Ở đây bạn có thể thiết lập các tham số tính toán (giá mặc định cho quảng cáo, đóng gói,
            vận chuyển, nhân sự, mặt bằng và freeship).
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full inline-flex h-auto flex-wrap gap-1 p-1">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.key}
                  value={cat.key}
                  className="flex-shrink-0 px-3 py-2 text-sm"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <CategoryTab
                key={cat.key}
                cat={cat}
                items={(allVals as any)?.[cat.key] || []}
                onAdd={handleAddClick}
                onDelete={handleDeleteClick}
                loading={loading}
              />
            ))}
          </Tabs>

          {hasChanges && <SaveChangesBar onCancel={onCancel} />}
        </form>
      </Form>

      <AddItemDialog
        open={addDialog.open}
        onOpenChange={(open) => setAddDialog({ open, category: null })}
        category={addDialog.category || undefined}
        tempItem={tempItem}
        setTempItem={setTempItem}
        onConfirm={handleConfirmAdd}
        onCancel={() => setAddDialog({ open: false, category: null })}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa mục này không?"
        onOpenChange={(open) => setDeleteDialog({ open, category: null, index: null })}
        onCancel={() => setDeleteDialog({ open: false, category: null, index: null })}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
