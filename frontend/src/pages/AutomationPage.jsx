import React from 'react';
import { JenkinsPanel } from '../components/JenkinsPanel';

export function AutomationPage({ jenkinsData, loading }) {
  return (
    <div className="space-y-6">
      <JenkinsPanel jenkinsData={jenkinsData} loading={loading} />
    </div>
  );
}

