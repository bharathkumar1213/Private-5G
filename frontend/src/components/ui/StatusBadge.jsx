import React from 'react';

export function StatusBadge({ status, size = 'md', className = '' }) {
  const norm = (status || 'UNAVAILABLE').toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case 'UP':
      case 'OPTIMAL':
      case 'VERIFIED':
      case 'SUCCESS':
      case 'CONNECTED':
      case 'ACTIVE':
      case 'HEALTHY':
      case 'OPERATIONAL':
      case 'REGISTERED':
      case 'CARRIER ACTIVE':
      case 'PDU ACTIVE':
      case 'USER PLANE ACTIVE':
        return {
          bg: 'bg-[#EAF8F2] dark:bg-[#059669]/20',
          text: 'text-[#278463] dark:text-[#57C69D]',
          border: 'border-[#C8EBDD]',
          dot: 'bg-[#39A37A] dark:bg-[#57C69D]',
          label: norm === 'CONNECTED' ? 'Connected' : (norm === 'UP' ? 'Operational' : norm),
        };
      case 'DOWN':
      case 'CRITICAL':
      case 'DISCONNECTED':
      case 'FAILED':
      case 'FIRING':
      case 'OFFLINE':
      case 'SERVICE FAULT':
      case 'INTERFACE FAULT':
      case 'RECOVERY_FAILED':
      case 'RECOVERY FAILED':
        return {
          bg: 'bg-[#FFF0F0] dark:bg-[#DC2626]/20',
          text: 'text-[#C94A4A] dark:text-[#F27A7A]',
          border: 'border-[#F5D2D2]',
          dot: 'bg-[#D95B5B] dark:bg-[#F27A7A]',
          label: norm === 'DISCONNECTED' ? 'Disconnected' : (norm === 'DOWN' ? 'Offline' : norm),
        };
      case 'DEGRADED':
      case 'WARNING':
      case 'WARN':
      case 'PARTIAL_MONITORING':
      case 'SUPPRESSED':
      case 'SILENCED':
      case 'STANDBY':
      case 'STANDBY (IDLE)':
      case 'STANDBY (0 SESSIONS)':
      case 'CARRIER STANDBY':
      case 'TUNNEL READY (IDLE)':
      case 'RECOVERING':
      case 'RECOVERY IN PROGRESS':
        return {
          bg: 'bg-[#FFF7E7] dark:bg-[#D97706]/20',
          text: 'text-[#B97819] dark:text-[#F2B25D]',
          border: 'border-[#F4E0B7]',
          dot: 'bg-[#C98B2A] dark:bg-[#F2B25D]',
          label: norm === 'RECOVERING' ? 'Recovering' : norm,
        };
      case 'INFO':
      case 'CONFIGURED':
      case 'STABLE':
        return {
          bg: 'bg-[#FFF4E5] dark:bg-[#F59E0B]/20',
          text: 'text-[#F59E0B] dark:text-[#FFD083]',
          border: 'border-[#F6D7A6]',
          dot: 'bg-[#F59E0B] dark:bg-[#FFD083]',
          label: norm,
        };
      case 'PENDING':
      case 'UNAVAILABLE':
      default:
        return {
          bg: 'bg-[#F5F7FA] dark:bg-[#64748B]/20',
          text: 'text-[#758398] dark:text-[#AEB8C8]',
          border: 'border-[#E1E6ED] dark:border-[#2B3B57]',
          dot: 'bg-[#AAB5C4]',
          label: norm === 'PENDING' ? 'Pending' : 'Unavailable',
        };
    }
  };

  const style = getStyle();

  const sizeClasses = {
    xs: 'px-1.5 py-0.2 text-[9.5px]',
    sm: 'px-2 py-0.5 text-[10.5px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-lg font-mono font-semibold border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} ${className}`}
    >
      <span className={`rounded-full shrink-0 ${style.dot} ${dotSizes[size]}`} />
      <span className="truncate">{style.label}</span>
    </span>
  );
}
