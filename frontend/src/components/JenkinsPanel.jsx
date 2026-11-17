import React from 'react';
import {
  Cpu,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  Terminal,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { formatDate } from '../utils/formatters';

export function JenkinsPanel({ jenkinsData, loading }) {
  const isAvailable = jenkinsData?.available ?? false;
  const status = jenkinsData?.status || 'Integration pending';
  const jobName = jenkinsData?.jobName || 'Unavailable';
  const reason = jenkinsData?.reason || 'Jenkins automation endpoint not configured in backend environment';
  const lastBuild = jenkinsData?.lastBuildDetails;

  return (
    <div className="space-y-6">
      {/* Jenkins Pipeline Status Card */}
      <Card
        title="Jenkins CI/CD Pipeline Automation"
        subtitle="Automated deployment pipelines and recovery artifact promotion"
        icon={Cpu}
        accentColor="#E99A2E"
        badge={<StatusBadge status={isAvailable ? status : 'PENDING'} size="sm" />}
      >
        {isAvailable ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-sans">
              <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] p-4 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
                <span className="text-[#64748B] dark:text-[#94A3B8] block text-xs font-bold mb-1">
                  Monitored Pipeline
                </span>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold text-lg font-mono block">
                  {jobName}
                </span>
              </div>

              <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] p-4 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
                <span className="text-[#64748B] dark:text-[#94A3B8] block text-xs font-bold mb-1">
                  Last Build Number
                </span>
                <span className="text-[#059669] font-bold text-2xl font-mono block">
                  #{jenkinsData?.lastBuildNumber || 'N/A'}
                </span>
              </div>

              <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] p-4 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
                <span className="text-[#64748B] dark:text-[#94A3B8] block text-xs font-bold mb-1">
                  Execution Result
                </span>
                <span
                  className={`font-bold text-lg font-sans block ${
                    lastBuild?.result === 'SUCCESS' ? 'text-[#059669]' : 'text-[#D97706]'
                  }`}
                >
                  {lastBuild?.result || 'IN PROGRESS'}
                </span>
              </div>
            </div>

            {lastBuild && (
              <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] p-4 border border-[#E2E8F0] dark:border-[#334155] text-xs font-sans space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0] dark:border-[#334155]">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Timestamp:</span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono">{formatDate(lastBuild.timestamp)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0] dark:border-[#334155]">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Execution Duration:</span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono">
                    {lastBuild.durationMs ? `${(lastBuild.durationMs / 1000).toFixed(1)}s` : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Build State:</span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono font-bold">
                    {lastBuild.building ? 'IN PROGRESS' : 'COMPLETED'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Smart Visual Empty State for Pending Integration */
          <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-dashed border-[#CBD5E1] dark:border-[#334155] p-6 text-xs font-sans">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-[#EDF2F7] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#F59E0B] dark:text-[#F8B84E] shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-[#F59E0B] dark:text-[#F8B84E]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  Status: Integration Pending
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  {reason}
                </p>

                <div className="mt-4 p-3.5 rounded-md bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs text-[#0F172A] dark:text-[#F8FAFC] space-y-1.5 font-mono shadow-sm">
                  <span className="text-[#F59E0B] dark:text-[#F8B84E] font-bold block mb-1 text-[11px] uppercase tracking-wider font-sans">
                    To Enable Jenkins Automation Telemetry Securely:
                  </span>
                  <p>1. Open <code className="text-[#F59E0B] dark:text-[#F8B84E]">backend/.env</code> on the host machine.</p>
                  <p>2. Configure <code className="text-[#F59E0B] dark:text-[#F8B84E]">JENKINS_URL</code>, <code className="text-[#F59E0B] dark:text-[#F8B84E]">JENKINS_USER</code>, and <code className="text-[#F59E0B] dark:text-[#F8B84E]">JENKINS_API_TOKEN</code>.</p>
                  <p>3. Restart the backend proxy process via systemctl.</p>
                  <p className="pt-2 text-[#64748B] dark:text-[#94A3B8] italic text-[11px] font-sans">
                    Note: Jenkins credentials remain strictly server-side and are never transmitted to or bundled in frontend assets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Security Architecture Card */}
      <Card
        title="CI/CD Security & Credential Isolation"
        subtitle="Zero client-side secrets policy across all monitoring views"
        icon={Shield}
        accentColor="#F59E0B"
      >
        <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-[#94A3B8] font-sans list-disc list-inside">
          <li>
            <strong className="text-[#0F172A] dark:text-[#F8FAFC]">Zero client-side credential storage: </strong>
            Tokens and passwords are never exposed in browser scripts or DOM.
          </li>
          <li>
            <strong className="text-[#0F172A] dark:text-[#F8FAFC]">Recovery action safety: </strong>
            Automated self-healing operations are governed exclusively by the restricted Python API on the backend host; the web dashboard functions as a read-only telemetry and status observer.
          </li>
          <li>
            <strong className="text-[#0F172A] dark:text-[#F8FAFC]">Host firewall isolation: </strong>
            External access is restricted through the reverse proxy layer.
          </li>
        </ul>
      </Card>
    </div>
  );
}
