import React from 'react';
import { SystemDiagnostics } from '../components/SystemDiagnostics';

export function SystemDiagnosticsPage({ systemData, loading }) {
  return (
    <div className="space-y-6">
      <SystemDiagnostics systemData={systemData} loading={loading} />
    </div>
  );
}

