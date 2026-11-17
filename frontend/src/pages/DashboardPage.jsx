import React from 'react';
import { NetworkHealthBanner } from '../components/NetworkHealthBanner';
import { Looker5GFunnelAndDonuts } from '../components/Looker5GFunnelAndDonuts';
import { LiveWorkflowAnimation } from '../components/LiveWorkflowAnimation';
import { NetworkTopology } from '../components/NetworkTopology';
import { LiveCharts } from '../components/LiveCharts';
import { AlertsTable } from '../components/AlertsTable';
import { Card } from '../components/ui/Card';
import { ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage({
  overviewData,
  liveMetricsData,
  alertsData,
  selfHealingData,
  loading,
  error,
}) {
  return (
    <div className="space-y-6">
      {/* 1. Looker Top Executive KPI Cards */}
      <NetworkHealthBanner
        overviewData={overviewData}
        loading={loading}
        error={error}
      />

      {/* 2. Interactive 3D Digital Twin & Live 5G Architecture Workflow */}
      <LiveWorkflowAnimation
        overviewData={overviewData}
        alertsData={alertsData}
        selfHealingData={selfHealingData}
        loading={loading}
      />

      {/* 3. Looker Executive Visuals: Lead-to-Win Funnel & Domain Distribution Donuts */}
      <Looker5GFunnelAndDonuts
        overviewData={overviewData}
        liveMetricsData={liveMetricsData}
      />

      {/* 3. Five Component Status Cards */}
      <NetworkTopology
        overviewData={overviewData}
        loading={loading}
      />

      {/* 4. Live Telemetry Charts */}
      <LiveCharts
        liveMetricsData={liveMetricsData}
        loading={loading}
      />

      {/* 5. Recent Actual Alerts and Recovery Status */}
      <AlertsTable
        alertsData={alertsData}
        loading={loading}
        error={error}
      />

      {/* Subsystem Drilldown Interactive Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/self-healing" className="block group">
          <Card
            variant="interactive"
            title="Automated Self-Healing Pipeline"
            subtitle="Demonstrated AMF recovery and closed-loop Alertmanager hooks"
            icon={ShieldCheck}
            action={
              <span className="text-xs font-semibold text-[#F59E0B] dark:text-[#F8B84E] group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                <span>Inspect Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            }
          >
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
              Review closed-loop remediation workflows, socket re-bind verification, and separation between demonstrated lab recoveries and unverified pipelines.
            </p>
          </Card>
        </Link>

        <Link to="/automation" className="block group">
          <Card
            variant="interactive"
            title="Jenkins CI/CD Pipeline Automation"
            subtitle="Server-side build verification and artifact promotion"
            icon={Cpu}
            accentColor="#E99A2E"
            action={
              <span className="text-xs font-semibold text-[#D97706] dark:text-[#F8C877] group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                <span>Inspect Automation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            }
          >
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
              Monitors automated deployment jobs and self-healing artifacts with strict server-side credential isolation and zero frontend token exposure.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
