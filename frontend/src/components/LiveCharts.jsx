import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { LineChart as ChartIcon, Unlink, Activity, Radio, HardDrive, Layers, PieChart } from 'lucide-react';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { formatBytesRate } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] p-2.5 rounded-md text-xs font-mono shadow-xl">
        <p className="text-[#64748B] dark:text-[#94A3B8] mb-1.5 text-[11px] font-semibold">{`Time: ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center space-x-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">{entry.name}:</span>
            <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {entry.value !== undefined
                ? unit === 'bytes'
                  ? formatBytesRate(entry.value)
                  : `${entry.value} ${unit}`
                : 'Unavailable'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function LiveCharts({ liveMetricsData, loading }) {
  const metrics = liveMetricsData?.metrics || {};

  const registeredUEsData = metrics.registeredUEs || [];
  const smfSessionsData = metrics.smfSessions || [];
  const gnbConnectedData = metrics.gnbConnectedUEs || [];
  const upfRxData = metrics.upfThroughputRx || [];
  const upfTxData = metrics.upfThroughputTx || [];

  // Merge UPF Rx & Tx for throughput chart
  const upfMerged = upfRxData.map((item, idx) => {
    const txMatch = upfTxData[idx];
    return {
      timeStr: item.timeStr,
      rxRate: item.value,
      txRate: txMatch ? txMatch.value : 0,
    };
  });

  const hasRegisteredUeData = registeredUEsData.length > 0;
  const hasSmfData = smfSessionsData.length > 0;
  const hasUpfData = upfMerged.length > 0;
  const hasGnbData = gnbConnectedData.length > 0;

  const latestAmfVal = hasRegisteredUeData ? registeredUEsData[registeredUEsData.length - 1]?.value : null;
  const latestSmfVal = hasSmfData ? smfSessionsData[smfSessionsData.length - 1]?.value : null;
  const latestGnbVal = hasGnbData ? gnbConnectedData[gnbConnectedData.length - 1]?.value : null;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F8B84E]/15 dark:text-[#F8B84E]">
            <ChartIcon className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider font-sans">
            Real-Time Telemetry & Performance Charts
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span>Prometheus 15-Min Sliding Window</span>
        </div>
      </div>

      {/* Grid of 4 Multi-Colored Looker-Style Telemetry Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Widget 1: AMF Registered Subscribers (Royal Blue) */}
        <Card
          title="AMF — Registered Subscribers"
          subtitle="Metric: open5gs_amf_registered_ue_total"
          icon={Layers}
          accentColor="#F59E0B"
          badge={
            latestAmfVal !== null ? (
              <span className="text-[11px] font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                {latestAmfVal} UEs
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] bg-[#F1F4F8] dark:bg-[#0F172A] px-2 py-0.5 rounded border border-[#CBD5E1] dark:border-[#334155]">
                5GMM State
              </span>
            )
          }
          className="h-full"
        >
          <div className="h-56 w-full pt-2">
            {hasRegisteredUeData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registeredUEsData}>
                  <defs>
                    <linearGradient id="colorAmf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="timeStr"
                    stroke="#94A3B8"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip unit="UEs" />} />
                  <Area
                    type="stepAfter"
                    dataKey="value"
                    name="Registered Subscribers"
                    stroke="#F59E0B"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#colorAmf)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Unlink}
                title="Telemetry Unavailable — Subscribers"
                message="No AMF subscriber registration metrics reporting from Prometheus."
                compact
                className="h-full"
              />
            )}
          </div>
        </Card>

        {/* Widget 2: SMF Active PDU Sessions (clear secondary blue) */}
        <Card
          title="SMF — Active PDU Sessions"
          subtitle="Metric: open5gs_smf_pdu_sessions_total"
          icon={Activity}
          accentColor="#E99A2E"
          badge={
            latestSmfVal !== null ? (
              <span className="text-[11px] font-mono font-bold text-[#D97706] bg-[#FFF1DD] px-2 py-0.5 rounded-lg border border-[#F6D7A6]">
                {latestSmfVal} Sessions
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] bg-[#F1F4F8] dark:bg-[#0F172A] px-2 py-0.5 rounded border border-[#CBD5E1] dark:border-[#334155]">
                PFCP / 5GSM
              </span>
            )
          }
          className="h-full"
        >
          <div className="h-56 w-full pt-2">
            {hasSmfData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={smfSessionsData}>
                  <defs>
                    <linearGradient id="colorSmf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E99A2E" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#E99A2E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="timeStr"
                    stroke="#94A3B8"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip unit="Sessions" />} />
                  <Area
                    type="stepAfter"
                    dataKey="value"
                    name="PDU Sessions"
                    stroke="#E99A2E"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#colorSmf)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Unlink}
                title="Telemetry Unavailable — Session Counters"
                message="No SMF active PDU session counters available from Prometheus."
                compact
                className="h-full"
              />
            )}
          </div>
        </Card>

        {/* Widget 3: UPF Data Plane Throughput (Electric Cyan + Golden Amber) */}
        <Card
          title="UPF — Data Plane Throughput (Rx / Tx)"
          subtitle="Interface: ogstun kernel device (GTP-U Port 2152)"
          icon={HardDrive}
          accentColor="#E98A1C"
          badge={
            <span className="text-[10px] font-mono text-[#E98A1C] bg-[#E98A1C]/10 px-2 py-0.5 rounded border border-[#E98A1C]/30 font-semibold">
              N3 User Plane
            </span>
          }
          className="h-full"
        >
          <div className="h-56 w-full pt-2">
            {hasUpfData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={upfMerged}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="timeStr"
                    stroke="#94A3B8"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                  />
                  <Tooltip content={<CustomTooltip unit="bytes" />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', paddingTop: '4px' }} />
                  <Line
                    type="monotone"
                    dataKey="rxRate"
                    name="Downlink Rx (Bytes/s)"
                    stroke="#F59E0B"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="txRate"
                    name="Uplink Tx (Bytes/s)"
                    stroke="#F5A623"
                    strokeWidth={2.2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Unlink}
                title="Telemetry Unavailable — Interface Throughput"
                message="Kernel ogstun device counters not reporting to Prometheus exporter."
                compact
                className="h-full"
              />
            )}
          </div>
        </Card>

        {/* Widget 4: gNodeB Connected Radio Link UEs (Emerald Green) */}
        <Card
          title="gNodeB — Connected Radio UEs"
          subtitle="Radio Simulation: UERANSIM 3GPP Rel-16 NR-SA"
          icon={Radio}
          accentColor="#059669"
          badge={
            latestGnbVal !== null ? (
              <span className="text-[11px] font-mono font-bold text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded border border-[#059669]/30">
                Connected: {latestGnbVal}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] bg-[#F1F4F8] dark:bg-[#0F172A] px-2 py-0.5 rounded border border-[#CBD5E1] dark:border-[#334155]">
                RRC Connected
              </span>
            )
          }
          className="h-full"
        >
          <div className="h-56 w-full pt-2">
            {hasGnbData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gnbConnectedData}>
                  <defs>
                    <linearGradient id="colorGnb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="timeStr"
                    stroke="#94A3B8"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip unit="UEs" />} />
                  <Area
                    type="stepAfter"
                    dataKey="value"
                    name="Connected Radio UEs"
                    stroke="#059669"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#colorGnb)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Unlink}
                title="Telemetry Unavailable — Radio Links"
                message="UERANSIM gNodeB radio interface scrape data is currently unavailable."
                compact
                className="h-full"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
