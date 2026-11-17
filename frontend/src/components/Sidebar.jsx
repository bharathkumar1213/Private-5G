import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  BellRing,
  ShieldCheck,
  Cpu,
  Terminal,
  Radio,
  Shield,
  FileText,
  Compass,
  GitBranch,
  PlaySquare,
  Wrench,
  User,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export function Sidebar({ overviewData, activeAlertCount = 0, isOpen, onClose }) {
  const [devMode, setDevMode] = useState(false);
  const promConnected = overviewData?.prometheus?.connected ?? false;
  const amConnected = overviewData?.alertmanager?.connected ?? false;

  const mainNavItems = [
    { to: '/', label: 'Spaces (Overview)', icon: LayoutDashboard },
    { to: '/metrics', label: 'Explore (Metrics)', icon: Compass },
    {
      to: '/alerts',
      label: 'LookML (Alerts)',
      icon: GitBranch,
      badge: activeAlertCount > 0 ? activeAlertCount : null,
      badgeColor: 'bg-[#FFF1F1] text-[#C94A4A] border-[#F4D0D0]',
    },
  ];

  const operationsNavItems = [
    { to: '/self-healing', label: 'SQL Runner (Healing)', icon: PlaySquare },
    { to: '/automation', label: 'Admin (Jenkins CI)', icon: Wrench },
    { to: '/system', label: 'Account (System)', icon: Terminal },
  ];

  const complianceNavItems = [
    { to: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
    { to: '/terms-conditions', label: 'Terms & Conditions', icon: FileText },
  ];

  const renderNavGroup = (title, items) => (
    <div className="mb-4">
      <div className="px-4 mb-1.5">
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8995A8] font-sans">
          {title}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 mx-2 rounded-xl text-xs font-sans transition-all duration-150 border-l-[3px] ${isActive
                  ? 'bg-[#FFF4E5] text-[#17213B] font-semibold border-[#F59E0B]'
                  : 'text-[#66758B] hover:text-[#17213B] hover:bg-[#F7F9FC] border-transparent'
                }`
              }
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0 transition-colors text-[#8995A8] group-hover:text-[#F59E0B]" />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-lg border ${item.badgeColor || 'bg-[#FFF4E5] text-[#F59E0B] border-[#F6D7A6]'
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#17213B]/25 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#162036] border-r border-[#E9EDF2] dark:border-[#2B3B57] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 select-none shadow-[8px_0_28px_rgba(30,54,87,0.035)] ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div>
          <div className="px-5 py-5 border-b border-[#E9EDF2] dark:border-[#2B3B57] flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F59E0B] text-white shadow-[0_5px_12px_rgba(245,158,11,0.22)]">
              <Radio className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-extrabold tracking-tight text-[#17213B] dark:text-white font-sans">
                  Private 5G
                </span>
                <span className="text-[9px] font-mono bg-[#FFF4E5] border border-[#F6D7A6] text-[#F59E0B] px-1.5 py-0.5 rounded-md font-semibold uppercase">
                  NOC
                </span>
              </div>
              <p className="text-[10px] text-[#8995A8] dark:text-[#AEB8C8] font-sans truncate mt-0.5">
                DevOps Private 5G Core
              </p>
            </div>
          </div>

          {/* Nav Items Container */}
          <div className="py-5 overflow-y-auto max-h-[calc(100vh-250px)]">
            {renderNavGroup('Network Operations', mainNavItems)}
            {renderNavGroup('Automation & Reliability', operationsNavItems)}
            {renderNavGroup('Compliance & Governance', complianceNavItems)}
          </div>
        </div>

        <div className="border-t border-[#E9EDF2] dark:border-[#2B3B57] bg-[#FBFCFE] dark:bg-[#162036] text-xs font-sans">
          <div className="px-4 py-3 flex items-center justify-between border-b border-[#E9EDF2] dark:border-[#2B3B57] text-[11px]">
            <div className="flex items-center space-x-2 text-[#66758B] dark:text-[#AEB8C8]">
              <span className="font-semibold text-[#17213B] dark:text-white">Dev Mode</span>
            </div>
            <button
              onClick={() => setDevMode(!devMode)}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white dark:bg-[#202C43] border border-[#E9EDF2] dark:border-[#2B3B57] text-[10px] font-mono text-[#66758B] dark:text-[#AEB8C8] hover:text-[#F59E0B] transition-colors"
            >
              <span>Dev</span>
              <span className={`font-bold ${devMode ? 'text-[#F59E0B]' : 'text-[#8995A8]'}`}>
                {devMode ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <div className="p-4 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${promConnected ? 'bg-[#059669]' : 'bg-[#DC2626]'}`} />
                <span className="text-[#66758B] dark:text-[#C7D1E0]">Prometheus</span>
              </div>
              <span className={promConnected ? 'text-[#059669]' : 'text-[#DC2626]'}>
                {promConnected ? '19091 UP' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${amConnected ? 'bg-[#059669]' : 'bg-[#DC2626]'}`} />
                <span className="text-[#66758B] dark:text-[#C7D1E0]">Alertmanager</span>
              </div>
              <span className={amConnected ? 'text-[#059669]' : 'text-[#DC2626]'}>
                {amConnected ? '19093 UP' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
