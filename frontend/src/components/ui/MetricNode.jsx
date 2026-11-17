import React from 'react';
import {
  Server,
  Activity,
  HardDrive,
  Radio,
  Smartphone,
  Unlink,
  Layers,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatBytesRate } from '../../utils/formatters';

const COMPONENT_THEMES = {
  amf: {
    accent: '#F59E0B',
    bgLight: 'bg-[#FFF4E5]',
    textLight: 'text-[#F59E0B]',
    borderLight: 'border-[#F6D7A6]',
  },
  smf: {
    accent: '#E99A2E',
    bgLight: 'bg-[#FFF1DD]',
    textLight: 'text-[#D97706]',
    borderLight: 'border-[#F6D7A6]',
  },
  upf: {
    accent: '#059669',
    bgLight: 'bg-[#EAF8F2]',
    textLight: 'text-[#278463]',
    borderLight: 'border-[#C8EBDD]',
  },
  gnb: {
    accent: '#E98A1C',
    bgLight: 'bg-[#FFF1DD]',
    textLight: 'text-[#D97706]',
    borderLight: 'border-[#F6D7A6]',
  },
  ue: {
    accent: '#D97706',
    bgLight: 'bg-[#FFF7E7]',
    textLight: 'text-[#B97819]',
    borderLight: 'border-[#F4E0B7]',
  },
};

export function MetricNode({
  componentKey,
  data,
  roleLabel,
  interfaceLabel,
}) {
  const status = data?.status || 'Unavailable';
  const isAvailable = status === 'UP';
  const isDown = status === 'DOWN';
  const isUnavailable = !isAvailable && !isDown;

  const themeCfg = COMPONENT_THEMES[componentKey] || COMPONENT_THEMES.amf;

  // Icon mapping per 3GPP role
  const getIcon = () => {
    switch (componentKey) {
      case 'amf':
        return Server;
      case 'smf':
        return Layers;
      case 'upf':
        return HardDrive;
      case 'gnb':
        return Radio;
      case 'ue':
        return Smartphone;
      default:
        return Server;
    }
  };

  const Icon = getIcon();

  // Extract primary metric value, unit, and label
  const getPrimaryMetric = () => {
    const metrics = data?.metrics || {};

    if (componentKey === 'amf') {
      const val = metrics.registeredUEs;
      return {
        label: 'Active Subscribers',
        value: val !== 'Unavailable' && val !== undefined ? String(val) : null,
        unit: 'UEs',
        subtext: '5GMM Registered State',
      };
    }

    if (componentKey === 'smf') {
      const val = metrics.activeSessions;
      return {
        label: 'Active PDU Sessions',
        value: val !== 'Unavailable' && val !== undefined ? String(val) : null,
        unit: 'Sessions',
        subtext: '5GSM / PFCP Established',
      };
    }

    if (componentKey === 'upf') {
      const rx = metrics.rxBytesRate;
      const tx = metrics.txBytesRate;
      const hasData = rx !== 'Unavailable' && rx !== undefined;
      return {
        label: 'Data Plane Throughput',
        value: hasData ? formatBytesRate(rx) : null,
        unit: '',
        secondaryValue: hasData ? `Tx: ${formatBytesRate(tx)}` : null,
        subtext: 'Kernel ogstun Device (N3)',
      };
    }

    if (componentKey === 'gnb') {
      const val = metrics.connectedUEs;
      return {
        label: 'Connected Radio UEs',
        value: val !== 'Unavailable' && val !== undefined ? String(val) : null,
        unit: 'UEs',
        subtext: '3GPP Rel-16 NR-SA Carrier',
      };
    }

    if (componentKey === 'ue') {
      const pdu = metrics.pduActive;
      const hasData = pdu !== 'Unavailable' && pdu !== undefined;
      return {
        label: 'Subscriber Data Link',
        value: hasData ? (pdu === 1 ? 'ESTABLISHED' : 'INACTIVE') : null,
        unit: '',
        subtext: 'Interface uesimtun0',
      };
    }

    return { label: 'Operational Status', value: null, unit: '', subtext: '' };
  };

  const metric = getPrimaryMetric();

  return (
    <div className="rounded-[22px] bg-white dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] shadow-square hover:shadow-square-hover transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      {/* Top Accent Line */}
      <div
        className="h-1.5 w-full absolute top-0 left-0 right-0"
        style={{ backgroundColor: themeCfg.accent }}
      />

      {/* Node Top Header */}
      <div className="p-4 pt-[18px] pb-3 border-b border-[#EEF1F5] dark:border-[#2B3B57] flex items-center justify-between gap-1.5 bg-white dark:bg-[#1A2438]">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${themeCfg.bgLight} ${themeCfg.borderLight} ${themeCfg.textLight}`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#17213B] dark:text-[#F8FAFC]">
                {componentKey.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-[#8995A8] font-sans truncate" title={data?.service || ''}>
              {roleLabel || data?.service || 'daemon'}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={status} size="xs" />
        </div>
      </div>

      {/* Main Metric Section */}
      <div className="p-4 py-4 flex-1 flex flex-col justify-center">
        <span className="text-[11px] font-sans text-[#66758B] dark:text-[#AEB8C8] font-medium mb-1 block">
          {metric.label}
        </span>

        {metric.value !== null ? (
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-[#17213B] dark:text-[#F8FAFC]">
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-xs font-sans text-[#8995A8] dark:text-[#AEB8C8] font-semibold">
                {metric.unit}
              </span>
            )}
          </div>
        ) : (
          /* Smart Visual Empty State */
          <div className="flex items-center space-x-2 py-1 text-[#66758B] dark:text-[#AEB8C8]">
            <Unlink className="w-4 h-4 text-[#D97706] shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold font-sans text-[#17213B] dark:text-[#F8FAFC] tracking-wide">
                Unavailable
              </span>
              <span className="text-[10px] font-sans text-[#8995A8] dark:text-[#AEB8C8]">
                Target not reporting metrics
              </span>
            </div>
          </div>
        )}

        {metric.secondaryValue && (
          <p className="text-[11px] font-mono text-[#059669] dark:text-[#10B981] mt-1 font-semibold">
            {metric.secondaryValue}
          </p>
        )}

        <p className="text-[10px] font-sans text-[#8995A8] dark:text-[#AEB8C8] mt-1 truncate">
          {metric.subtext}
        </p>
      </div>

      {/* Technical Protocol Footer */}
      <div className="px-4 py-2.5 border-t border-[#EEF1F5] dark:border-[#2B3B57] bg-[#FBFCFE] dark:bg-[#202C43] flex items-center justify-between text-[10px] font-mono text-[#8995A8] dark:text-[#AEB8C8]">
        <span className="truncate max-w-[130px] font-medium" title={interfaceLabel || data?.protocol || ''}>
          {interfaceLabel || '3GPP Rel-16'}
        </span>
        <span>
          {data?.lastScrape ? new Date(data.lastScrape).toLocaleTimeString([], { hour12: false }) : 'N/A'}
        </span>
      </div>
    </div>
  );
}
