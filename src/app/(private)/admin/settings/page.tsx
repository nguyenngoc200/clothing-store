'use client';

import SectionSettings from '@/components/admin/SectionSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cài đặt</h1>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="homepage">
          <TabsList>
            <TabsTrigger value="homepage">Cài đặt Trang chủ</TabsTrigger>
            <TabsTrigger value="calculation">Cài đặt Tính toán</TabsTrigger>
          </TabsList>

          <TabsContent value="homepage">
            <section>
              <SectionSettings />
            </section>
          </TabsContent>

          <TabsContent value="calculation">
            <section>
              <h2 className="text-lg font-semibold mb-4">Cài đặt Tính toán</h2>
              <p className="text-sm text-neutral-600">
                Ở đây bạn có thể thiết lập các tham số tính toán (VAT, tỷ lệ chiết khấu, v.v.).
              </p>
              {/* Add fields/forms as needed */}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
