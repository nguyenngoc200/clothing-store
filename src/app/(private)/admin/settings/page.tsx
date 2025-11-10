'use client';

import CalculationSettings from '@/components/admin/settings/tabs/calculation/CalculationSettingsFixed';
import ProductCostSettings from '@/components/admin/settings/tabs/ProductCostSettings';
import SectionSettings from '@/components/admin/settings/tabs/SectionSettings';
import SettingsHeader from '@/components/SettingsHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SETTINGS, { SETTINGS_TABS } from '@/constants/settings';

export default function AdminSettingsPage() {
  return (
    <>
      <SettingsHeader />

      <div className="mb-6">
        <Tabs defaultValue={SETTINGS.HOMEPAGE.tab}>
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1">
            {SETTINGS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={SETTINGS.HOMEPAGE.tab}>
            <SectionSettings />
          </TabsContent>

          <TabsContent value={SETTINGS.CALCULATION.tab}>
            <CalculationSettings />
          </TabsContent>

          <TabsContent value={SETTINGS.PRODUCT_COST.tab}>
            <ProductCostSettings />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
