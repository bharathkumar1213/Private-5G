import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F1F4F7] dark:bg-[#101827] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white dark:bg-[#1A2438] border border-[#E9EDF2] dark:border-[#2B3B57] rounded-[22px] shadow-square p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
              Dashboard Encountered an Issue
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-4">
              A runtime exception was caught. Telemetry and background services are unaffected.
            </p>
            {this.state.error && (
              <pre className="text-left text-[11px] font-mono bg-slate-100 dark:bg-slate-900 text-red-700 dark:text-red-300 p-3 rounded mb-4 overflow-auto max-h-40 border border-slate-200 dark:border-slate-800">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
