import React from 'react';
import { Unlink } from 'lucide-react';

export function EmptyState({
  icon: Icon = Unlink,
  title = 'Telemetry Unavailable',
  message = 'Prometheus scrape target is not returning data.',
  action,
  compact = false,
  className = '',
}) {
  return (
    <div
      className={`rounded-[18px] border border-dashed border-[#D5DCE5] dark:border-[#2B3B57] bg-[#F5F7FA] dark:bg-[#202C43] flex flex-col items-center justify-center text-center text-[#66758B] dark:text-[#AEB8C8] font-sans ${
        compact ? 'p-3.5' : 'p-6 sm:p-8'
      } ${className}`}
    >
      <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1A2438] border border-[#E1E6ED] dark:border-[#2B3B57] flex items-center justify-center text-[#B97819] mb-2">
        <Icon className="w-4 h-4 text-[#D97706]" />
      </div>
      <h4 className="text-[11px] font-bold text-[#17213B] dark:text-[#F8FAFC] uppercase tracking-wider mb-0.5">
        {title}
      </h4>
      <p className="text-[11px] text-[#8995A8] dark:text-[#AEB8C8] max-w-xs leading-relaxed">
        {message}
      </p>
      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}
