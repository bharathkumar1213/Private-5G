import React, { useState } from 'react';
import { Settings, Info, TrendingUp, ChevronRight } from 'lucide-react';

/**
 * Looker Enterprise Executive Visuals
 * 1. "Lead to Win Funnel" (5G Registration & PDU Session Funnel)
 * 2. "Prospects by Bus Seg and Vertical" (3GPP Domain Subsystem Distribution Donuts)
 * Directly matching the Looker Executive Summary reference design.
 */
export function Looker5GFunnelAndDonuts({ overviewData, liveMetricsData }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // 1. Funnel Stages Data (reflecting 5G registration & session establishment lifecycle)
  const funnelStages = [
    {
      id: 'uu',
      name: 'Radio Link (Uu)',
      lookerLabel: 'Radio Link',
      value: 3711,
      color: '#F59E0B',
      heightPercent: 92,
      conversionRate: '71.22%',
      description: 'Physical RF Uu carrier sync & preamble detection at gNodeB',
      specs: '3GPP TS 38.211 / Carrier NR-ARFCN 640000',
    },
    {
      id: 'n2',
      name: 'SCTP N2 Assoc',
      lookerLabel: 'N2 Association',
      value: 2643,
      color: '#E99A2E',
      heightPercent: 66,
      conversionRate: '33.45%',
      description: 'NGAP SCTP association established between gNB and AMF',
      specs: '3GPP TS 38.413 / SCTP Port 38412',
    },
    {
      id: '5gmm',
      name: '5GMM Registered',
      lookerLabel: 'Registration',
      value: 884,
      color: '#F7C27C', // Looker Sky Blue
      heightPercent: 22,
      conversionRate: '15.27%',
      description: 'NAS 5GMM Security Mode Complete & Registration Accepted',
      specs: '3GPP TS 24.501 / PLMN 999-70',
    },
    {
      id: 'pdu',
      name: 'Won Sessions (PDU)',
      lookerLabel: 'PDU Sessions',
      value: 135,
      color: '#F59E0B', // Looker Electric Cyan
      heightPercent: 6,
      conversionRate: null,
      description: 'Active GTP-U PDU session routed to ogstun interface tunnel',
      specs: '3GPP TS 29.281 / GTP-U Port 2152',
    },
  ];

  // 2. Three Donut Charts Data (Looker "Prospects by Bus Seg and Vertical")
  const donutSegments = [
    {
      title: 'Enterprise',
      subtext: 'Control Plane (SBA)',
      slices: [
        { label: 'Software & SaaS', percent: 38, color: '#F59E0B' },
        { label: 'Retail, eCommerce', percent: 24, color: '#F7C27C' },
        { label: 'Finance & Payments', percent: 19, color: '#20B2AA' },
        { label: 'Ad Tech & Online Media', percent: 10, color: '#F59E0B' },
        { label: 'Mobile & Gaming', percent: 10, color: '#E99A2E' },
      ],
    },
    {
      title: 'Mid-Market',
      subtext: 'Radio Access (RAN)',
      slices: [
        { label: 'Software & SaaS', percent: 39, color: '#F59E0B' },
        { label: 'Finance & Payments', percent: 17, color: '#E99A2E' },
        { label: 'Non-profit & Education', percent: 11, color: '#F5A623' },
        { label: 'Health', percent: 11, color: '#FF6B6B' },
        { label: 'Mobile & Gaming', percent: 6, color: '#F59E0B' },
        { label: 'Retail, eCommerce', percent: 11, color: '#20B2AA' },
      ],
    },
    {
      title: 'Small Business',
      subtext: 'User Plane (GTP-U)',
      slices: [
        { label: 'Software & SaaS', percent: 35, color: '#F59E0B' },
        { label: 'Ad Tech & Online Media', percent: 21, color: '#F59E0B' },
        { label: 'Retail, eCommerce', percent: 17, color: '#20B2AA' },
        { label: 'Health', percent: 8, color: '#FF6B6B' },
        { label: 'Mobile & Gaming', percent: 6, color: '#E99A2E' },
        { label: 'Non-profit & Education', percent: 4, color: '#F5A623' },
      ],
    },
  ];

  // Helper to render SVG Donut slices
  const renderSvgDonut = (slices, size = 110, strokeWidth = 26) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {slices.map((slice, i) => {
          const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedAngle;
          accumulatedAngle += (slice.percent / 100) * circumference;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ---------------- CARD 1: LEAD TO WIN FUNNEL (5G SESSION FUNNEL) ---------------- */}
      <div className="bg-white dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] rounded-[22px] p-6 shadow-square relative flex flex-col justify-between">
        {/* Card Header with Gear Icon */}
        <div className="flex items-center justify-between border-b border-[#F0F4F8] dark:border-[#233045] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-[#1A202C] dark:text-[#F8FAFC] tracking-tight">
              5G Registration & Session Funnel
            </h2>
            <span className="text-[11px] text-[#8C9BA8] font-sans">
              (5G Registration & Session Pipeline)
            </span>
          </div>
          <button
            className="p-1.5 rounded-full text-[#8C9BA8] hover:text-[#F59E0B] hover:bg-[#F4F7FB] dark:hover:bg-[#1C2638] transition-colors"
            title="Configure Funnel Parameters"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Funnel Stepped Chart Graphic Area */}
        <div className="relative pt-6 pb-2 px-2">
          {/* Y-Axis Grid Lines & Tick Labels */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#94A3B8] font-sans pr-2">
            <div className="flex items-center">
              <span className="w-8 text-right pr-2">3,000</span>
              <div className="flex-1 border-b border-[#F1F5F9] dark:border-[#334155]/60" />
            </div>
            <div className="flex items-center">
              <span className="w-8 text-right pr-2">2,000</span>
              <div className="flex-1 border-b border-[#F1F5F9] dark:border-[#334155]/60" />
            </div>
            <div className="flex items-center">
              <span className="w-8 text-right pr-2">1,000</span>
              <div className="flex-1 border-b border-[#F1F5F9] dark:border-[#334155]/60" />
            </div>
            <div className="flex items-center">
              <span className="w-8 text-right pr-2">0</span>
              <div className="flex-1 border-b border-[#E2E8F0] dark:border-[#334155]" />
            </div>
          </div>

          {/* Stepped Vertical Bars with Sequential Chevron Arrows */}
          <div className="relative z-10 flex items-end justify-between pl-10 pr-2 h-56 pt-6">
            {funnelStages.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                {/* Bar Column */}
                <div
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer mx-1"
                  onMouseEnter={() => setActiveTooltip(stage.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {/* Top Metric Value */}
                  <span className="text-xs font-bold text-[#1E293B] dark:text-[#F8FAFC] mb-1.5 transition-transform group-hover:-translate-y-1">
                    {stage.value.toLocaleString()}
                  </span>

                  {/* Colored Rectangular Bar */}
                  <div
                    className="w-full rounded-t-sm transition-all duration-300 group-hover:brightness-110 shadow-sm"
                    style={{
                      height: `${stage.heightPercent}%`,
                      backgroundColor: stage.color,
                      minHeight: '8px',
                    }}
                  />

                  {/* Stage Hover Tooltip */}
                  {activeTooltip === stage.id && (
                    <div className="absolute -top-16 z-30 bg-[#1E2538] text-white text-[11px] py-1.5 px-2.5 rounded shadow-xl border border-[#334155] whitespace-nowrap pointer-events-none animate-in fade-in duration-150">
                      <div className="font-bold flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                        <span>{stage.lookerLabel} ({stage.name})</span>
                      </div>
                      <div className="text-slate-300 text-[10px] mt-0.5">
                        Count: <span className="font-mono font-bold text-white">{stage.value}</span> | {stage.specs}
                      </div>
                    </div>
                  )}
                </div>

                {/* Conversion Chevron Arrow to Next Stage */}
                {stage.conversionRate && (
                  <div className="flex flex-col items-center justify-center px-0.5 z-20 self-center">
                    <div className="flex items-center bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] shadow-sm rounded px-1.5 py-0.5 text-[10px] font-bold text-[#475569] dark:text-[#E2E8F0]">
                      <span>{stage.conversionRate}</span>
                      <ChevronRight className="w-3 h-3 text-[#94A3B8] ml-0.5" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Funnel Legend Dots (Matching Looker Image 3) */}
        <div className="mt-4 pt-3 border-t border-[#F1F5F9] dark:border-[#334155] flex flex-wrap items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {funnelStages.map((stage) => (
              <div key={stage.id} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span>{stage.lookerLabel}</span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono shrink-0 mt-1 sm:mt-0">
            just now
          </span>
        </div>
      </div>

      {/* ---------------- CARD 2: PROSPECTS BY BUS SEG AND VERTICAL (3GPP DONUTS) ---------------- */}
      <div className="bg-white dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] rounded-[22px] p-6 shadow-square relative flex flex-col justify-between">
        {/* Card Header with Gear Icon */}
        <div className="flex items-center justify-between border-b border-[#F0F4F8] dark:border-[#233045] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-[#1A202C] dark:text-[#F8FAFC] tracking-tight">
              3GPP Domain Distribution
            </h2>
            <span className="text-[11px] text-[#8C9BA8] font-sans">
              (3GPP Domain Distribution)
            </span>
          </div>
          <button
            className="p-1.5 rounded-full text-[#8C9BA8] hover:text-[#F59E0B] hover:bg-[#F4F7FB] dark:hover:bg-[#1C2638] transition-colors"
            title="Configure Domain Slices"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Three Donut Charts Graphic Area */}
        <div className="grid grid-cols-3 gap-2 py-4">
          {donutSegments.map((seg, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              {/* Donut Container with Centered HTML Label */}
              <div className="relative flex items-center justify-center">
                {renderSvgDonut(seg.slices, 108, 22)}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                  <span className="text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
                    {seg.title}
                  </span>
                </div>
              </div>

              {/* Subtitle Under Donut */}
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-sans mt-2">
                {seg.subtext}
              </span>
            </div>
          ))}
        </div>

        {/* Multi-Color Domain Legend (Matching Looker Image 3) */}
        <div className="mt-4 pt-3 border-t border-[#F1F5F9] dark:border-[#334155] flex flex-wrap items-center justify-between text-[10px] text-[#64748B] dark:text-[#94A3B8]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
              <span className="truncate">Ad Tech & Online Media</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E99A2E] shrink-0" />
              <span className="truncate">Finance & Payments</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] shrink-0" />
              <span className="truncate">Health</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
              <span className="truncate">Mobile & Gaming</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] shrink-0" />
              <span className="truncate">Non-profit & Education</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20B2AA] shrink-0" />
              <span className="truncate">Retail, eCommerce</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E98A1C] shrink-0" />
              <span className="truncate">Software & SaaS</span>
            </div>
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono shrink-0 mt-1 sm:mt-0 ml-2">
            just now
          </span>
        </div>
      </div>
    </div>
  );
}

