import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Terminal,
  ArrowRight,
  AlertTriangle,
  FileCode2,
  CheckCircle2,
  Clock,
  Layers,
  Radio,
} from 'lucide-react';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';

export function SelfHealingPanel({ selfHealingData }) {
  const capabilities = selfHealingData?.capabilities || [];
  const architecture = selfHealingData?.architecture || {};

  const verifiedCaps = capabilities.filter(c => c.verificationStatus === 'VERIFIED');
  const unverifiedCaps = capabilities.filter(c => c.verificationStatus !== 'VERIFIED');

  return (
    <div className="space-y-6">
      {/* Closed-Loop Architecture Header Card */}
      <Card
        title="Closed-Loop Self-Healing Architecture"
        subtitle="Automated failure detection, Alertmanager webhook dispatch, and restricted API remediation"
        icon={ShieldCheck}
        accentColor="#059669"
        badge={
          <span className="text-xs font-mono font-bold text-[#059669] bg-[#059669]/10 px-2.5 py-1 rounded-md border border-[#059669]/30">
            Closed-Loop Orchestration
          </span>
        }
      >
        {/* 4-Stage Multi-Colored Workflow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-2">
          {/* Stage 1: Detection (Cyan) */}
          <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E98A1C]/30 p-4 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="h-1 bg-[#E98A1C] absolute top-0 left-0 right-0" />
            <div>
              <span className="text-[10px] font-mono text-[#E98A1C] font-bold uppercase tracking-wider block mb-1">
                Stage 1 • Detection
              </span>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-sans">
                Prometheus Scrape
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans mt-1.5 leading-relaxed">
                Evaluates service down alert rules across core daemon targets every 5–15 seconds.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              Rule: <span className="text-[#E98A1C] font-bold">AMFServiceDown</span>
            </div>
          </div>

          {/* Stage 2: Routing (Royal Blue) */}
          <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#F59E0B]/30 p-4 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="h-1 bg-[#F59E0B] absolute top-0 left-0 right-0" />
            <div>
              <span className="text-[10px] font-mono text-[#F59E0B] font-bold uppercase tracking-wider block mb-1">
                Stage 2 • Routing
              </span>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-sans">
                Alertmanager Webhook
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans mt-1.5 leading-relaxed">
                Dispatches active firing alarms to Alertmanager Recovery Bridge without human intervention.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              Receiver: <span className="text-[#F59E0B] font-bold">recovery-bridge</span>
            </div>
          </div>

          {/* Stage 3: Remediation (secondary blue) */}
          <div className="rounded-xl bg-[#F5F7FA] dark:bg-[#202C43] border border-[#E99A2E]/30 p-4 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="h-1 bg-[#E99A2E] absolute top-0 left-0 right-0" />
            <div>
              <span className="text-[10px] font-mono text-[#D97706] font-bold uppercase tracking-wider block mb-1">
                Stage 3 • Remediation
              </span>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-sans">
                Python Recovery API
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans mt-1.5 leading-relaxed">
                Executes targeted service restart (systemctl) and verifies SCTP socket binding on port 38412.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              Target: <span className="text-[#D97706] font-bold">open5gs-amfd.service</span>
            </div>
          </div>

          {/* Stage 4: Re-Attachment (Emerald) */}
          <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#059669]/30 p-4 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="h-1 bg-[#059669] absolute top-0 left-0 right-0" />
            <div>
              <span className="text-[10px] font-mono text-[#059669] font-bold uppercase tracking-wider block mb-1">
                Stage 4 • Re-Attachment
              </span>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-sans">
                UE Recovery Trigger
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans mt-1.5 leading-relaxed">
                Re-triggers simulated radio attachment, 5GMM registration, and PDU session re-establishment.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              Interface: <span className="text-[#059669] font-bold">uesimtun0</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Verified Recovery Capabilities */}
      <Card
        title="Verified Recovery Capabilities"
        subtitle="Rigorously demonstrated and proven through controlled fault injection testing"
        icon={CheckCircle2}
        accentColor="#059669"
        badge={
          <span className="text-xs font-sans font-semibold text-[#059669] bg-[#059669]/10 px-2.5 py-1 rounded-md border border-[#059669]/30">
            Verified Test Result
          </span>
        }
      >
        <div className="space-y-4">
          {verifiedCaps.map((cap) => (
            <div
              key={cap.id}
              className="rounded-lg bg-[#059669]/5 dark:bg-[#059669]/10 border border-[#059669]/40 p-5 shadow-card"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#059669]/20">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
                  <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-sans">
                    {cap.component}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#059669] bg-[#059669]/15 px-2.5 py-0.5 rounded-md border border-[#059669]/30 self-start sm:self-auto">
                  Demonstrated Successful Recovery
                </span>
              </div>

              <p className="text-xs text-[#059669] dark:text-[#10B981] font-sans mt-3 leading-relaxed">
                <strong className="font-bold">Verification Audit: </strong>
                {cap.verificationNote}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs font-sans">
                <div className="rounded-md bg-[#FFFFFF] dark:bg-[#1E293B] p-3 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px] font-bold mb-1">
                    Action Trigger
                  </span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs">{cap.actionTrigger}</span>
                </div>
                <div className="rounded-md bg-[#FFFFFF] dark:bg-[#1E293B] p-3 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px] font-bold mb-1">
                    Remediation Mechanism
                  </span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs">{cap.remediationMechanism}</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-md bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-sans text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                <span>Verification Scope: <strong>{cap.scope}</strong></span>
                <span className="font-mono text-[#059669] font-bold">Tested & Confirmed</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Unverified Capabilities */}
      <Card
        title="Unverified / Simulated Recovery Pipelines"
        subtitle="Distinguished clearly from demonstrated lab test results"
        icon={AlertTriangle}
        accentColor="#D97706"
        badge={
          <span className="text-xs font-sans font-semibold text-[#D97706] bg-[#D97706]/10 px-2.5 py-1 rounded-md border border-[#D97706]/30">
            Audit Pending
          </span>
        }
      >
        <div className="space-y-4">
          {unverifiedCaps.map((cap) => (
            <div
              key={cap.id}
              className="rounded-lg bg-[#D97706]/5 dark:bg-[#D97706]/10 border border-[#D97706]/30 p-5 shadow-card"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D97706]/20">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-sans">
                    {cap.component}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#D97706] bg-[#D97706]/15 px-2.5 py-0.5 rounded-md border border-[#D97706]/30 self-start sm:self-auto">
                  Audit Pending / Mock Guard
                </span>
              </div>

              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans mt-3 leading-relaxed">
                {cap.verificationNote}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs font-sans">
                <div className="rounded-md bg-[#FFFFFF] dark:bg-[#1E293B] p-3 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px] font-bold mb-1">
                    Action Trigger
                  </span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs">{cap.actionTrigger}</span>
                </div>
                <div className="rounded-md bg-[#FFFFFF] dark:bg-[#1E293B] p-3 border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px] font-bold mb-1">
                    Remediation Mechanism
                  </span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs">{cap.remediationMechanism}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
