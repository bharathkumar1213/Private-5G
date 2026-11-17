import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Menu,
  Clock,
  Sun,
  Moon,
  Settings,
  ChevronDown,
  ChevronRight,
  Filter,
  Activity,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { useTheme } from '../context/ThemeContext';

export function Header({
  overviewData,
  onManualRefresh,
  isRefreshing,
  onToggleSidebar,
}) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [clock, setClock] = useState({
    utc: new Date().toISOString().substring(11, 19) + ' UTC',
    local: new Date().toLocaleTimeString([], { hour12: false }),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock({
        utc: now.toISOString().substring(11, 19) + ' UTC',
        local: now.toLocaleTimeString([], { hour12: false }),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const health = overviewData?.networkHealth;
  const status = health?.status || 'UNAVAILABLE';
  const timestamp = overviewData?.timestamp;

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#162036]/95 backdrop-blur border-b border-[#E9EDF2] dark:border-[#2B3B57] transition-colors duration-200">
      <header className="bg-white dark:bg-[#162036] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-[#66758B] hover:bg-[#F5F7FA] hover:text-[#17213B] lg:hidden transition-colors"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-1 text-[11px] text-[#8995A8] font-sans">
              <span>Private 5G Core</span>
              <ChevronDown className="w-3 h-3 text-[#8995A8]" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#17213B] dark:text-white font-sans leading-tight">
              Executive Summary
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden xl:flex items-center space-x-2 text-xs font-mono bg-[#F5F7FA] dark:bg-[#202C43] px-2.5 py-1.5 rounded-xl border border-[#E9EDF2] dark:border-[#2B3B57] text-[#66758B] dark:text-[#C7D1E0]">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>UTC: {clock.utc}</span>
            <span className="text-[#C5CDD8]">|</span>
            <span>LOC: {clock.local}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#202C43] hover:bg-[#F5F7FA] text-xs font-medium text-[#66758B] dark:text-[#C7D1E0] hover:text-[#17213B] dark:hover:text-white transition-colors border border-[#E9EDF2] dark:border-[#2B3B57] cursor-pointer"
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#D89A32]" />
                <span className="hidden sm:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="hidden sm:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-[0_5px_12px_rgba(245,158,11,0.22)] disabled:opacity-50 cursor-pointer"
            title="Execute query sync and refresh dashboard metrics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Run</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-xl bg-white dark:bg-[#202C43] hover:bg-[#F5F7FA] text-[#66758B] dark:text-[#C7D1E0] hover:text-[#17213B] dark:hover:text-white transition-colors border border-[#E9EDF2] dark:border-[#2B3B57]"
            title="Toggle Filter & Parameter Bar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-[#FBFCFE] dark:bg-[#101827] border-t border-[#E9EDF2] dark:border-[#2B3B57] px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs font-sans transition-all">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <button
              onClick={() => setShowFilters(false)}
              className="flex items-center space-x-1 text-[#66758B] dark:text-[#AEB8C8] font-bold text-[11px] uppercase tracking-[0.1em] hover:text-[#17213B] dark:hover:text-white"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>FILTERS</span>
            </button>

            <span className="text-[#D8DEE7] dark:text-[#2B3B57]">|</span>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className="text-[#66758B] dark:text-[#AEB8C8] font-medium">Prometheus:</span>
              <code className="bg-white dark:bg-[#202C43] px-1.5 py-0.5 rounded-lg text-[#F59E0B] font-mono border border-[#E9EDF2] dark:border-[#2B3B57]">
                http://172.17.0.1:19091
              </code>
            </div>

            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className="text-[#66758B] dark:text-[#AEB8C8] font-medium">Alertmanager:</span>
              <code className="bg-white dark:bg-[#202C43] px-1.5 py-0.5 rounded-lg text-[#C68628] font-mono border border-[#E9EDF2] dark:border-[#2B3B57]">
                http://172.17.0.1:19093
              </code>
            </div>

            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className="text-[#66758B] dark:text-[#AEB8C8] font-medium">Resolution:</span>
              <span className="bg-white dark:bg-[#202C43] px-1.5 py-0.5 rounded-lg text-[#228B67] font-mono border border-[#E9EDF2] dark:border-[#2B3B57]">
                5s Poll (15m window)
              </span>
            </div>
          </div>

          {/* Right Status Indicator */}
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-[#66758B] dark:text-[#AEB8C8]">Overall State:</span>
            <StatusBadge status={status} size="xs" />
          </div>
        </div>
      )}
    </div>
  );
}
