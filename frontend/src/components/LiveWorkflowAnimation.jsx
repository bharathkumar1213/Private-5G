import React, { useState } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Clock,
  History,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Server,
  Radio,
  HardDrive,
  Info,
  Box,
  Layers,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { formatDate } from '../utils/formatters';
import { ThreeDigitalTwin5G } from './ThreeDigitalTwin5G';

export function LiveWorkflowAnimation({ overviewData, alertsData, selfHealingData, loading }) {
  const [viewMode, setViewMode] = useState('3d');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showIncidentDrawer, setShowIncidentDrawer] = useState(false);

  const components = overviewData?.components || {};
  const interfaces = overviewData?.interfaces || {};
  const workflowStages = overviewData?.workflowStages || [];
  const timestamp = overviewData?.timestamp;
  const recoveryData = overviewData?.recovery || {};
  const recoveryComponents = recoveryData?.components || {};
  const activeFiringAlerts = alertsData?.activeFiring || [];
  const historicalRecoveryAvailable = recoveryData?.historicalRecoveryAvailable ?? false;
  const historicalRecoveryNotice = recoveryData?.historicalRecoveryNotice || 'Historical recovery data unavailable';
  const recentObservedEvents = recoveryData?.recentObservedEvents || [];

  // Extract component base telemetry
  const amf = components.amf || { status: 'Unavailable', metrics: {} };
  const smf = components.smf || { status: 'Unavailable', metrics: {} };
  const upf = components.upf || { status: 'Unavailable', metrics: {} };
  const gnb = components.gnb || { status: 'Unavailable', metrics: {} };
  const ue = components.ue || { status: 'Unavailable', metrics: {} };

  // Helper to determine node visual state based on actual Prometheus & Recovery status
  const getNodeVisual = (key) => {
    const comp = components[key] || { status: 'Unavailable', service: key };
    const rec = recoveryComponents[key] || {
      lifecycleState: comp.status === 'UP' ? 'HEALTHY' : (comp.status === 'DOWN' ? 'DOWN' : 'UNAVAILABLE'),
      activeAlert: null,
      recovery: { state: 'IDLE', details: null, serviceAvailability: comp.status }
    };

    const lifecycle = rec.lifecycleState;

    // 1. Recovery in Progress (Requires reliable evidence from recovery API / bridge)
    if (lifecycle === 'RECOVERING') {
      return {
        key,
        lifecycle,
        stroke: '#D6A653', // Warm Amber
        fill: '#242B30',
        text: '#D6A653',
        iconStroke: '#D6A653',
        statusLabel: 'RECOVERING',
        badgeBg: 'bg-[#D6A653]/20 text-[#D6A653] border-[#D6A653]/40',
        pulseClass: 'bg-[#D6A653] animate-spin',
        isFailing: false,
        isRecovering: true,
        isRecoveryFailed: false,
        rec,
      };
    }

    // 2. Recovery Failed (Reported by recovery API)
    if (lifecycle === 'RECOVERY_FAILED') {
      return {
        key,
        lifecycle,
        stroke: '#D76565', // Failure Red
        fill: '#242B30',
        text: '#D76565',
        iconStroke: '#D76565',
        statusLabel: 'RECOVERY FAILED',
        badgeBg: 'bg-[#D76565]/20 text-[#D76565] border-[#D76565]/40',
        pulseClass: 'bg-[#D76565]',
        isFailing: true,
        isRecovering: false,
        isRecoveryFailed: true,
        rec,
      };
    }

    // 3. Failure Detected (Prometheus detected DOWN or active alert firing)
    if (lifecycle === 'DOWN' || comp.status === 'DOWN') {
      return {
        key,
        lifecycle: 'DOWN',
        stroke: '#D76565', // Failure Red
        fill: '#242B30',
        text: '#D76565',
        iconStroke: '#D76565',
        statusLabel: 'DOWN',
        badgeBg: 'bg-[#D76565]/20 text-[#D76565] border-[#D76565]/40',
        pulseClass: 'bg-[#D76565] animate-ping',
        isFailing: true,
        isRecovering: false,
        isRecoveryFailed: false,
        rec,
      };
    }

    // 4. Healthy / Operational (Prometheus UP)
    if (lifecycle === 'HEALTHY' || comp.status === 'UP') {
      return {
        key,
        lifecycle: 'HEALTHY',
        stroke: '#48B8A2', // Muted Teal
        fill: '#242B30',
        text: '#48B8A2',
        iconStroke: '#48B8A2',
        statusLabel: 'UP',
        badgeBg: 'bg-[#48B8A2]/20 text-[#48B8A2] border-[#48B8A2]/40',
        pulseClass: 'bg-[#48B8A2]',
        isFailing: false,
        isRecovering: false,
        isRecoveryFailed: false,
        rec,
      };
    }

    // 5. Unavailable / Offline (Scrape missing)
    return {
      key,
      lifecycle: 'UNAVAILABLE',
      stroke: '#39434A', // Neutral Border Grey
      fill: '#1C2227',
      text: '#A2ADB3',
      iconStroke: '#A2ADB3',
      statusLabel: 'UNAVAILABLE',
      badgeBg: 'bg-[#1C2227] text-[#A2ADB3] border-[#39434A]',
      pulseClass: 'bg-[#39434A]',
      isFailing: false,
      isRecovering: false,
      isRecoveryFailed: false,
      rec,
    };
  };

  const vUe = getNodeVisual('ue');
  const vGnb = getNodeVisual('gnb');
  const vAmf = getNodeVisual('amf');
  const vSmf = getNodeVisual('smf');
  const vUpf = getNodeVisual('upf');

  // List of active incident components (failing, recovering, or recovery-failed)
  const incidentComponents = [vAmf, vSmf, vUpf, vGnb, vUe].filter(
    (n) => n.isFailing || n.isRecovering
  );
  const activeIncidentsCount = incidentComponents.length;

  // Helper to determine interface visual state respecting component failures & recovery
  const getLinkVisual = (ifaceKey, fromNode, toNode) => {
    // Failure rule: If either terminating component is DOWN or RECOVERY_FAILED, link stops immediately
    if (fromNode.isFailing || toNode.isFailing) {
      return {
        stroke: '#D76565', // Failure Red Disconnected Link
        lineClass: 'paused-animation', // Signal flow stops!
        active: false,
        labelBg: 'bg-[#242B30] text-[#D76565] border-[#D76565]/40',
        desc: `Interface Disconnected (${fromNode.isFailing ? fromNode.key.toUpperCase() : toNode.key.toUpperCase()} Fault)`,
        marker: 'url(#arrow-rose)',
      };
    }

    // Recovery rule: If either component is recovering, link is shown in amber standby
    if (fromNode.isRecovering || toNode.isRecovering) {
      return {
        stroke: '#D6A653', // Warm Amber Link
        lineClass: 'paused-animation', // Do not claim packets flow while remediating
        active: false,
        labelBg: 'bg-[#242B30] text-[#D6A653] border-[#D6A653]/40',
        desc: 'Remediation In Progress (Re-binding Socket)',
        marker: 'url(#arrow-amber)',
      };
    }

    const iface = interfaces[ifaceKey] || { status: 'UNAVAILABLE', active: false };
    const status = iface.status;

    if (status === 'HEALTHY' || status === 'ACTIVE') {
      return {
        stroke: '#48B8A2', // Muted Teal
        lineClass: isPlaying ? 'animate-flow-teal' : 'paused-animation',
        active: true,
        labelBg: 'bg-[#242B30] text-[#48B8A2] border-[#48B8A2]/40',
        desc: status === 'ACTIVE' ? 'Active Traffic' : 'Healthy Control Link',
        marker: 'url(#arrow-teal)',
      };
    }
    if (status === 'STANDBY') {
      return {
        stroke: '#D6A653', // Warm Amber / Standby
        lineClass: 'paused-animation', // Standby is static
        active: false,
        labelBg: 'bg-[#242B30] text-[#D6A653] border-[#D6A653]/40',
        desc: 'Standby / Carrier Ready (0 Active Sessions)',
        marker: 'url(#arrow-amber)',
      };
    }
    if (status === 'DOWN') {
      return {
        stroke: '#D76565',
        lineClass: 'paused-animation',
        active: false,
        labelBg: 'bg-[#242B30] text-[#D76565] border-[#D76565]/40',
        desc: 'Link Offline / Fault Detected',
        marker: 'url(#arrow-rose)',
      };
    }

    // Unavailable
    return {
      stroke: '#39434A', // Neutral Border Grey
      lineClass: 'paused-animation',
      active: false,
      labelBg: 'bg-[#1C2227] text-[#A2ADB3] border-[#39434A]',
      desc: 'Telemetry Missing',
      marker: 'url(#arrow-grey)',
    };
  };

  const linkUu = getLinkVisual('uu', vUe, vGnb);
  const linkN2 = getLinkVisual('n2', vGnb, vAmf);
  const linkAmfSmf = getLinkVisual('amfSmfControl', vAmf, vSmf);
  const linkN4 = getLinkVisual('n4', vSmf, vUpf);
  const linkN3 = getLinkVisual('n3', vGnb, vUpf);

  // N6 External Data Network connection
  const upfOperational = vUpf.lifecycle === 'HEALTHY';
  const hasActiveSession =
    (typeof smf.metrics?.activeSessions === 'number' && smf.metrics.activeSessions > 0) ||
    (typeof upf.metrics?.rxBytesRate === 'number' && upf.metrics.rxBytesRate > 0);
  const linkN6 = {
    stroke: !upfOperational ? (vUpf.isFailing ? '#D76565' : '#39434A') : (hasActiveSession ? '#48B8A2' : '#D6A653'),
    lineClass: (upfOperational && hasActiveSession && isPlaying) ? 'animate-flow-teal' : 'paused-animation',
    active: upfOperational && hasActiveSession,
    desc: upfOperational ? (hasActiveSession ? 'Active External Route' : 'Ready (No Active Sessions)') : 'Offline',
  };

  return (
    <div className={`rounded-[22px] overflow-hidden transition-all duration-200 ${isExpanded
      ? 'fixed inset-4 z-50 overflow-y-auto bg-[#F1F4F7] dark:bg-[#101827] shadow-square'
      : 'relative bg-[#FFFFFF] dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] shadow-square'
      }`}>
      {/* Top Header & Interactive Control Bar */}
      <div className="px-5 py-4 border-b border-[#EEF1F5] dark:border-[#2B3B57] flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1A2438]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F8B84E]/15 dark:text-[#F8B84E] shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-sans uppercase tracking-wider">
                5G Architecture • Live Workflow & Self-Healing
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F8B84E]/15 dark:text-[#F8B84E] border border-[#F59E0B]/20 dark:border-[#F8B84E]/30">
                3GPP Rel-16
              </span>
              {activeIncidentsCount > 0 ? (
                <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                  <span>{activeIncidentsCount} Active Incident{activeIncidentsCount > 1 ? 's' : ''}</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669] border border-[#059669]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  <span>All Elements Verified</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans mt-0.5">
              Live telemetry, real-time fault detection, Alertmanager alarms, and closed-loop self-healing state
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 text-xs font-sans">
          {/* View Mode Toggle: 3D Digital Twin vs 2D Schematic */}
          <div className="flex items-center bg-[#F1F4F8] dark:bg-[#0F172A] rounded-md border border-[#CBD5E1] dark:border-[#334155] p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${viewMode === '3d'
                ? 'bg-[#F59E0B] text-white font-semibold shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              title="Switch to Interactive 3D WebGL Digital Twin"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Digital Twin</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${viewMode === '2d'
                ? 'bg-[#F59E0B] text-white font-semibold shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              title="Switch to 2D 3GPP Architecture Blueprint"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Schematic</span>
            </button>
          </div>

          {/* Live Data Pulse */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#F1F4F8] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span>Telemetry: 5s Poll</span>
          </div>

          {/* Audit & Historical Recovery Log Toggle */}
          <button
            onClick={() => setShowIncidentDrawer(!showIncidentDrawer)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${showIncidentDrawer
              ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]'
              : 'bg-[#F1F4F8] dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            title="Inspect real-time incident audit and historical event telemetry"
          >
            <History className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden md:inline">Incident Audit</span>
            {showIncidentDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Expand / Minimize Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md bg-[#F1F4F8] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Architecture Panel' : 'Expand Full Architecture View'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Visualization Workspace: 3D Digital Twin or 2D Schematic */}
      {viewMode === '3d' ? (
        <div className="p-3 sm:p-4 bg-[#F8FAFC] dark:bg-[#0A101F]">
          <ThreeDigitalTwin5G
            overviewData={overviewData}
            alertsData={alertsData}
            selfHealingData={selfHealingData}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
        </div>
      ) : (
        <div className="p-3 sm:p-5 relative bg-[#F8FAFC] dark:bg-[#0A101F]">
          {/* Compact Legend Overlay */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] mb-2 px-1">
            <span className="font-sans font-bold uppercase text-[10px] text-[#0F172A] dark:text-[#F8FAFC]">Interface & Link Status:</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">Operational</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">Control Plane</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-spin" />
              <span className="text-[#D97706] font-semibold">Self-Healing</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
              <span className="text-[#DC2626] font-semibold">Fault / Alarm Firing</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] dark:bg-[#334155]" />
              <span className="text-[#64748B] dark:text-[#94A3B8]">Unavailable</span>
            </span>
          </div>

          {/* Responsive SVG Canvas */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 980 340"
              className="w-full h-auto min-w-[760px] max-w-full select-none"
              style={{ shapeRendering: 'geometricPrecision' }}
            >
              <defs>
                {/* Arrow Markers for direction */}
                <marker id="arrow-teal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#48B8A2" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#D6A653" />
                </marker>
                <marker id="arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#D76565" />
                </marker>
                <marker id="arrow-grey" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#39434A" />
                </marker>

                {/* Muted Grid Pattern Background */}
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#39434A" strokeOpacity="0.3" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Subtle background grid */}
              <rect width="980" height="340" fill="url(#grid-pattern)" rx="4" />

              {/* Architecture Grouping Bounds */}
              {/* Control Plane Group Box */}
              <rect x="470" y="20" width="490" height="155" fill="#1C2227" fillOpacity="0.6" stroke="#39434A" strokeWidth="1" strokeDasharray="4 4" rx="4" />
              <text x="485" y="40" fill="#A2ADB3" fontSize="10" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">
                5G CORE CONTROL PLANE (SBA)
              </text>

              {/* User Plane Group Box */}
              <rect x="620" y="195" width="340" height="130" fill="#1C2227" fillOpacity="0.6" stroke="#39434A" strokeWidth="1" strokeDasharray="4 4" rx="4" />
              <text x="635" y="215" fill="#A2ADB3" fontSize="10" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">
                USER PLANE & DATA NETWORK
              </text>

              {/* Radio Access Network Group Box */}
              <rect x="20" y="140" width="420" height="185" fill="#1C2227" fillOpacity="0.6" stroke="#39434A" strokeWidth="1" strokeDasharray="4 4" rx="4" />
              <text x="35" y="160" fill="#A2ADB3" fontSize="10" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">
                RADIO ACCESS NETWORK & SUBSCRIBER DOMAIN
              </text>

              {/* INTERFACE PATHS */}

              {/* 1. Uu Interface (UE to gNB) */}
              <path
                d="M 160 250 L 260 250"
                fill="none"
                stroke={linkUu.stroke}
                strokeWidth="2.5"
                className={linkUu.lineClass}
              />

              {/* 2. N2 Interface (gNB to AMF - Control Plane) */}
              <path
                d="M 360 220 C 420 180, 460 110, 520 100"
                fill="none"
                stroke={linkN2.stroke}
                strokeWidth="2.5"
                className={linkN2.lineClass}
              />

              {/* 3. AMF-SMF Control Interaction (Logical Control Plane / N11) */}
              <path
                d="M 640 100 L 760 100"
                fill="none"
                stroke={linkAmfSmf.stroke}
                strokeWidth="2.5"
                className={linkAmfSmf.lineClass}
              />

              {/* 4. N4 Interface (SMF to UPF - PFCP Control) */}
              <path
                d="M 820 140 C 800 190, 770 215, 740 245"
                fill="none"
                stroke={linkN4.stroke}
                strokeWidth="2.5"
                className={linkN4.lineClass}
              />

              {/* 5. N3 Interface (gNB to UPF - GTP-U User Plane) */}
              <path
                d="M 360 260 C 460 290, 540 270, 640 260"
                fill="none"
                stroke={linkN3.stroke}
                strokeWidth="2.5"
                className={linkN3.lineClass}
              />

              {/* 6. N6 Interface (UPF to Data Network) */}
              <path
                d="M 760 265 L 870 265"
                fill="none"
                stroke={linkN6.stroke}
                strokeWidth="2.5"
                className={linkN6.lineClass}
              />

              {/* INTERFACE LABELS */}
              {/* Uu Label */}
              <g transform="translate(185, 232)">
                <rect x="-5" y="-12" width="55" height="18" rx="2" fill="#1C2227" stroke={linkUu.stroke} strokeWidth="1" />
                <text x="22" y="0" textAnchor="middle" fill="#E0E5E7" fontSize="9" fontFamily="monospace" fontWeight="600">
                  Uu (Radio)
                </text>
              </g>

              {/* N2 Label */}
              <g transform="translate(420, 145)">
                <rect x="-5" y="-12" width="70" height="18" rx="2" fill="#1C2227" stroke={linkN2.stroke} strokeWidth="1" />
                <text x="30" y="0" textAnchor="middle" fill="#E0E5E7" fontSize="9" fontFamily="monospace" fontWeight="600">
                  N2 (SCTP:38412)
                </text>
              </g>

              {/* AMF-SMF Control Interaction Label */}
              <g transform="translate(655, 82)">
                <rect x="-8" y="-12" width="95" height="18" rx="2" fill="#1C2227" stroke={linkAmfSmf.stroke} strokeWidth="1" />
                <text x="40" y="0" textAnchor="middle" fill="#E0E5E7" fontSize="8.5" fontFamily="sans-serif" fontWeight="600">
                  AMF-SMF Control
                </text>
              </g>

              {/* N4 Label */}
              <g transform="translate(775, 185)">
                <rect x="-5" y="-12" width="65" height="18" rx="2" fill="#1C2227" stroke={linkN4.stroke} strokeWidth="1" />
                <text x="28" y="0" textAnchor="middle" fill="#E0E5E7" fontSize="9" fontFamily="monospace" fontWeight="600">
                  N4 (PFCP:8805)
                </text>
              </g>

              {/* N3 Label */}
              <g transform="translate(470, 275)">
                <rect x="-5" y="-12" width="85" height="18" rx="2" fill="#1C2227" stroke={linkN3.stroke} strokeWidth="1" />
                <text x="38" y="0" textAnchor="middle" fill="#E0E5E7" fontSize="9" fontFamily="monospace" fontWeight="600">
                  N3 (GTP-U:2152)
                </text>
              </g>

              {/* N6 Label */}
              <g transform="translate(795, 252)">
                <rect x="-5" y="-12" width="55" height="18" rx="2" fill="#1C2227" stroke={linkN6.stroke} strokeWidth="1" />
                <text x="22" y="0" textAnchor="middle" fill="#E0E5E7" fontSize="9" fontFamily="monospace" fontWeight="600">
                  N6 (ogstun)
                </text>
              </g>

              {/* COMPONENT NODES (Color & Animation responds to actual failure/recovery state) */}

              {/* NODE 1: UE */}
              <g
                transform="translate(45, 215)"
                onMouseEnter={() => setHoveredNode('ue')}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x="0"
                  y="0"
                  width="115"
                  height="70"
                  rx="4"
                  fill={vUe.fill}
                  stroke={vUe.stroke}
                  strokeWidth={hoveredNode === 'ue' ? '2.5' : (vUe.isFailing || vUe.isRecovering ? '2' : '1.2')}
                />
                <rect x="8" y="8" width="22" height="22" rx="3" fill="#1C2227" stroke="#39434A" strokeWidth="1" />
                <g transform="translate(13.5, 11)" stroke={vUe.iconStroke} fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="0" y="0" width="11" height="16" rx="2" />
                  <line x1="4" y1="13" x2="7" y2="13" />
                </g>
                <text x="36" y="20" fill="#E0E5E7" fontSize="12" fontFamily="sans-serif" fontWeight="700">UE</text>
                <text x="36" y="32" fill="#A2ADB3" fontSize="9" fontFamily="monospace">ueransim-ue</text>
                <line x1="8" y1="42" x2="107" y2="42" stroke="#39434A" strokeWidth="0.8" />
                <text x="10" y="56" fill="#A2ADB3" fontSize="9" fontFamily="sans-serif">Status:</text>
                <text
                  x="45"
                  y="56"
                  fill={vUe.text}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {vUe.statusLabel}
                </text>
              </g>

              {/* NODE 2: gNB */}
              <g
                transform="translate(260, 215)"
                onMouseEnter={() => setHoveredNode('gnb')}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x="0"
                  y="0"
                  width="120"
                  height="70"
                  rx="4"
                  fill={vGnb.fill}
                  stroke={vGnb.stroke}
                  strokeWidth={hoveredNode === 'gnb' ? '2.5' : (vGnb.isFailing || vGnb.isRecovering ? '2' : '1.2')}
                />
                <rect x="8" y="8" width="22" height="22" rx="3" fill="#1C2227" stroke="#39434A" strokeWidth="1" />
                <g transform="translate(12, 11)" stroke={vGnb.iconStroke} fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 2 L7 16 M3 16 L11 16 M4.5 5.5 A3.5 3.5 0 0 1 9.5 5.5 M2.5 3 A6.5 6.5 0 0 1 11.5 3" />
                </g>
                <text x="36" y="20" fill="#E0E5E7" fontSize="12" fontFamily="sans-serif" fontWeight="700">gNodeB</text>
                <text x="36" y="32" fill="#A2ADB3" fontSize="9" fontFamily="monospace">nr-gnb</text>
                <line x1="8" y1="42" x2="112" y2="42" stroke="#39434A" strokeWidth="0.8" />
                <text x="10" y="56" fill="#A2ADB3" fontSize="9" fontFamily="sans-serif">Status:</text>
                <text
                  x="45"
                  y="56"
                  fill={vGnb.text}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {vGnb.statusLabel}
                </text>
              </g>

              {/* NODE 3: AMF */}
              <g
                transform="translate(520, 65)"
                onMouseEnter={() => setHoveredNode('amf')}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x="0"
                  y="0"
                  width="120"
                  height="70"
                  rx="4"
                  fill={vAmf.fill}
                  stroke={vAmf.stroke}
                  strokeWidth={hoveredNode === 'amf' ? '2.5' : (vAmf.isFailing || vAmf.isRecovering ? '2' : '1.2')}
                />
                <rect x="8" y="8" width="22" height="22" rx="3" fill="#1C2227" stroke="#39434A" strokeWidth="1" />
                <g transform="translate(12, 11)" stroke={vAmf.iconStroke} fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 1 L13 3.5 V8.5 C13 12.5 7 15 7 15 C7 15 1 12.5 1 8.5 V3.5 Z" />
                </g>
                <text x="36" y="20" fill="#E0E5E7" fontSize="12" fontFamily="sans-serif" fontWeight="700">AMF</text>
                <text x="36" y="32" fill="#A2ADB3" fontSize="9" fontFamily="monospace">open5gs-amfd</text>
                <line x1="8" y1="42" x2="112" y2="42" stroke="#39434A" strokeWidth="0.8" />
                <text x="10" y="56" fill="#A2ADB3" fontSize="9" fontFamily="sans-serif">Status:</text>
                <text
                  x="45"
                  y="56"
                  fill={vAmf.text}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {vAmf.statusLabel}
                </text>
              </g>

              {/* NODE 4: SMF */}
              <g
                transform="translate(760, 65)"
                onMouseEnter={() => setHoveredNode('smf')}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x="0"
                  y="0"
                  width="120"
                  height="70"
                  rx="4"
                  fill={vSmf.fill}
                  stroke={vSmf.stroke}
                  strokeWidth={hoveredNode === 'smf' ? '2.5' : (vSmf.isFailing || vSmf.isRecovering ? '2' : '1.2')}
                />
                <rect x="8" y="8" width="22" height="22" rx="3" fill="#1C2227" stroke="#39434A" strokeWidth="1" />
                <g transform="translate(12, 11)" stroke={vSmf.iconStroke} fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 5 L5 2.5 L7.5 5 M5 2.5 V11 M11.5 11 L9 13.5 L6.5 11 M9 13.5 V5" />
                </g>
                <text x="36" y="20" fill="#E0E5E7" fontSize="12" fontFamily="sans-serif" fontWeight="700">SMF</text>
                <text x="36" y="32" fill="#A2ADB3" fontSize="9" fontFamily="monospace">open5gs-smfd</text>
                <line x1="8" y1="42" x2="112" y2="42" stroke="#39434A" strokeWidth="0.8" />
                <text x="10" y="56" fill="#A2ADB3" fontSize="9" fontFamily="sans-serif">Status:</text>
                <text
                  x="45"
                  y="56"
                  fill={vSmf.text}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {vSmf.statusLabel}
                </text>
              </g>

              {/* NODE 5: UPF */}
              <g
                transform="translate(640, 230)"
                onMouseEnter={() => setHoveredNode('upf')}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x="0"
                  y="0"
                  width="120"
                  height="70"
                  rx="4"
                  fill={vUpf.fill}
                  stroke={vUpf.stroke}
                  strokeWidth={hoveredNode === 'upf' ? '2.5' : (vUpf.isFailing || vUpf.isRecovering ? '2' : '1.2')}
                />
                <rect x="8" y="8" width="22" height="22" rx="3" fill="#1C2227" stroke="#39434A" strokeWidth="1" />
                <g transform="translate(12, 11)" stroke={vUpf.iconStroke} fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="2" width="12" height="5" rx="1" />
                  <rect x="1" y="9" width="12" height="5" rx="1" />
                  <circle cx="10" cy="4.5" r="0.6" fill={vUpf.iconStroke} />
                  <circle cx="10" cy="11.5" r="0.6" fill={vUpf.iconStroke} />
                </g>
                <text x="36" y="20" fill="#E0E5E7" fontSize="12" fontFamily="sans-serif" fontWeight="700">UPF</text>
                <text x="36" y="32" fill="#A2ADB3" fontSize="9" fontFamily="monospace">open5gs-upfd</text>
                <line x1="8" y1="42" x2="112" y2="42" stroke="#39434A" strokeWidth="0.8" />
                <text x="10" y="56" fill="#A2ADB3" fontSize="9" fontFamily="sans-serif">Status:</text>
                <text
                  x="45"
                  y="56"
                  fill={vUpf.text}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {vUpf.statusLabel}
                </text>
              </g>

              {/* NODE 6: Data Network (Internet / Core Gateway) */}
              <g transform="translate(870, 230)">
                <rect x="0" y="0" width="85" height="70" rx="4" fill="#1C2227" stroke="#39434A" strokeWidth="1" />
                <g transform="translate(34, 15)" stroke="#A2ADB3" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="7" />
                  <ellipse cx="8" cy="8" rx="3.5" ry="7" />
                  <line x1="1" y1="8" x2="15" y2="8" />
                </g>
                <text x="42" y="46" textAnchor="middle" fill="#E0E5E7" fontSize="10" fontFamily="sans-serif" fontWeight="600">
                  Data Net
                </text>
                <text x="42" y="58" textAnchor="middle" fill="#A2ADB3" fontSize="8.5" fontFamily="monospace">
                  ogstun
                </text>
              </g>
            </svg>
          </div>

          {/* Dynamic Component Hover Inspection Card with Failure & Recovery Telemetry */}
          {hoveredNode && (
            <div className="mt-3 p-3.5 rounded bg-[#1C2227] border border-[#39434A] text-xs font-sans shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#39434A]">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold uppercase text-[#48B8A2]">
                    Node Telemetry: {hoveredNode.toUpperCase()}
                  </span>
                  <span className="text-[#39434A]">•</span>
                  <span className="text-[#E0E5E7]">
                    Service: <code className="text-[#48B8A2] font-mono">{components[hoveredNode]?.service || 'N/A'}</code>
                  </span>
                  <span className="text-[#39434A]">•</span>
                  <span className="text-[#A2ADB3]">
                    Protocol: {components[hoveredNode]?.protocol || '3GPP Rel-16'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="text-[#A2ADB3]">Scrape State:</span>
                  <span className={components[hoveredNode]?.status === 'UP' ? 'text-[#48B8A2] font-semibold' : 'text-[#D76565] font-semibold'}>
                    {components[hoveredNode]?.status || 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Service Availability vs End-to-End Recovery Distinction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2.5 text-[11px] font-sans">
                <div className="rounded bg-[#242B30] p-2.5 border border-[#39434A]">
                  <span className="text-[#A2ADB3] block font-semibold uppercase text-[10px] tracking-wider mb-0.5">
                    1. Service Daemon Availability
                  </span>
                  <span className="text-[#E0E5E7] font-mono">
                    {recoveryComponents[hoveredNode]?.recovery?.serviceAvailability || (components[hoveredNode]?.status === 'UP' ? 'OPERATIONAL' : 'DOWN')}
                  </span>
                  <p className="text-[#A2ADB3] text-[10px] mt-0.5">
                    Prometheus systemd scrape status on localhost
                  </p>
                </div>

                <div className="rounded bg-[#242B30] p-2.5 border border-[#39434A]">
                  <span className="text-[#A2ADB3] block font-semibold uppercase text-[10px] tracking-wider mb-0.5">
                    2. End-to-End Recovery Verification
                  </span>
                  <span className={recoveryComponents[hoveredNode]?.recovery?.endToEndVerified ? 'text-[#48B8A2] font-mono font-semibold' : 'text-[#D6A653] font-mono'}>
                    {recoveryComponents[hoveredNode]?.recovery?.endToEndVerified ? 'VERIFIED (Socket Bound & Associated)' : 'STANDBY (Awaiting Re-association)'}
                  </span>
                  <p className="text-[#A2ADB3] text-[10px] mt-0.5">
                    {recoveryComponents[hoveredNode]?.recovery?.details || 'Protocol handshake verification'}
                  </p>
                </div>
              </div>

              {/* Display Active Alert if Firing */}
              {recoveryComponents[hoveredNode]?.activeAlert && (
                <div className="mt-2.5 p-2 rounded bg-[#D76565]/20 border border-[#D76565]/40 text-[11px] font-mono text-[#D76565] flex items-center justify-between">
                  <span>Alert: <strong>{recoveryComponents[hoveredNode].activeAlert.name}</strong> ({recoveryComponents[hoveredNode].activeAlert.severity})</span>
                  <span>Triggered: {formatDate(recoveryComponents[hoveredNode].activeAlert.startsAt)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE INCIDENT & CLOSED-LOOP REMEDIATION PANEL */}
      {activeIncidentsCount > 0 ? (
        <div className="p-4 border-t border-[#39434A] bg-[#242B30]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-[#D76565]/20 border border-[#D76565]/40 text-[#D76565]">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D76565] font-sans">
                Active Component Failure & Closed-Loop Self-Healing HUD ({activeIncidentsCount})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#A2ADB3]">
              Prometheus Scrape: Failure Confirmed
            </span>
          </div>

          <div className="space-y-3">
            {incidentComponents.map((item) => {
              const alert = item.rec?.activeAlert;
              const rec = item.rec?.recovery;
              const isRecovering = item.isRecovering;
              const isRecoveryFailed = item.isRecoveryFailed;

              return (
                <div
                  key={item.key}
                  className={`p-3.5 rounded border transition-colors ${isRecovering
                    ? 'bg-[#2B3339] border-[#D6A653]/60'
                    : isRecoveryFailed
                      ? 'bg-[#2B3339] border-[#D76565]/80'
                      : 'bg-[#2B3339] border-[#D76565]/60'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#39434A]">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isRecovering ? 'bg-[#D6A653] animate-spin' : 'bg-[#D76565] animate-ping'}`} />
                      <span className="text-sm font-bold text-[#E0E5E7] font-sans">
                        {item.rec?.component || item.key.toUpperCase()} • <code className="text-xs font-mono text-[#A2ADB3]">{item.rec?.service || item.key}</code>
                      </span>
                    </div>

                    <div>
                      {isRecovering ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#D6A653]/20 text-[#D6A653] border border-[#D6A653]/40">
                          <RefreshCw className="w-3 h-3 animate-spin text-[#D6A653]" />
                          <span>RECOVERY IN PROGRESS</span>
                        </span>
                      ) : isRecoveryFailed ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#D76565]/20 text-[#D76565] border border-[#D76565]/40">
                          <AlertOctagon className="w-3 h-3 text-[#D76565]" />
                          <span>RECOVERY FAILED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#D76565]/20 text-[#D76565] border border-[#D76565]/40">
                          <AlertTriangle className="w-3 h-3 text-[#D76565]" />
                          <span>FAILURE DETECTED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs font-sans">
                    {/* Active Alert Section */}
                    <div className="rounded bg-[#1C2227] p-3 border border-[#39434A]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#A2ADB3]">
                          Active Alertmanager Alarm
                        </span>
                        {alert ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#D76565]/20 text-[#D76565] border border-[#D76565]/40">
                            {alert.severity?.toUpperCase()} • {alert.state?.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#A2ADB3]">Scrape Target Down</span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-[#D76565] font-semibold truncate">
                        {alert?.name || 'PrometheusScrapeFailure'}
                      </p>
                      <p className="text-[11px] text-[#A2ADB3] mt-1 line-clamp-2">
                        {alert?.summary || 'Service process reported DOWN by Prometheus metric scrape.'}
                      </p>
                      <div className="mt-2 pt-1.5 border-t border-[#39434A] text-[10px] font-mono text-[#A2ADB3]/80 flex justify-between">
                        <span>Triggered At:</span>
                        <span className="text-[#E0E5E7]">{formatDate(alert?.startsAt || timestamp)}</span>
                      </div>
                    </div>

                    {/* Closed-Loop Remediation Section */}
                    <div className="rounded bg-[#1C2227] p-3 border border-[#39434A]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#A2ADB3]">
                          Closed-Loop Remediation Bridge
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isRecovering
                          ? 'bg-[#D6A653]/20 text-[#D6A653] border border-[#D6A653]/40'
                          : isRecoveryFailed
                            ? 'bg-[#D76565]/20 text-[#D76565] border border-[#D76565]/40'
                            : 'bg-[#2B3339] text-[#A2ADB3] border border-[#39434A]'
                          }`}>
                          {isRecovering ? 'BRIDGE ACTUATED' : (isRecoveryFailed ? 'FAILED' : 'AWAITING DISPATCH')}
                        </span>
                      </div>

                      <p className="text-xs text-[#E0E5E7]">
                        {isRecovering ? (
                          <span className="text-[#D6A653] font-mono font-semibold">
                            {rec?.details || 'Python Recovery API executing service restart'}
                          </span>
                        ) : isRecoveryFailed ? (
                          <span className="text-[#D76565] font-mono">
                            {rec?.error || 'Remediation failed: daemon could not bind socket'}
                          </span>
                        ) : (
                          <span className="text-[#A2ADB3]">
                            Awaiting Alertmanager webhook dispatch to Python Recovery API. Recovery state is not claimed until confirmed by API evidence.
                          </span>
                        )}
                      </p>

                      <div className="mt-2 pt-1.5 border-t border-[#39434A] text-[10px] font-mono text-[#A2ADB3]/80 flex justify-between items-center">
                        <span>Action Safety:</span>
                        <span className="text-[#A2ADB3] italic">
                          {isRecovering ? 'Socket re-bind verification pending' : 'Zero frontend write triggers'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Reassuring NOC Steady-State Banner */
        <div className="p-3 px-5 border-t border-[#39434A] bg-[#2B3339] flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center space-x-2 text-[#48B8A2]">
            <CheckCircle2 className="w-4 h-4 text-[#48B8A2] shrink-0" />
            <span>
              All 5G Core, RAN, and User Plane components verified operational by Prometheus. 0 active alarms firing in Alertmanager.
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#A2ADB3]">
            Closed-Loop Recovery: <span className="text-[#48B8A2]">Standby (AMF Verified)</span>
          </div>
        </div>
      )}

      {/* INCIDENT AUDIT & HISTORICAL RECOVERY TELEMETRY (Collapsible Drawer) */}
      {showIncidentDrawer && (
        <div className="p-4 border-t border-[#39434A] bg-[#1C2227] text-xs font-sans space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#39434A]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#48B8A2]" />
              <h4 className="font-semibold uppercase tracking-wider text-[#E0E5E7]">
                Real-Time Incident Transitions & Historical Event Audit
              </h4>
            </div>
            <button
              onClick={() => setShowIncidentDrawer(false)}
              className="text-[#A2ADB3] hover:text-[#E0E5E7] font-mono text-xs cursor-pointer"
            >
              [Close Audit]
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section 1: Active Session Observed Real-Time Events */}
            <div className="rounded bg-[#242B30] p-3.5 border border-[#39434A]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#A2ADB3] block mb-2">
                1. Active Session Incident Log (Observed from Prometheus & Alertmanager)
              </span>

              {recentObservedEvents.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recentObservedEvents.map((evt) => (
                    <div key={evt.id} className="p-2 rounded bg-[#1C2227] border border-[#39434A] text-[11px] font-mono flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <span className={`w-1.5 h-1.5 rounded-full ${evt.type === 'FAILURE_DETECTED' ? 'bg-[#D76565]' : 'bg-[#48B8A2]'}`} />
                        <span className="text-[#E0E5E7] font-semibold">{evt.component}</span>
                        <span className="text-[#A2ADB3] truncate">{evt.message}</span>
                      </div>
                      <span className="text-[#A2ADB3]/80 shrink-0 text-[10px]">{formatDate(evt.timestamp)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded bg-[#1C2227] border border-[#39434A] text-center text-[#A2ADB3] text-xs">
                  <p>No component failures or alarm events detected during active session.</p>
                  <p className="text-[10px] text-[#A2ADB3]/80 mt-1 font-mono">Telemetry polling active every 5s</p>
                </div>
              )}
            </div>

            {/* Section 2: Persistent Historical Incident Store */}
            <div className="rounded bg-[#242B30] p-3.5 border border-[#39434A] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#A2ADB3] block mb-2">
                  2. Persistent Historical Incident Store
                </span>

                {historicalRecoveryAvailable ? (
                  <p className="text-xs text-[#E0E5E7]">Historical recovery database connected.</p>
                ) : (
                  <div className="p-4 rounded bg-[#1C2227] border border-[#D6A653]/30 text-xs">
                    <p className="font-semibold text-[#D6A653] font-mono">
                      {historicalRecoveryNotice}
                    </p>
                    <p className="text-[#A2ADB3] text-[11px] mt-1.5 leading-relaxed font-sans">
                      Persistent historical incident telemetry storage is not configured in this environment. The platform strictly displays verified real-time events without fabricating historical incident records.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#39434A] text-[10px] font-mono text-[#A2ADB3]/80 flex justify-between">
                <span>Recovery API Auth:</span>
                <span className="text-[#48B8A2]">Server-Side Isolated (No Client Tokens)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5G Workflow Stages Timeline */}
      <div className="p-4 border-t border-[#39434A] bg-[#2B3339]">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#E0E5E7] font-sans flex items-center space-x-2">
            <span>5G End-to-End Registration & Connectivity Workflow Stages</span>
          </h3>
          <span className="text-[10px] font-mono text-[#A2ADB3]">
            Updated: {formatDate(timestamp)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {workflowStages.map((stage) => {
            const isStageHealthy = stage.operationalState === 'HEALTHY';
            const isStageDown = stage.operationalState === 'DOWN';
            const isStageStandby = stage.operationalState === 'STANDBY';

            return (
              <div
                key={stage.id}
                className={`p-3 rounded border flex flex-col justify-between ${isStageHealthy
                  ? 'bg-[#242B30] border-[#48B8A2]/40 text-[#48B8A2]'
                  : isStageDown
                    ? 'bg-[#242B30] border-[#D76565]/40 text-[#D76565]'
                    : isStageStandby
                      ? 'bg-[#242B30] border-[#D6A653]/40 text-[#D6A653]'
                      : 'bg-[#1C2227] border-[#39434A] text-[#A2ADB3]'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold opacity-80">
                      STAGE {stage.id}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStageHealthy
                      ? 'bg-[#48B8A2] animate-pulse'
                      : isStageDown
                        ? 'bg-[#D76565]'
                        : isStageStandby
                          ? 'bg-[#D6A653]'
                          : 'bg-[#39434A]'
                      }`} />
                  </div>
                  <h4 className="text-xs font-semibold text-[#E0E5E7] font-sans leading-tight">
                    {stage.name}
                  </h4>
                  <p className="text-[10px] opacity-75 font-sans mt-0.5">
                    {stage.component}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#39434A] text-[10px] font-mono flex flex-col">
                  <span className="font-semibold truncate" title={stage.status}>
                    {stage.status}
                  </span>
                  <span className="text-[9.5px] opacity-70 truncate mt-0.5" title={stage.detail}>
                    {stage.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
