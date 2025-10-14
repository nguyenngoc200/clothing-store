import { AlertTriangle, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface StickyActionBarProps {
  visible: boolean;
  onCancel: () => void;
}

export function StickyActionBar(props: StickyActionBarProps) {
  const { visible, onCancel } = props;

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white shadow-2xl rounded-lg border border-neutral-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="font-medium">Bạn có thay đổi chưa lưu</span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              onClick={onCancel}
              size="sm"
              variant="white"
              className="flex-1 sm:flex-none text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
            >
              Hủy
            </Button>

            <Button
              type="submit"
              size="sm"
              variant="success"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Lưu tất cả
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StickyActionBar;
