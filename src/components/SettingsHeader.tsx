import React, { ReactNode } from 'react';
import { Cog } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  className?: string;
  /**
   * Optional override for the icon. Pass an element such as
   * <User /> or any React node. If omitted, a Cog icon is used.
   */
  icon?: ReactNode;
  /** Additional classes applied to the icon when using the default Cog */
  iconClassName?: string;
}

export default function SettingsHeader({
  title = 'Cài đặt',
  subtitle = 'Quản lý cài đặt cho cửa hàng của bạn',
  className = '',
  icon,
  iconClassName = '',
}: Props) {
  return (
    <div className={`flex items-center mb-6 ${className}`}>
      {icon ? (
        // allow callers to pass a prepared element
        <span className="mr-2 h-10 w-10 flex items-center justify-center">{icon}</span>
      ) : (
        <Cog className={`mr-2 h-10 w-10 ${iconClassName}`} />
      )}

      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-neutral-600">{subtitle}</p>
      </div>
    </div>
  );
}
