'use client';
// @ts-nocheck

import React from 'react';
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
  const [data, setData] = React.useState<InvoiceData>(
    initialProp || { order_date: new Date().toISOString().split('T')[0], items: [] },
  );

  React.useEffect(() => {
    if (initialProp) {
      // Normalize order_date to YYYY-MM-DD for <input type="date" />
      const normalizeDate = (d?: string) => {
        if (!d) return new Date().toISOString().split('T')[0];
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return d;
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
      };

      setData((prev) => ({
        ...prev,
        ...initialProp,
        order_date: normalizeDate(initialProp.order_date as string),
      }));
    }
  }, [initialProp]);

  // If modal is opened with initial invoice data (from an order), open preview by default
  React.useEffect(() => {
    if (initialProp) setActiveTab('preview');
  }, [initialProp]);

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

  // printInvoice removed per request

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xuất hóa đơn</DialogTitle>
        </DialogHeader>

        <DialogContent className="min-w-[90vw] min-h-[90vh]">
          <div>
            {/* Simple tabs header */}
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 -mb-px font-medium ${
                  activeTab === 'form' ? 'border-b-2 border-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setActiveTab('form')}
              >
                Nhập dữ liệu
              </button>
              <button
                className={`px-4 py-2 -mb-px font-medium ${
                  activeTab === 'preview' ? 'border-b-2 border-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setActiveTab('preview')}
              >
                Xem trước
              </button>
            </div>

            {/* Tab panels */}
            {activeTab === 'form' ? (
              <div className="overflow-y-auto h-[70vh] px-2">
                {/* Nút tải xuất file */}
                <div className="flex justify-end gap-2 mb-3">
                  <Button
                    onClick={handleDownloadImage}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    🖼️ Tải PNG
                  </Button>
                  <Button onClick={downloadPDF} className="bg-red-500 text-white hover:bg-red-600">
                    � Tải PDF
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium">Khách hàng</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={data.customer_name ?? ''}
                    onChange={(e) => setData((d) => ({ ...d, customer_name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Địa chỉ</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={data.address ?? ''}
                    onChange={(e) => setData((d) => ({ ...d, address: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Mã vận chuyển</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={data.shipping_code ?? ''}
                    onChange={(e) => setData((d) => ({ ...d, shipping_code: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Ngày</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={data.order_date ?? new Date().toISOString().split('T')[0]}
                    onChange={(e) => setData((d) => ({ ...d, order_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Ghi chú sản phẩm</label>
                  <div className="text-sm">
                    {(data.items || []).map((it, i) => (
                      <div key={i} className="flex justify-between">
                        <div>{it.product_title}</div>
                        <div>
                          {it.quantity} x {formatVND(it.unit_price)} = {formatVND(it.total_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer / company info inputs */}
                <div className="pt-4 border-t">
                  <div className="text-sm font-semibold mb-2">
                    Thông tin hiển thị ở cuối hóa đơn
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-sm">Dòng cảm ơn</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={data.thank_you ?? 'Xin cảm ơn'}
                      onChange={(e) => setData((d) => ({ ...d, thank_you: e.target.value }))}
                    />

                    <label className="text-sm">Tiêu đề thông tin ngân hàng</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={data.bank_info_title ?? 'Thông tin Ngân hàng'}
                      onChange={(e) => setData((d) => ({ ...d, bank_info_title: e.target.value }))}
                    />

                    <label className="text-sm">Ngân hàng</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={data.bank_name ?? 'Ngân hàng Trung tâm Đà Nẵng'}
                      onChange={(e) => setData((d) => ({ ...d, bank_name: e.target.value }))}
                    />

                    <label className="text-sm">Số tài khoản</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={data.account_number ?? '123 456 7890'}
                      onChange={(e) => setData((d) => ({ ...d, account_number: e.target.value }))}
                    />

                    <label className="text-sm">Email liên hệ</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={data.contact_email ?? 'xin chao@trangwebhay.com'}
                      onChange={(e) => setData((d) => ({ ...d, contact_email: e.target.value }))}
                    />

                    <label className="text-sm">Số điện thoại liên hệ</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={data.contact_phone ?? '+84 912 345 678'}
                      onChange={(e) => setData((d) => ({ ...d, contact_phone: e.target.value }))}
                    />

                    <label className="text-sm">Tiêu đề tên tài khoản</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={data.account_holder_title ?? 'Tên tài khoản'}
                      onChange={(e) =>
                        setData((d) => ({ ...d, account_holder_title: e.target.value }))
                      }
                    />

                    <label className="text-sm">Tên tài khoản</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={data.account_holder_name ?? 'BUIDOI HIGHHAND'}
                      onChange={(e) =>
                        setData((d) => ({ ...d, account_holder_name: e.target.value }))
                      }
                    />

                    <label className="text-sm">Địa chỉ công ty</label>
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      rows={2}
                      value={data.company_address ?? '123 Ngõ 45 Đội Cấn, Ba Đình, Hà Nội'}
                      onChange={(e) => setData((d) => ({ ...d, company_address: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                ref={previewRef}
                className="mt-2 border rounded text-black flex"
                style={{ backgroundColor: 'rgb(242, 237, 228)', overflowY: 'visible' }}
              >
                {/* Main content */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[88vh]">
                  <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className="text-2xl font-extrabold"
                          style={{ color: 'rgb(242, 121, 46)' }}
                        >
                          BUIDOI HIGHHAND
                        </div>
                        <div className="text-lg font-semibold mt-2">Hóa đơn</div>
                      </div>

                      {/* Stamp / circular text (SVG) */}
                      <div className="flex items-center">
                        <svg
                          width="110"
                          height="110"
                          viewBox="0 0 100 100"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ transform: 'rotate(-15deg)' }}
                          aria-hidden
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
                    <div className="mt-6">
                      <div className="text-lg font-bold">{data.customer_name ?? 'Khách hàng'}</div>
                      <div className="mt-2 text-sm text-gray-700 flex gap-3">
                        {/* Single continuous orange bar */}
                        <div className="w-1 bg-orange-400 flex-shrink-0" />

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
                    <div className="mt-6 overflow-x-auto">
                      <table
                        className="w-full text-sm border-collapse min-w-[600px]"
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
                    <div className="mt-4 flex justify-end">
                      <div className="w-1/3">
                        <div className="flex justify-between text-sm">
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
                    <div className="mt-8 border-t pt-4 text-sm text-gray-700">
                      <div className="text-orange-600 font-semibold">
                        {data.thank_you || 'Xin cảm ơn'}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-6">
                        <div>
                          <div className="font-medium">
                            {data.bank_info_title || 'Thông tin Ngân hàng'}
                          </div>
                          <div>{data.bank_name || 'Ngân hàng Trung tâm Đà Nẵng'}</div>
                          <div>Số tài khoản: {data.account_number || '123 456 7890'}</div>
                          <div className="mt-2">{data.contact_email || 'xin chao@trangwebhay.com'}</div>
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
                <div className="w-14" style={{ backgroundColor: 'rgb(242, 121, 46)' }} />
              </div>
            )}
          </div>
        </DialogContent>

        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleDownloadImage} className="bg-blue-500 hover:bg-blue-600">
              📷 PNG
            </Button>
            <Button onClick={downloadPDF} className="bg-red-500 hover:bg-red-600">
              📄 PDF
            </Button>
            <Button
              onClick={() =>
                downloadDOC(
                  `hoa-don-${data.customer_name?.replace(/\s+/g, '-') || 'khach-hang'}.doc`,
                )
              }
              variant="outline"
            >
              📝 DOC
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
