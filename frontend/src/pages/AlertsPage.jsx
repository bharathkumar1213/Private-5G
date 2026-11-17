import React from 'react';
import { AlertsTable } from '../components/AlertsTable';
import { BellRing, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function AlertsPage({ alertsData, loading, error }) {
  return (
    <div className="space-y-6">
      <Card
        title="Alertmanager Incident Hub & Alarm Routing"
        subtitle="3GPP Core & RAN operational threshold monitoring"
        icon={BellRing}
        accentColor="#DC2626"
      >
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
          Real-time incident management powered by Alertmanager API v2. Firing alarms automatically trigger the Alertmanager Recovery Bridge webhook to actuate closed-loop self-healing on verified subsystems.
        </p>
      </Card>

      <AlertsTable alertsData={alertsData} loading={loading} error={error} />
    </div>
  );
}
