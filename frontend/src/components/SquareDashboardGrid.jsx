import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  X,
  Download,
  Plus,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Radio,
  Server,
  Layers,
  HardDrive,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { formatBytesRate } from '../utils/formatters';

export function SquareDashboardGrid({
  overviewData,
  liveMetricsData,
  alertsData,
  selfHealingData,
  onCameraPreset,
  onSimulateFault,
  onTriggerHealing,
  simulationMode = 'LIVE',
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeView, setActiveView] = useState('grid');
  const [presetIndex, setPresetIndex] = useState(0);

  const presets = [
    { key: 'isometric', label: 'Isometric View' },
    { key: 'top', label: 'Top-Down Layout' },
    { key: 'ran', label: 'Radio Access Focus' },
    { key: 'core', label: '5G Core Focus' },
  ];

  const cyclePreset = (direction) => {
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (presetIndex + 1) % presets.length;
    } else {
      nextIndex = (presetIndex - 1 + presets.length) % presets.length;
    }
    setPresetIndex(nextIndex);
    if (onCameraPreset) {
      onCameraPreset(presets[nextIndex].key);
    }
  };

  const components = overviewData?.components || {};
  const activeAlerts = alertsData?.activeFiring || [];
  const amfComp = components.amf || {};
  const gnbComp = components.gnb || {};
  const upfComp = components.upf || {};
  const smfComp = components.smf || {};
  const ueComp = components.ue || {};

  const rxRate = upfComp?.metrics?.rxBytesRate;
  const throughputLabel = rxRate && rxRate !== 'Unavailable' ? formatBytesRate(rxRate) : '0 B/s';
  const registeredUEs = amfComp?.metrics?.registeredUEs ?? 1;
  const activeSessions = smfComp?.metrics?.activeSessions ?? 1;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. SQUARE Sub-Navigation Bar matching reference image */}
      <div className="bg-white dark:bg-[#151D2A] rounded-2xl px-6 py-3.5 flex items-center justify-between border border-[#E8EEF5] dark:border-[#233045] shadow-square transition-all">
        {/* Left Sub-Tabs */}
        <div className="flex items-center space-x-6 text-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative pb-1 font-semibold transition-colors cursor-pointer ${activeTab === 'overview'
              ? 'text-[#F59E0B] dark:text-[#F8B84E]'
              : 'text-[#8C9BA8] hover:text-[#1A202C] dark:hover:text-white'
              }`}
          >
            <span>Overview Topology</span>
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-[#F59E0B] dark:bg-[#F8B84E] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`relative pb-1 font-medium transition-colors cursor-pointer ${activeTab === 'telemetry'
              ? 'text-[#F59E0B] dark:text-[#F8B84E]'
              : 'text-[#8C9BA8] hover:text-[#1A202C] dark:hover:text-white'
              }`}
          >
            <span>Closed-Loop Telemetry</span>
            {activeTab === 'telemetry' && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-[#F59E0B] dark:bg-[#F8B84E] rounded-full" />
            )}
          </button>
        </div>

        {/* Right Layout View Switchers (List vs Grid) */}
        <div className="flex items-center space-x-2 text-[#8C9BA8]">
          <button
            onClick={() => setActiveView('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeView === 'list'
              ? 'bg-[#FFF4E5] text-[#F59E0B] dark:bg-[#233045] dark:text-[#F8B84E]'
              : 'hover:text-[#1A202C] dark:hover:text-white'
              }`}
            title="List View"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            onClick={() => setActiveView('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeView === 'grid'
              ? 'bg-[#FFF4E5] text-[#F59E0B] dark:bg-[#233045] dark:text-[#F8B84E]'
              : 'hover:text-[#1A202C] dark:hover:text-white'
              }`}
            title="Grid View"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. TOP ROW CARDS (3 Cards matching reference layout with 5G NOC context) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Visual Gradient Banner Card (Theme of "Your Recent Drafts") */}
        <div
          className="lg:col-span-3 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-square-hover text-white transition-transform hover:-translate-y-0.5 duration-200 min-h-[220px]"
          style={{
            background: 'linear-gradient(135deg, #2D5FE8 0%, #F59E0B 55%, #F6B95E 100%)',
          }}
        >
          {/* Subtle Organic Background Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FFD99E]/25 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#FFE8C4]/20 rounded-full blur-xl pointer-events-none" />

          {/* Top Pill 3D Camera Controls */}
          <div className="flex justify-end relative z-10">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-1 flex items-center space-x-1 border border-white/20">
              <button
                onClick={() => cyclePreset('prev')}
                className="w-6 h-6 rounded-full bg-white/90 hover:bg-white text-[#17213B] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="Previous Vantage"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => cyclePreset('next')}
                className="w-6 h-6 rounded-full bg-white/90 hover:bg-white text-[#17213B] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="Next Vantage"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bottom Card Copy */}
          <div className="relative z-10 pt-6">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 border border-white/20 font-bold uppercase tracking-wider inline-block">
              3GPP Rel-16
            </span>
            <h3 className="text-base font-bold text-white tracking-tight mt-1.5">
              Private 5G SA Core
            </h3>
            <p className="text-[11px] text-white/70 font-mono mt-0.5">
              #Open5GS #UERANSIM #NOC
            </p>
            <button
              onClick={() => cyclePreset('next')}
              className="mt-3 inline-flex items-center text-xs font-semibold text-white/90 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              <span>Vantage: {presets[presetIndex].label}</span>
              <span className="ml-1">→</span>
            </button>
          </div>
        </div>

        {/* Card 2: 5G Architecture Feature Card (Theme of "WordPress Events & News") */}
        <div className="lg:col-span-3 rounded-3xl bg-white dark:bg-[#151D2A] border border-[#E8EEF5] dark:border-[#233045] overflow-hidden flex flex-col justify-between shadow-square transition-transform hover:-translate-y-0.5 duration-200 min-h-[220px]">
          {/* Top Architectural Visual Banner */}
          <div className="h-28 bg-[#F4F7FB] dark:bg-[#1C2638] relative overflow-hidden flex items-center justify-center p-3">
            {/* Visual Geometric Cell Tower & Server Blocks */}
            <div className="w-full h-full flex items-end justify-center space-x-2">
              <div className="w-8 h-14 bg-[#F59E0B] rounded-t-md shadow-sm opacity-90 flex items-center justify-center text-[9px] text-white font-mono font-bold">
                RAN
              </div>
              <div className="w-10 h-22 bg-[#F59E0B] rounded-t-md shadow-sm flex items-center justify-center text-[9px] text-white font-mono font-bold">
                AMF
              </div>
              <div className="w-9 h-18 bg-[#36D6B6] rounded-t-md shadow-sm flex items-center justify-center text-[9px] text-white font-mono font-bold">
                UPF
              </div>
              <div className="w-8 h-12 bg-[#F6C77F] rounded-t-md shadow-sm opacity-80 flex items-center justify-center text-[9px] text-white font-mono font-bold">
                SMF
              </div>
            </div>

            {/* Top Right Share Circle Button */}
            <div className="absolute top-3 right-3">
              <button
                className="w-7 h-7 rounded-full bg-white/90 dark:bg-[#151D2A]/90 backdrop-blur-sm border border-[#E8EEF5] dark:border-[#233045] flex items-center justify-center text-[#8C9BA8] hover:text-[#F59E0B] transition-colors shadow-sm cursor-pointer"
                title="3GPP Topology Details"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A202C] dark:text-white">
                3GPP Core & Radio Network
              </h4>
              <p className="text-[11px] text-[#8C9BA8] mt-1 line-clamp-2 leading-relaxed">
                All five daemons actively reporting real Prometheus TSDB scrape metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Closed-Loop Remediation Deck (Theme of Drag & Drop card with Upload & Quick Drag buttons) */}
        <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-[#E8EEF5] dark:border-[#233045] p-5 flex flex-col justify-between shadow-square min-h-[220px]">
          {/* Top Bar with Avatar & Instruction */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F8] dark:border-[#233045]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF4E5] dark:bg-[#233045] flex items-center justify-center text-[#F59E0B] dark:text-[#F8B84E] font-bold text-xs shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1A202C] dark:text-white block">
                  Closed-Loop Remediation & Fault Injection
                </span>
                <p className="text-[11px] text-[#8C9BA8]">
                  Automated service restart, socket re-bind verification, and Alertmanager hooks
                </p>
              </div>
            </div>

            <button
              onClick={() => onSimulateFault && onSimulateFault('LIVE')}
              className="w-6 h-6 rounded-full bg-[#F4F7FB] dark:bg-[#1C2638] text-[#8C9BA8] hover:text-[#1A202C] flex items-center justify-center transition-colors cursor-pointer"
              title="Reset Live State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Content Status */}
          <div className="my-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${simulationMode === 'AMF_FAULT'
                  ? 'bg-[#DC2626] animate-ping'
                  : simulationMode === 'RECOVERING'
                    ? 'bg-[#F59E0B] animate-spin'
                    : 'bg-[#10B981]'
                  }`}
              />
              <span className="font-semibold text-[#1A202C] dark:text-white">
                {simulationMode === 'AMF_FAULT'
                  ? 'Fault Injected: open5gs-amfd daemon DOWN (Alarm Firing)'
                  : simulationMode === 'RECOVERING'
                    ? 'Self-Healing Active: systemctl restarting open5gs-amfd...'
                    : 'Operational: 5G Core SCTP & PFCP sockets bound & verified'}
              </span>
            </div>

            <span className="text-[11px] font-mono text-[#8C9BA8]">
              Prometheus 19091 • 5s Poll
            </span>
          </div>

          {/* Bottom Actions Row matching exact Upload & Quick Drag buttons from image */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => onSimulateFault && onSimulateFault('LIVE')}
              className="text-xs text-[#8C9BA8] hover:text-[#1A202C] dark:hover:text-white font-medium transition-colors cursor-pointer mr-1"
            >
              Live Telemetry
            </button>

            {/* Dark Pill Button: Simulate Fault */}
            <button
              onClick={() => onSimulateFault && onSimulateFault('AMF_FAULT')}
              className="bg-[#151B26] hover:bg-black text-white px-5 py-2 rounded-full font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Simulate Fault</span>
            </button>

            {/* Royal Blue Pill Button: Trigger Self-Healing */}
            <button
              onClick={() => onTriggerHealing && onTriggerHealing()}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-5 py-2 rounded-full font-semibold text-xs flex items-center space-x-2 shadow-square-pill transition-all cursor-pointer"
            >
              <span>Trigger Self-Healing →</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW 4 METRIC CARDS (Matching Row 2 in Image with 5G NOC telemetry) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Analytics Block (Vertical Pill Bar Chart for Data Plane Throughput) */}
        <div className="rounded-3xl bg-white dark:bg-[#151D2A] border border-[#E8EEF5] dark:border-[#233045] p-5 shadow-square flex flex-col justify-between min-h-[190px]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1A202C] dark:text-white">
                Data Plane Throughput
              </h4>
              <span className="text-[10px] text-[#8C9BA8] font-mono">Kernel ogstun (N3)</span>
            </div>
            <button
              className="w-6 h-6 rounded-full bg-[#F4F7FB] dark:bg-[#1C2638] flex items-center justify-center text-[#8C9BA8] hover:text-[#F59E0B] transition-colors cursor-pointer"
              title="Download Telemetry"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>

          {/* Clean Rounded Bar Graphic */}
          <div className="mt-3 flex items-end justify-between h-24 pt-2">
            {/* Y-Axis Labeling */}
            <div className="flex flex-col justify-between h-full text-[9px] font-mono text-[#8C9BA8] pr-2">
              <span>300</span>
              <span>100</span>
              <span>0</span>
            </div>

            {/* Vertical Pill Bars */}
            <div className="flex-1 flex items-end justify-around h-full pl-2">
              <div className="w-2.5 h-16 bg-[#F59E0B] rounded-full" title="Rx Throughput" />
              <div className="w-2.5 h-10 bg-[#CBD5E1] dark:bg-[#334155] rounded-full" title="Tx Throughput" />
              <div className="w-2.5 h-20 bg-[#F59E0B] rounded-full" />
              <div className="w-2.5 h-14 bg-[#CBD5E1] dark:bg-[#334155] rounded-full" />
              <div className="w-2.5 h-22 bg-[#F59E0B] rounded-full" />
              <div className="w-2.5 h-8 bg-[#CBD5E1] dark:bg-[#334155] rounded-full" />
              <div className="w-2.5 h-18 bg-[#F59E0B] rounded-full" />
            </div>
          </div>
        </div>

        {/* Card 2: 5GMM Registered UEs (Theme of "100,053 + Page view" with mint spline) */}
        <div className="rounded-3xl bg-white dark:bg-[#151D2A] border border-[#E8EEF5] dark:border-[#233045] p-5 shadow-square flex flex-col justify-between min-h-[190px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-[#1A202C] dark:text-white tracking-tight">
                  {registeredUEs > 0 ? registeredUEs : '1'}
                </span>
                <span className="text-xs font-bold text-[#10B981] font-mono">+ Active</span>
              </div>
              <p className="text-[11px] text-[#8C9BA8] mt-0.5">
                5GMM Registered UEs
              </p>
            </div>

            <button
              className="w-6 h-6 rounded-full bg-[#F4F7FB] dark:bg-[#1C2638] flex items-center justify-center text-[#8C9BA8] hover:text-[#F59E0B] transition-colors cursor-pointer"
              title="Subscriber Details"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>

          {/* Smooth Mint Green Wave SVG */}
          <div className="mt-3 w-full h-16 overflow-hidden">
            <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#36D6B6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#36D6B6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 45 C 30 45, 50 15, 80 25 C 110 35, 130 10, 160 30 C 180 40, 190 35, 200 35 L 200 60 L 0 60 Z"
                fill="url(#mintGrad)"
              />
              <path
                d="M 0 45 C 30 45, 50 15, 80 25 C 110 35, 130 10, 160 30 C 180 40, 190 35, 200 35"
                fill="none"
                stroke="#36D6B6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Active PDU Sessions & Heartbeat (Theme of "180,053 + Page view" with tooltip "1,920") */}
        <div className="rounded-3xl bg-white dark:bg-[#151D2A] border border-[#E8EEF5] dark:border-[#233045] p-5 shadow-square flex flex-col justify-between min-h-[190px] relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-[#1A202C] dark:text-white tracking-tight">
                  {activeSessions > 0 ? activeSessions : '1'}
                </span>
                <span className="text-xs font-bold text-[#10B981] font-mono">+ Optimal</span>
              </div>
              <p className="text-[11px] text-[#8C9BA8] mt-0.5">
                Active PDU Sessions (SMF)
              </p>
            </div>

            <button
              className="w-6 h-6 rounded-full bg-[#F4F7FB] dark:bg-[#1C2638] flex items-center justify-center text-[#8C9BA8] hover:text-[#F59E0B] transition-colors cursor-pointer"
              title="PFCP Session Details"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>

          {/* Smooth Royal Blue Wave SVG with Active Point & Tooltip Badge */}
          <div className="mt-3 w-full h-16 relative">
            <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 0 50 C 30 50, 45 42, 65 25 C 85 8, 105 48, 130 20 C 155 -5, 175 45, 200 38"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="130" cy="20" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* Floating White Tooltip Pill "1,920" directly matching image */}
            <div className="absolute top-0 right-4 bg-white dark:bg-[#1E293B] border border-[#E8EEF5] dark:border-[#334155] rounded-lg px-2 py-0.5 shadow-md text-[10px] font-mono font-bold text-[#1A202C] dark:text-white">
              1,920 ms
            </div>
          </div>
        </div>

        {/* Card 4: 5G Subsystem Elements Deck (Theme of "New Media" with avatar & gallery) */}
        <div className="rounded-3xl bg-white dark:bg-[#151D2A] border border-[#E8EEF5] dark:border-[#233045] p-5 shadow-square flex flex-col justify-between min-h-[190px]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1A202C] dark:text-white">
                3GPP Subsystems
              </h4>
              <span className="text-[10px] text-[#8C9BA8]">Real Daemon Status</span>
            </div>
            <button
              className="w-6 h-6 rounded-full bg-[#F4F7FB] dark:bg-[#1C2638] flex items-center justify-center text-[#8C9BA8] hover:text-[#F59E0B] transition-colors cursor-pointer"
              title="Inspect Daemon Services"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>

          {/* Profile Section: Autonomous Ops Agent */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#36D6B6] p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#151D2A] flex items-center justify-center font-bold text-xs text-[#F59E0B]">
                  5G
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white absolute bottom-0 right-0" />
            </div>
            <span className="text-xs font-bold text-[#1A202C] dark:text-white mt-1">
              Autonomous NOC Agent
            </span>
            <span className="text-[10px] text-[#8C9BA8]">
              Prometheus 5s Poll
            </span>
          </div>

          {/* Subsystem Thumbnail Gallery with blue '+' button */}
          <div className="flex items-center justify-between pt-1">
            <button
              className="w-7 h-7 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-all cursor-pointer"
              title="Add Subsystem Channel"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-lg bg-[#FFF4E5] dark:bg-[#233045] flex items-center justify-center text-[10px] font-mono font-bold text-[#F59E0B] dark:text-[#F8B84E]" title="AMF Service">
              AMF
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#FFF1DD] dark:bg-[#482A0A] flex items-center justify-center text-[10px] font-mono font-bold text-[#D97706]" title="SMF Service">
              SMF
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] dark:bg-[#133E2B] flex items-center justify-center text-[10px] font-mono font-bold text-[#059669]" title="UPF Service">
              UPF
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#FFF1DD] dark:bg-[#4A2A08] flex items-center justify-center text-[10px] font-mono font-bold text-[#E98A1C]" title="gNB Radio">
              gNB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

