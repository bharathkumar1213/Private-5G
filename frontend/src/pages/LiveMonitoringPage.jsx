import React from 'react';
import { LiveCharts } from '../components/LiveCharts';
import { LineChart, Radio, Database, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function LiveMonitoringPage({ liveMetricsData, loading }) {
  return (
    <div className="space-y-6">
      <Card
        title="Live Prometheus Telemetry Engine"
        subtitle="Time-series query telemetry evaluating 5G Core control and user plane metrics"
        icon={LineChart}
        accentColor="#F59E0B"
        badge={
          <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-md border border-[#F59E0B]/30">
            TSDB Resolution: 15s
          </span>
        }
      >
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
          Direct time-series range queries evaluating Open5GS 5G Core signaling, UERANSIM radio links, and kernel user plane throughput. Graphs reflect real Prometheus TSDB points over a 15-minute sliding window. Missing series display an explicit empty state rather than simulated curves.
        </p>
      </Card>

      <LiveCharts liveMetricsData={liveMetricsData} loading={loading} />
    </div>
  );
}
