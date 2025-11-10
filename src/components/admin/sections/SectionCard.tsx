import { ReactNode } from 'react';

interface SectionCardProps {
  label: string;
  children: ReactNode;
}

/**
 * Card wrapper cho mỗi section trong homepage settings
 * Hiển thị label và children (các field cụ thể của section đó)
 */
export function SectionCard({ label, children }: SectionCardProps) {
  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-semibold">{label}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
      </div>
    </div>
  );
}
