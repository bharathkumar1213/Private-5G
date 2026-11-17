import React from 'react';

export function Card({
  children,
  className = '',
  variant = 'default', // 'default', 'muted', 'dashed', 'interactive'
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  footer,
  noPadding = false,
  accentColor, // optional colored top accent strip (e.g. '#F59E0B', '#059669', etc.)
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'dashed':
        return 'bg-[#FFFFFF] dark:bg-[#1A2438] border border-dashed border-[#CDD5E0] dark:border-[#2B3B57]';
      case 'muted':
        return 'bg-[#F5F7FA] dark:bg-[#202C43] border border-[#E9EDF2] dark:border-[#2B3B57] opacity-90';
      case 'interactive':
        return 'bg-[#FFFFFF] dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] hover:border-[#F2D39B] dark:hover:border-[#F59E0B] hover:shadow-square-hover transition-all duration-150 shadow-square';
      case 'default':
      default:
        return 'bg-[#FFFFFF] dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] shadow-square';
    }
  };

  return (
    <div className={`rounded-[22px] overflow-hidden flex flex-col justify-between transition-colors duration-200 ${getVariantClasses()} ${className}`}>
      {accentColor && (
        <div
          className="h-1 w-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Optional Card Header */}
      {(title || Icon || badge || action) && (
        <div className="px-5 py-4 border-b border-[#EEF1F5] dark:border-[#2B3B57] flex items-center justify-between gap-3 bg-white dark:bg-[#1A2438]">
          <div className="flex items-center space-x-2.5 min-w-0">
            {Icon && (
              <div className="p-2 rounded-xl bg-[#FFF4E5] dark:bg-[#F59E0B]/15 border border-[#F6D7A6] dark:border-[#F59E0B]/35 text-[#F59E0B] shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-[#17213B] dark:text-[#F8FAFC] tracking-tight truncate font-sans">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-[#8995A8] dark:text-[#AEB8C8] truncate font-sans mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {badge && <div>{badge}</div>}
            {action && <div>{action}</div>}
          </div>
        </div>
      )}

      {/* Card Content Body */}
      <div className={`flex-1 ${noPadding ? '' : 'p-5 sm:p-6'}`}>
        {children}
      </div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="px-5 py-3 border-t border-[#EEF1F5] dark:border-[#2B3B57] bg-[#FBFCFE] dark:bg-[#202C43] text-xs text-[#8995A8] dark:text-[#AEB8C8]">
          {footer}
        </div>
      )}
    </div>
  );
}
