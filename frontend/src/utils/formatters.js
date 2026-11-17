/**
 * Engineering formatters for Private 5G Telemetry
 */

export function formatDate(isoString) {
  if (!isoString) return 'Unavailable';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return 'Unavailable';
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return 'Unavailable';
  }
}

export function formatTimeOnly(isoString) {
  if (!isoString) return '--:--:--';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour12: false });
  } catch {
    return '--:--:--';
  }
}

export function formatBytesRate(bytesPerSec) {
  if (bytesPerSec === null || bytesPerSec === undefined || bytesPerSec === 'Unavailable') {
    return 'Unavailable';
  }
  const num = typeof bytesPerSec === 'number' ? bytesPerSec : parseFloat(bytesPerSec);
  if (Number.isNaN(num)) return 'Unavailable';
  if (num === 0) return '0.00 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${(num / Math.pow(k, i)).toFixed(2)} ${sizes[i] || 'B/s'}`;
}

export function getStatusColor(status) {
  switch (status?.toUpperCase()) {
    case 'UP':
    case 'OPTIMAL':
    case 'VERIFIED':
    case 'SUCCESS':
      return {
        bg: 'bg-[#48B8A2]/15',
        text: 'text-[#48B8A2]',
        border: 'border-[#48B8A2]/30',
        dot: 'bg-[#48B8A2]',
      };
    case 'DOWN':
    case 'CRITICAL':
    case 'FAILED':
      return {
        bg: 'bg-[#D76565]/15',
        text: 'text-[#D76565]',
        border: 'border-[#D76565]/30',
        dot: 'bg-[#D76565]',
      };
    case 'DEGRADED':
    case 'WARNING':
    case 'WARN':
    case 'PARTIAL_MONITORING':
      return {
        bg: 'bg-[#D6A653]/15',
        text: 'text-[#D6A653]',
        border: 'border-[#D6A653]/30',
        dot: 'bg-[#D6A653]',
      };
    case 'UNAVAILABLE':
    case 'NOT_VERIFIED':
    case 'PENDING':
    default:
      return {
        bg: 'bg-[#2B3339]',
        text: 'text-[#A2ADB3]',
        border: 'border-[#39434A]',
        dot: 'bg-[#39434A]',
      };
  }
}

