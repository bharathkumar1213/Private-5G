import React from 'react';
import {
  Terminal,
  Server,
  Radio,
  Database,
  BellRing,
  Cpu,
  HardDrive,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { formatDate } from '../utils/formatters';

export function SystemDiagnostics({ systemData, loading }) {
  const prom = systemData?.monitoringInfrastructure?.prometheus;
  const am = systemData?.monitoringInfrastructure?.alertmanager;
  const subsystems = systemData?.subsystems || [];
  const platform = systemData?.platform || {};

  return (
    <div className="space-y-6">
      {/* Platform Architecture Overview */}
      <Card
        title="Host Platform & Kernel Environment"
        subtitle="Underlying operating system, Linux kernel ogstun tunnel driver, and architecture"
        icon={Terminal}
        accentColor="#F59E0B"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-sans">
          <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] p-4 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
            <span className="text-[#64748B] dark:text-[#94A3B8] block text-xs font-bold mb-1">
              Target Operating System
            </span>
            <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold text-sm block">
              {platform.os || 'Ubuntu 24.04 LTS'}
            </span>
          </div>

          <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] p-4 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
            <span className="text-[#64748B] dark:text-[#94A3B8] block text-xs font-bold mb-1">
              Architecture
            </span>
            <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold text-sm block">
              {platform.architecture || 'x86_64 / Linux'}
            </span>
          </div>

          <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] p-4 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
            <span className="text-[#64748B] dark:text-[#94A3B8] block text-xs font-bold mb-1">
              User Plane Kernel Driver
            </span>
            <span className="text-[#059669] font-bold text-sm block font-mono">
              {platform.kernel || 'Linux 6.8+ (ogstun active)'}
            </span>
          </div>
        </div>
      </Card>

      {/* Subsystem Health Grid */}
      <Card
        title="5G Core & RAN Systemd Service Daemons"
        subtitle="Process isolation and systemd lifecycle status on Ubuntu host"
        icon={Server}
        accentColor="#E99A2E"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs font-sans">
          {subsystems.map((sub) => (
            <div
              key={sub.id}
              className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-3.5 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                    {sub.name}
                  </span>
                  <StatusBadge status={sub.status} size="xs" />
                </div>
                <code className="text-[11px] font-mono text-[#F59E0B] dark:text-[#F8B84E] block mb-2 font-semibold">
                  {sub.service}
                </code>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  {sub.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] flex justify-between items-center text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                <span>Port: {sub.port || 'Internal'}</span>
                <span>Type: {sub.plane || 'Core'}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monitoring Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prometheus Diagnostics */}
        <Card
          title="Prometheus TSDB Engine"
          subtitle="Metrics scraping and alerting rule evaluation pipeline"
          icon={Database}
          accentColor="#E98A1C"
          badge={<StatusBadge status={prom?.connected ? 'UP' : 'UNAVAILABLE'} size="sm" />}
        >
          <div className="space-y-2.5 text-xs font-sans">
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Target URI:</span>
              <code className="text-[#F59E0B] dark:text-[#F8B84E] font-mono font-semibold">{prom?.endpoint || 'http://172.17.0.1:19091'}</code>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Version:</span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono">{prom?.version || 'Prometheus 2.x LTS'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Config Reload:</span>
              <span className={`font-mono font-bold ${prom?.reloadConfigSuccess ? 'text-[#059669]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
                {prom?.reloadConfigSuccess ? 'SUCCESS' : 'IDLE / NOT_REQUIRED'}
              </span>
            </div>
          </div>
        </Card>

        {/* Alertmanager Diagnostics */}
        <Card
          title="Alertmanager Incident Dispatcher"
          subtitle="Alert deduplication, grouping, and recovery webhook bridge"
          icon={BellRing}
          accentColor="#F5A623"
          badge={<StatusBadge status={am?.connected ? 'UP' : 'UNAVAILABLE'} size="sm" />}
        >
          <div className="space-y-2.5 text-xs font-sans">
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Target URI:</span>
              <code className="text-[#F5A623] font-mono font-semibold">{am?.endpoint || 'http://172.17.0.1:19093'}</code>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Version:</span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono">{am?.version || 'Alertmanager 0.27+'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Cluster Status:</span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono uppercase font-bold">{am?.clusterStatus || 'STANDALONE'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
