import React from 'react';
import { MetricNode } from './ui/MetricNode';
import { Network, Server } from 'lucide-react';

export function NetworkTopology({ overviewData, loading }) {
  const components = overviewData?.components || {
    amf: { status: 'Unavailable' },
    smf: { status: 'Unavailable' },
    upf: { status: 'Unavailable' },
    gnb: { status: 'Unavailable' },
    ue: { status: 'Unavailable' },
  };

  return (
    <div className="space-y-3">
      {/* Topology Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F8B84E]/15 dark:text-[#F8B84E]">
            <Network className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider font-sans">
            5G Standalone Component Telemetry Nodes
          </h3>
        </div>

        <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
          5 Monitored 3GPP Elements
        </span>
      </div>

      {/* 5-Column Grid with consistent alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. AMF */}
        <MetricNode
          componentKey="amf"
          data={components.amf}
          roleLabel="Control Plane"
          interfaceLabel="N2 / SCTP:38412"
        />

        {/* 2. SMF */}
        <MetricNode
          componentKey="smf"
          data={components.smf}
          roleLabel="Control Plane"
          interfaceLabel="N4 / PFCP:8805"
        />

        {/* 3. UPF */}
        <MetricNode
          componentKey="upf"
          data={components.upf}
          roleLabel="User Plane"
          interfaceLabel="N3 / GTP-U (ogstun)"
        />

        {/* 4. gNodeB */}
        <MetricNode
          componentKey="gnb"
          data={components.gnb}
          roleLabel="Radio RAN"
          interfaceLabel="Uu / 5G-NR RF"
        />

        {/* 5. UE */}
        <MetricNode
          componentKey="ue"
          data={components.ue}
          roleLabel="Terminal UE"
          interfaceLabel="uesimtun0 PDU"
        />
      </div>
    </div>
  );
}
