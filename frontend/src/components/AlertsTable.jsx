import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Filter,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Card } from './ui/Card';
import { formatDate } from '../utils/formatters';

export function AlertsTable({ alertsData, loading, error }) {
  const [filterState, setFilterState] = useState('active'); // 'all', 'active', 'resolved'

  const activeFiring = alertsData?.activeFiring || [];
  const resolvedOrSuppressed = alertsData?.resolvedOrSuppressed || [];
  const prometheusAlerts = alertsData?.prometheusAlerts || [];

  const allAlerts = [...activeFiring, ...resolvedOrSuppressed];

  const displayedAlerts =
    filterState === 'all'
      ? allAlerts
      : filterState === 'active'
      ? activeFiring
      : resolvedOrSuppressed;

  const getSeverityBadge = (severity) => {
    const sev = (severity || 'warning').toLowerCase();
    if (sev === 'critical') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 text-[11px] font-sans font-bold uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          <span>Critical</span>
        </span>
      );
    }
    if (sev === 'warning' || sev === 'warn') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 text-[11px] font-sans font-bold uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          <span>Warning</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-[11px] font-sans font-bold uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
        <span>Info</span>
      </span>
    );
  };

  const getStateBadge = (state) => {
    const st = (state || 'active').toLowerCase();
    if (st === 'active' || st === 'firing') {
      return (
        <span className="inline-flex items-center space-x-1.5 text-[#DC2626] font-sans text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
          <span>Firing</span>
        </span>
      );
    }
    if (st === 'suppressed' || st === 'silenced') {
      return (
        <span className="inline-flex items-center space-x-1.5 text-[#D97706] font-sans text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#D97706]" />
          <span>Suppressed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 text-[#059669] font-sans text-xs font-bold">
        <span className="w-2 h-2 rounded-full bg-[#059669]" />
        <span>Resolved</span>
      </span>
    );
  };

  return (
    <Card noPadding className="shadow-card overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-[#EEF1F5] dark:border-[#2B3B57] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#1A2438]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F8B84E]/15 dark:text-[#F8B84E] shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight font-sans">
              Alert Inventory & Alarm Management
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans mt-0.5">
              Live Alertmanager API v2 feed for 5G Core, RAN, and Host daemons
            </p>
          </div>
        </div>

        {/* Filter Controls with Clean High-Contrast Buttons */}
        <div className="flex items-center space-x-1 bg-[#F5F7FA] dark:bg-[#202C43] p-1 rounded-xl border border-[#E9EDF2] dark:border-[#2B3B57] text-xs font-sans self-start md:self-auto">
          <button
            onClick={() => setFilterState('active')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              filterState === 'active'
                ? 'bg-[#DC2626] text-white shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Active ({activeFiring.length})
          </button>
          <button
            onClick={() => setFilterState('resolved')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              filterState === 'resolved'
                ? 'bg-[#059669] text-white shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Resolved ({resolvedOrSuppressed.length})
          </button>
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              filterState === 'all'
                ? 'bg-[#F59E0B] text-white shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            All ({allAlerts.length})
          </button>
        </div>
      </div>

      {/* Connectivity Alert Notice if any */}
      {alertsData?.errors?.alertmanager && (
        <div className="bg-[#DC2626]/10 border-b border-[#DC2626]/20 p-3 px-5 text-xs font-sans text-[#DC2626] flex items-center space-x-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          <span>Alertmanager notice: {alertsData.errors.alertmanager}. Live alarm state cannot be verified from http://172.17.0.1:19093.</span>
        </div>
      )}

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans border-collapse">
          <thead>
            <tr className="bg-[#FBFCFE] dark:bg-[#202C43] border-b border-[#EEF1F5] dark:border-[#2B3B57] text-[#8995A8] dark:text-[#AEB8C8] font-semibold">
              <th className="py-3 px-5">Alert Name</th>
              <th className="py-3 px-4">Component</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">Active Since</th>
              <th className="py-3 px-5">Summary & Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {displayedAlerts.length > 0 ? (
              displayedAlerts.map((alert, idx) => (
                <tr
                  key={alert.fingerprint || idx}
                  className="hover:bg-[#F1F4F8] dark:hover:bg-[#1E293B] transition-colors"
                >
                  <td className="py-3 px-5 font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {alert.labels?.alertname || alert.name || 'UnnamedAlert'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[#F59E0B] dark:text-[#F8B84E] bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {alert.labels?.component || alert.labels?.job || 'core'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getSeverityBadge(alert.labels?.severity)}</td>
                  <td className="py-3 px-4">{getStateBadge(alert.status?.state || alert.state)}</td>
                  <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8] font-mono text-[11px]">
                    {formatDate(alert.startsAt || alert.activeAt)}
                  </td>
                  <td className="py-3 px-5 text-[#64748B] dark:text-[#94A3B8] max-w-xs truncate">
                    {alert.annotations?.summary || alert.annotations?.description || 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8]">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {filterState === 'active'
                        ? 'Zero Active Firing Alarms'
                        : 'No alerts matching current filter'}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      All monitored 5G functions report nominal threshold states
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
