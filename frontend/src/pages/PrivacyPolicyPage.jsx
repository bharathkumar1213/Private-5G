import React from 'react';
import { Shield, Lock, Eye, Database, Server } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card
        title="Privacy Policy"
        subtitle="Private 5G Network Operations & Closed-Loop Telemetry Platform"
        icon={Shield}
        accentColor="#F59E0B"
        badge={
          <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-0.5 rounded-md border border-[#F59E0B]/30 font-semibold">
            NOC-SEC-POL-001
          </span>
        }
      >
        <div className="space-y-6 text-xs text-[#0F172A] dark:text-[#F8FAFC] font-sans leading-relaxed">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F59E0B] dark:text-[#F8B84E] mb-2">
              1. Scope & System Purpose
            </h3>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              This Privacy Policy governs the collection, processing, and handling of operational telemetry within the DevOps-Based Monitoring and Self-Healing Private 5G Network Platform. The system functions exclusively as an enterprise operational tool designed for private cellular infrastructure management, performance observability, and automated fault recovery in conformance with 3GPP Release 16 specifications.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F59E0B] dark:text-[#F8B84E] mb-2">
              2. Data Collected & Telemetry Boundaries
            </h3>
            <p className="mb-2 text-[#64748B] dark:text-[#94A3B8]">
              The monitoring proxy collects strictly operational and network management metadata necessary to verify service availability and self-healing actuation:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#64748B] dark:text-[#94A3B8] pl-2">
              <li>Core Network Function availability metrics (Open5GS AMF, SMF, UPF target status and scrape duration).</li>
              <li>Radio Access Network connectivity statistics (UERANSIM gNB SCTP associations, RRC connection state).</li>
              <li>Aggregate subscriber session counts (anonymized 5GMM registration states, PDU session counts).</li>
              <li>User plane throughput rates (Rx/Tx byte volume on the kernel ogstun tunnel device).</li>
              <li>Systemd service process lifecycle events, CPU/memory utilization, and kernel interface status.</li>
            </ul>
            <p className="mt-2 text-[#64748B] dark:text-[#94A3B8]">
              The system DOES NOT inspect, store, log, or decrypt subscriber user-plane payloads, call records, private messaging content, or unencrypted IMSI identities.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F59E0B] dark:text-[#F8B84E] mb-2">
              3. Telemetry Storage & Retention
            </h3>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              Telemetry metrics are stored transiently within the local Prometheus Time Series Database (TSDB) with standard retention policies (default: 15 days). All metrics remain within the isolated host environment and are not shared with, sold to, or syndicated across third-party analytics services.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F59E0B] dark:text-[#F8B84E] mb-2">
              4. Security & Credential Isolation
            </h3>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              Backend API credentials, recovery tokens, Alertmanager webhooks, and optional Jenkins automation tokens reside exclusively on the server side in secure environment variables. Client browser bundles and frontend assets are completely isolated from administrative credentials.
            </p>
          </section>

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex justify-between items-center text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
            <span>Effective: November 2026</span>
            <span>Document Reference: NOC-SEC-POL-001</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
