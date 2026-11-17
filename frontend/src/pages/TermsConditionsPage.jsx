import React from 'react';
import { FileText, CheckSquare, AlertOctagon, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card
        title="Terms and Conditions of Use"
        subtitle="Private 5G Operations Dashboard & Closed-Loop Control Architecture"
        icon={FileText}
        accentColor="#F59E0B"
        badge={
          <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-0.5 rounded-md border border-[#F59E0B]/30 font-semibold">
            NOC-TERMS-OPS-001
          </span>
        }
      >
        <div className="space-y-6 text-xs text-[#0F172A] dark:text-[#F8FAFC] font-sans leading-relaxed">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F59E0B] dark:text-[#F8B84E] mb-2">
              1. Authorization & Permitted Use
            </h3>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              Access to this Network Operations Center (NOC) dashboard is restricted to authorized telecom engineering personnel, system administrators, and project evaluators. Unauthorized access, automated scraping, denial-of-service attempts, or reverse-engineering of closed-loop recovery hooks is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F59E0B] dark:text-[#F8B84E] mb-2">
              2. Operational Scope of Self-Healing Actions
            </h3>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              The self-healing mechanisms incorporated into this architecture operate on closed-loop feedback loops triggered by Prometheus alarm conditions. Users acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#64748B] dark:text-[#94A3B8] pl-2 mt-1">
              <li>AMF automated service restart has been demonstrated and verified under controlled fault injection.</li>
              <li>SMF, UPF, gNB, and UE recovery mechanisms are marked as awaiting independent verification and may require manual operational intervention during unpredicted multi-failure states.</li>
              <li>The web interface functions strictly as a real-time monitor and does not bypass host-level security gates.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F59E0B] dark:text-[#F8B84E] mb-2">
              3. Telemetry Fidelity & Data Accuracy
            </h3>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              Telemetry metrics displayed on this dashboard represent real measurements scraped from the running Prometheus time-series database and Alertmanager cluster. Simulated success metrics, artificial historical incident records, and synthetic uptime counts are strictly barred by system policy.
            </p>
          </section>

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex justify-between items-center text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
            <span>Effective: November 2026</span>
            <span>Document Reference: NOC-TERMS-OPS-001</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
