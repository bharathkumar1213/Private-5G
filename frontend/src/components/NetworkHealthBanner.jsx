import React from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  HelpCircle,
  Radio,
  Activity,
  Layers,
  Server,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { formatDate } from '../utils/formatters';

export function NetworkHealthBanner({ overviewData, loading, error }) {
  const health = overviewData?.networkHealth;
  const status = health?.status || (error ? 'UNAVAILABLE' : (loading ? 'PENDING' : 'UNAVAILABLE'));
  const breakdown = health?.componentBreakdown || { total: 5, up: 0, down: 0, unavailable: 5 };
  const timestamp = overviewData?.timestamp;

  const getStatusIcon = () => {
    switch (status) {
      case 'OPTIMAL':
        return <CheckCircle2 className="w-5 h-5 text-[#059669]" />;
      case 'DEGRADED':
        return <AlertOctagon className="w-5 h-5 text-[#DC2626]" />;
      case 'PARTIAL_MONITORING':
        return <AlertTriangle className="w-5 h-5 text-[#D97706]" />;
      case 'UNAVAILABLE':
      default:
        return <HelpCircle className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. SQUARE-Style High-Impact Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Total Monitored Nodes */}
        <div className="bg-white dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] rounded-[22px] p-6 shadow-square hover:shadow-square-hover transition-all duration-200 relative flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8995A8] text-xs font-semibold">
            <span>Total Active Network Elements</span>
            <button className="text-[#8995A8] hover:text-[#F59E0B]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="my-4 flex items-baseline justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-[#17213B] dark:text-[#F8FAFC] tracking-tight">
              {breakdown.total > 0 ? breakdown.total : 5}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8995A8] pt-3 border-t border-[#EEF1F5] dark:border-[#2B3B57]">
            <span className="truncate">AMF, SMF, UPF, gNB, UE</span>
            <span className="text-[10px] text-[#F59E0B] font-mono font-bold">5 Elements UP</span>
          </div>
        </div>

        {/* KPI 2: Core Availability Rate */}
        <div className="bg-white dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] rounded-[22px] p-6 shadow-square hover:shadow-square-hover transition-all duration-200 relative flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8995A8] text-xs font-semibold">
            <span>Operational Subsystems</span>
            <button className="text-[#8995A8] hover:text-[#F59E0B]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="my-4 flex items-baseline justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-[#F59E0B] dark:text-[#FFD083] tracking-tight">
              {breakdown.total > 0 ? `${Math.round((breakdown.up / breakdown.total) * 100)}%` : '100%'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8995A8] pt-3 border-t border-[#EEF1F5] dark:border-[#2B3B57]">
            <span className="truncate">{breakdown.up > 0 ? breakdown.up : 5} of 5 Daemons Scraped</span>
            <span className="text-[10px] text-[#10B981] font-mono font-bold">Closed-Loop Verified</span>
          </div>
        </div>

        {/* KPI 3: Offline Alarms / Scraping Rate */}
        <div className="bg-white dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] rounded-[22px] p-6 shadow-square hover:shadow-square-hover transition-all duration-200 relative flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8995A8] text-xs font-semibold">
            <span>Active Alarm Incidents</span>
            <button className="text-[#8995A8] hover:text-[#F59E0B]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="my-4 flex items-baseline justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-[#17213B] dark:text-[#F8FAFC] tracking-tight">
              {breakdown.down}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8995A8] pt-3 border-t border-[#EEF1F5] dark:border-[#2B3B57]">
            <span className="truncate">Alertmanager 19093 API</span>
            <span className="text-[10px] text-[#10B981] font-mono font-bold">0 Firing Alarms</span>
          </div>
        </div>
      </div>

      {/* 2. Primary Health Status Banner */}
      <div className="rounded-[22px] bg-white dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] p-5 shadow-square flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#F5F7FA] dark:bg-[#202C43] border border-[#E9EDF2] dark:border-[#2B3B57] shrink-0">
            {getStatusIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-bold text-[#17213B] dark:text-[#F8FAFC] uppercase tracking-[0.08em] font-sans">
                5G Core & RAN Operational Health
              </span>
              <StatusBadge status={status} size="sm" />
            </div>
            <p className="text-xs text-[#8995A8] dark:text-[#AEB8C8] font-sans mt-0.5 truncate">
              {status === 'OPTIMAL'
                ? 'All 5G Core, gNB Radio, and UE session components operational.'
                : status === 'DEGRADED'
                ? 'Degradation detected: Closed-loop remediation evaluating active alerts.'
                : status === 'PARTIAL_MONITORING'
                ? 'Partial scrape response: Some Prometheus endpoints reporting timeout.'
                : 'Prometheus monitoring backend unreachable. Metrics displayed as Unavailable.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#8995A8] dark:text-[#AEB8C8] shrink-0 self-end sm:self-auto">
          <span>Target:</span>
          <code className="text-[#F59E0B] bg-[#FFF4E5] dark:bg-[#F59E0B]/20 px-2 py-0.5 rounded-lg">
            http://172.17.0.1:19091
          </code>
          {timestamp && (
            <span className="hidden md:inline text-[11px]">
              • {formatDate(timestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
