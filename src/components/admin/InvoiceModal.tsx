'use client';
// @ts-nocheck

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Form } from '@/components/ui/form';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
type OrderItem = {
  image?: string;
  product_title?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
};
type InvoiceData = {
  id?: string;
  customer_name?: string;
  address?: string;
  shipping_code?: string;
  order_date?: string;
  items?: OrderItem[];
  // footer / company info shown on the invoice preview
  thank_you?: string;
  bank_info_title?: string;
  bank_name?: string;
  account_number?: string;
  contact_email?: string;
  contact_phone?: string;
  account_holder_title?: string;
  account_holder_name?: string;
  company_address?: string;
};

export default function InvoiceModal({
  open,
  onOpenChange,
  initialData,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // support both prop names used across the codebase
  initialData?: InvoiceData | null;
  initial?: InvoiceData | null;
}) {
  const [activeTab, setActiveTab] = React.useState<'form' | 'preview'>('form');
  const initialProp = initial ?? initialData;

  // zod schema for invoice form
  const invoiceSchema = z.object({
    id: z.string().optional(),
    customer_name: z.string().optional(),
    address: z.string().optional(),
    shipping_code: z.string().optional(),
    order_date: z.string().optional(),
    items: z.array(z.any()).optional(),
    thank_you: z.string().optional(),
    bank_info_title: z.string().optional(),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    contact_email: z.string().optional(),
    contact_phone: z.string().optional(),
    account_holder_title: z.string().optional(),
    account_holder_name: z.string().optional(),
    company_address: z.string().optional(),
  });

  type InvoiceFormValues = z.infer<typeof invoiceSchema>;

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: (initialProp as InvoiceFormValues) || {
      order_date: new Date().toISOString().split('T')[0],
      items: [],
    },
  });

  const { control, watch, reset } = form;

  // useFieldArray for managing product items
  const { fields } = useFieldArray({
    control,
    name: 'items',
  });

  // Keep form in sync when initial prop changes
  React.useEffect(() => {
    if (initialProp) {
      const normalizeDate = (d?: string) => {
        if (!d) return new Date().toISOString().split('T')[0];
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return d;
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
      };

      const values = {
        ...initialProp,
        order_date: normalizeDate((initialProp as InvoiceFormValues).order_date),
      } as InvoiceFormValues;

      reset(values);
    }
  }, [initialProp, reset]);

  // If modal is opened with initial invoice data (from an order), open preview by default
  React.useEffect(() => {
    if (initialProp) setActiveTab('preview');
  }, [initialProp]);

  // watch current form data for preview/export
  const data = watch();

  const formatVND = (v?: number) =>
    new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Number(v) || 0) + ' ₫';

  const formatDateLong = (dateStr?: string) => {
    // Return date in dd/mm/yyyy (zero-padded)
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const previewRef = React.useRef<HTMLDivElement | null>(null);

  // Helper function để convert ảnh sang base64
  const imageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Không thể tạo canvas context'));
        }
      };
      img.onerror = () => reject(new Error('Không thể load ảnh'));
      img.src = url;
    });
  };

  // Helper function để prepare element trước khi export
  const prepareElementForExport = async () => {
    const element = previewRef.current;
    if (!element) return null;

    // Convert logo sang base64 và thay thế trong SVG
    try {
      const logoBase64 = await imageToBase64('/logo.png');
      const svgImages = element.querySelectorAll('image[href="/logo.png"]');
      svgImages.forEach((img) => {
        img.setAttribute('href', logoBase64);
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.warn('Không thể load logo:', error);
    }

    // Tìm và xử lý scrollable elements
    const scrollableElements = element.querySelectorAll('.overflow-y-auto');
    const originalStyles: Array<{
      element: HTMLElement;
      overflow: string;
      maxHeight: string;
      scrollTop: number;
    }> = [];

    scrollableElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      originalStyles.push({
        element: htmlEl,
        overflow: htmlEl.style.overflow,
        maxHeight: htmlEl.style.maxHeight,
        scrollTop: htmlEl.scrollTop,
      });

      htmlEl.scrollTop = 0;
      htmlEl.style.overflow = 'visible';
      htmlEl.style.maxHeight = 'none';
    });

    await new Promise((resolve) => setTimeout(resolve, 150));

    return { element, originalStyles };
  };

  // Helper function để restore element sau khi export
  const restoreElement = (
    originalStyles: Array<{
      element: HTMLElement;
      overflow: string;
      maxHeight: string;
      scrollTop: number;
    }>,
  ) => {
    const element = previewRef.current;
    if (!element) return;

    // Khôi phục styles
    originalStyles.forEach(({ element, overflow, maxHeight, scrollTop }) => {
      element.style.overflow = overflow;
      element.style.maxHeight = maxHeight;
      element.scrollTop = scrollTop;
    });

    // Khôi phục logo
    const svgImages = element.querySelectorAll('image[href^="data:image"]');
    svgImages.forEach((img) => {
      img.setAttribute('href', '/logo.png');
    });
  };

  // ✅ Hàm xuất ảnh PNG sử dụng html-to-image (chất lượng cao hơn)
  const handleDownloadImage = async () => {
    try {
      const wasOnFormTab = activeTab === 'form';
      if (wasOnFormTab) {
        setActiveTab('preview');
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const prepared = await prepareElementForExport();
      if (!prepared) {
        alert('Không thể tải ảnh. Vui lòng thử lại.');
        return;
      }

      const { element, originalStyles } = prepared;

      // Sử dụng html-to-image thay vì html2canvas (chất lượng tốt hơn)
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2, // độ nét cao
        backgroundColor: 'rgb(242, 237, 228)',
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });

      // Khôi phục element
      restoreElement(originalStyles);

      // Download
      const link = document.createElement('a');
      link.download = `hoa-don-${data.customer_name?.replace(/\s+/g, '-') || 'khach-hang'}.png`;
      link.href = dataUrl;
      link.click();

      if (wasOnFormTab) {
        setTimeout(() => setActiveTab('form'), 500);
      }
    } catch (error) {
      console.error('Lỗi khi tải ảnh:', error);
      alert('Có lỗi xảy ra khi tải ảnh. Vui lòng thử lại.');
    }
  };

  // ✅ Hàm xuất PDF sử dụng jsPDF (chất lượng cao)
  const downloadPDF = async () => {
    try {
      const wasOnFormTab = activeTab === 'form';
      if (wasOnFormTab) {
        setActiveTab('preview');
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const prepared = await prepareElementForExport();
      if (!prepared) {
        alert('Không thể tải PDF. Vui lòng thử lại.');
        return;
      }

      const { element, originalStyles } = prepared;

      // Chuyển element sang PNG trước
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: 'rgb(242, 237, 228)',
        cacheBust: true,
      });

      // Khôi phục element
      restoreElement(originalStyles);

      // Tạo PDF với kích thước A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Thêm ảnh vào PDF
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Download PDF
      pdf.save(`hoa-don-${data.customer_name?.replace(/\s+/g, '-') || 'khach-hang'}.pdf`);

      if (wasOnFormTab) {
        setTimeout(() => setActiveTab('form'), 500);
      }
    } catch (error) {
      console.error('Lỗi khi tải PDF:', error);
      alert('Có lỗi xảy ra khi tải PDF. Vui lòng thử lại.');
    }
  };

  const downloadDOC = (filename = 'invoice.doc') => {
    const header = '<!doctype html><html><head><meta charset="utf-8"></head><body>';
    const footer = '</body></html>';
    const content = previewRef.current?.innerHTML || '';
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xuất hóa đơn</DialogTitle>
        </DialogHeader>

        <DialogContent className="min-w-[90vw] min-h-[90vh] sm:min-w-[85vw] lg:min-w-[90vw]">
          <div className="h-full flex flex-col">
            {/* Simple tabs header */}
            <div className="flex border-b mb-2 sm:mb-4 pb-2 gap-1">
              <Button
                size="sm"
                className={`px-2 sm:px-4 py-2 -mb-px font-medium text-xs sm:text-sm ${
                  activeTab === 'form'
                    ? 'bg-primary text-white hover:bg-primary'
                    : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
                }`}
                onClick={() => setActiveTab('form')}
                variant="ghost"
              >
                Nhập dữ liệu
              </Button>
              <Button
                size="sm"
                className={`px-2 sm:px-4 py-2 -mb-px font-medium text-xs sm:text-sm ${
                  activeTab === 'preview'
                    ? 'bg-primary text-white hover:bg-primary'
                    : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
                }`}
                onClick={() => setActiveTab('preview')}
                variant="ghost"
              >
                Xem trước
              </Button>
            </div>

            {/* Tab panels */}
            {activeTab === 'form' ? (
              <Form {...form}>
                <div className="overflow-y-auto h-[60vh] sm:h-[70vh] px-1 sm:px-2">
                  {/* Nút tải xuất file */}
                  <div className="flex flex-wrap justify-end gap-1 sm:gap-2 mb-2 sm:mb-4 sticky top-0 bg-white pb-2 z-10">
                    <Button
                      onClick={handleDownloadImage}
                      className="bg-blue-500 text-white hover:bg-blue-600 text-xs sm:text-sm px-2 sm:px-4"
                      size="sm"
                    >
                      🖼️ <span className="hidden sm:inline">Tải </span>PNG
                    </Button>
                    <Button
                      onClick={downloadPDF}
                      className="bg-red-500 text-white hover:bg-red-600 text-xs sm:text-sm px-2 sm:px-4"
                      size="sm"
                    >
                      📄 <span className="hidden sm:inline">Tải </span>PDF
                    </Button>
                  </div>

                  {/* Tabs for form sections */}
                  <Tabs defaultValue="customer" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 mb-2 sm:mb-4 h-auto">
                      <TabsTrigger value="customer" className="text-xs sm:text-sm px-1 sm:px-3">
                        <span className="hidden sm:inline">👤 </span>Khách hàng
                      </TabsTrigger>
                      <TabsTrigger value="products" className="text-xs sm:text-sm px-1 sm:px-3">
                        <span className="hidden sm:inline">📦 </span>Sản phẩm
                      </TabsTrigger>
                      <TabsTrigger value="company" className="text-xs sm:text-sm px-1 sm:px-3">
                        <span className="hidden sm:inline">🏢 </span>Công ty
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Thông tin khách hàng */}
                    <TabsContent value="customer" className="mt-0">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <DynamicFormField
                              control={control}
                              name="customer_name"
                              label="Tên khách hàng"
                              placeholder="Nhập tên khách hàng"
                              type="input"
                            />
                          </div>

                          <div>
                            <DynamicFormField
                              control={control}
                              name="shipping_code"
                              label="Số điện thoại"
                              placeholder="Nhập số điện thoại"
                              type="input"
                              inputType="tel"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <DynamicFormField
                              control={control}
                              name="address"
                              label="Địa chỉ"
                              placeholder="Nhập địa chỉ khách hàng"
                              type="textarea"
                              rows={3}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <DynamicFormField
                              control={control}
                              name="order_date"
                              label="Ngày lập hóa đơn"
                              type="input"
                              inputType="date"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 2: Sản phẩm đã đặt */}
                    <TabsContent value="products" className="mt-0">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                        <div className="space-y-3 sm:space-y-4">
                          {fields.length > 0 ? (
                            fields.map((field, index) => (
                              <div key={field.id} className="bg-white rounded border p-3 sm:p-4">
                                {/* Product title (read-only display) */}
                                <div className="mb-2 sm:mb-3 pb-2 border-b">
                                  <div className="font-medium text-gray-800 mb-1 text-sm sm:text-base">
                                    {data.items?.[index]?.product_title || 'Sản phẩm'}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">
                                    Số lượng: {data.items?.[index]?.quantity || 0} ×{' '}
                                    {formatVND(data.items?.[index]?.unit_price)} ={' '}
                                    <span className="font-medium">
                                      {formatVND(data.items?.[index]?.total_price)}
                                    </span>
                                  </div>
                                </div>

                                {/* Editable description field */}
                                <div>
                                  <DynamicFormField
                                    control={control}
                                    name={`items.${index}.description`}
                                    label="Mô tả sản phẩm"
                                    placeholder="Nhập mô tả cho sản phẩm này (VD: Size M, Màu đen, ...)"
                                    type="textarea"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-4 bg-white rounded border text-sm">
                              Chưa có sản phẩm
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 3: Thông tin công ty & thanh toán */}
                    <TabsContent value="company" className="mt-0">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                        <div className="space-y-3 sm:space-y-4">
                          {/* Dòng cảm ơn */}
                          <div>
                            <DynamicFormField
                              control={control}
                              name="thank_you"
                              label="Lời cảm ơn"
                              placeholder="VD: Xin cảm ơn"
                              type="input"
                            />
                          </div>

                          {/* Thông tin ngân hàng */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="sm:col-span-2">
                              <DynamicFormField
                                control={control}
                                name="bank_info_title"
                                label="Tiêu đề thông tin ngân hàng"
                                placeholder="VD: Thông tin Ngân hàng"
                                type="input"
                              />
                            </div>

                            <div>
                              <DynamicFormField
                                control={control}
                                name="bank_name"
                                label="Tên ngân hàng"
                                placeholder="VD: Ngân hàng Trung tâm Đà Nẵng"
                                type="input"
                              />
                            </div>

                            <div>
                              <DynamicFormField
                                control={control}
                                name="account_number"
                                label="Số tài khoản"
                                placeholder="VD: 123 456 7890"
                                type="input"
                              />
                            </div>

                            <div>
                              <DynamicFormField
                                control={control}
                                name="contact_email"
                                label="Email liên hệ"
                                placeholder="VD: contact@company.com"
                                type="input"
                                inputType="email"
                              />
                            </div>

                            <div>
                              <DynamicFormField
                                control={control}
                                name="contact_phone"
                                label="Số điện thoại liên hệ"
                                placeholder="VD: +84 912 345 678"
                                type="input"
                                inputType="tel"
                              />
                            </div>

                            <div>
                              <DynamicFormField
                                control={control}
                                name="account_holder_title"
                                label="Tiêu đề tên tài khoản"
                                placeholder="VD: Tên tài khoản"
                                type="input"
                              />
                            </div>

                            <div>
                              <DynamicFormField
                                control={control}
                                name="account_holder_name"
                                label="Tên chủ tài khoản"
                                placeholder="VD: BUIDOI HIGHHAND"
                                type="input"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <DynamicFormField
                                control={control}
                                name="company_address"
                                label="Địa chỉ công ty"
                                placeholder="VD: 123 Ngõ 45 Đội Cấn, Ba Đình, Hà Nội"
                                type="textarea"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Form>
            ) : (
              <div
                ref={previewRef}
                className="mt-2 border-2 border-foreground/50 bg-[var(--color-brand-gold)]/10 rounded text-black flex flex-col sm:flex-row"
              >
                {/* Main content */}
                <div className="flex-1 p-3 sm:p-6 overflow-y-auto max-h-[60vh] sm:max-h-[88vh]">
                  <div className="flex-1 p-2 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                      <div>
                        <div
                          className="text-xl sm:text-2xl font-extrabold"
                          style={{ color: 'var(--color-brand-gold)' }}
                        >
                          BUIDOI HIGHHAND
                        </div>
                        <div className="text-base sm:text-lg font-semibold mt-1 sm:mt-2">
                          Hóa đơn
                        </div>
                      </div>

                      {/* Stamp / circular text (SVG) */}
                      <div className="flex items-center">
                        <svg
                          width="80"
                          height="80"
                          viewBox="0 0 100 100"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ transform: 'rotate(-15deg)' }}
                          aria-hidden
                          className="sm:w-[110px] sm:h-[110px]"
                        >
                          <defs>
                            {/* centered circle path for clean text-on-path */}
                            <path
                              id="invoiceCirclePath"
                              d="M50 50 m -45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0"
                            />
                          </defs>
                          {/* center logo + circular text stamp */}
                          {/* white background circle for logo so it reads on top of invoice */}
                          <g>
                            {/* logo image: drop a file at public/logo.png to use a custom logo */}
                            <image
                              href="/logo.png"
                              x="26"
                              y="26"
                              width="50"
                              height="50"
                              preserveAspectRatio="xMidYMid meet"
                            />
                            <text fill="#6b7280" fontSize="9">
                              <textPath
                                href="#invoiceCirclePath"
                                startOffset="50%"
                                textAnchor="middle"
                              >
                                Bụi Đời High Hand – Hóa Đơn Chính Hãng – Bụi Đời High Hand – Hóa Đơn
                                Chính Hãng –
                              </textPath>
                            </text>
                          </g>
                        </svg>
                      </div>
                    </div>

                    {/* Customer info */}
                    <div className="mt-4 sm:mt-6">
                      <div className="text-base sm:text-lg font-bold">
                        {data.customer_name ?? 'Khách hàng'}
                      </div>
                      <div className="mt-2 text-xs sm:text-sm text-gray-700 flex gap-2 sm:gap-3">
                        {/* Single continuous orange bar */}
                        <div
                          className="w-1 flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-brand-gold)' }}
                        />

                        {/* Info content */}
                        <div className="flex-1">
                          <div className="py-1">
                            Điện thoại Khách hàng:{' '}
                            <span className="font-medium">{data.shipping_code ?? '-'}</span>
                          </div>
                          <div className="py-1">
                            Địa chỉ Khách hàng:{' '}
                            <span className="font-medium">{data.address ?? '-'}</span>
                          </div>
                          <div className="py-1">
                            Ngày:{' '}
                            <span className="font-medium">{formatDateLong(data.order_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items table (updated: Tên sản phẩm, Mô tả, Số lượng, Đơn giá) */}
                    <div className="mt-4 sm:mt-6 overflow-x-auto">
                      <table
                        className="w-full text-xs sm:text-sm border-collapse min-w-[500px] sm:min-w-[600px]"
                        style={{ borderSpacing: 0 }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: 'rgb(242, 237, 228)' }}>
                            <th className="border px-3 py-2 text-left">Tên sản phẩm</th>
                            <th className="border px-3 py-2 text-left">Mô tả</th>
                            <th className="border px-3 py-2 text-right" style={{ width: 90 }}>
                              Số lượng
                            </th>
                            <th className="border px-3 py-2 text-right">Đơn giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.items || []).map((it, i) => (
                            <tr key={i} className="align-top">
                              <td className="border px-3 py-2">{it.product_title}</td>
                              <td className="border px-3 py-2">{it.description ?? '-'}</td>
                              <td className="border px-3 py-2 text-right" style={{ width: 90 }}>
                                {it.quantity ?? 0}
                              </td>
                              <td className="border px-3 py-2 text-right">
                                {formatVND(it.unit_price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-3 sm:mt-4 flex justify-end">
                      <div className="w-full sm:w-1/3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <div>Tổng cộng:</div>
                          <div className="font-medium">
                            {formatVND(
                              (data.items || []).reduce(
                                (s, it) =>
                                  s +
                                  Number(
                                    it.total_price ??
                                      Number(it.quantity || 0) * Number(it.unit_price || 0),
                                  ),
                                0,
                              ),
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm mt-1 text-muted-foreground">
                          <div>Thuế (0%):</div>
                          <div>0 ₫</div>
                        </div>
                        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                          <div>Tổng thanh toán:</div>
                          <div>
                            {formatVND(
                              (data.items || []).reduce(
                                (s, it) =>
                                  s +
                                  Number(
                                    it.total_price ??
                                      Number(it.quantity || 0) * Number(it.unit_price || 0),
                                  ),
                                0,
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: bank info and thanks */}
                    <div className="mt-6 sm:mt-8 border-t pt-3 sm:pt-4 text-xs sm:text-sm text-gray-700">
                      <div
                        className="font-semibold text-sm sm:text-base"
                        style={{ color: 'var(--color-brand-gold)' }}
                      >
                        {data.thank_you || 'Xin cảm ơn'}
                      </div>
                      <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <div className="font-medium">
                            {data.bank_info_title || 'Thông tin Ngân hàng'}
                          </div>
                          <div>{data.bank_name || 'Ngân hàng Trung tâm Đà Nẵng'}</div>
                          <div>Số tài khoản: {data.account_number || '123 456 7890'}</div>
                          <div className="mt-2">
                            {data.contact_email || 'xin chao@trangwebhay.com'}
                          </div>
                          <div>{data.contact_phone || '+84 912 345 678'}</div>
                        </div>

                        <div>
                          <div className="font-medium">
                            {data.account_holder_title || 'Tên tài khoản'}
                          </div>
                          <div>{data.account_holder_name || 'BUIDOI HIGHHAND'}</div>
                          <div>
                            Địa chỉ: {data.company_address || '123 Ngõ 45 Đội Cấn, Ba Đình, Hà Nội'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right orange stripe */}
                <div
                  className="w-full h-8 sm:w-14 sm:h-auto"
                  style={{ backgroundColor: 'var(--color-brand-gold)' }}
                />
              </div>
            )}
          </div>
        </DialogContent>

        <DialogFooter>
          <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Hủy
            </Button>
            <Button
              onClick={handleDownloadImage}
              className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm"
              size="sm"
            >
              📷 PNG
            </Button>
            <Button
              onClick={downloadPDF}
              className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm"
              size="sm"
            >
              📄 PDF
            </Button>
            <Button
              onClick={() =>
                downloadDOC(
                  `hoa-don-${data.customer_name?.replace(/\s+/g, '-') || 'khach-hang'}.doc`,
                )
              }
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              📝 DOC
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
