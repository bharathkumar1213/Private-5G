import React from 'react';
import { SelfHealingPanel } from '../components/SelfHealingPanel';

export function SelfHealingPage({ selfHealingData, loading }) {
  return (
    <div className="space-y-6">
      <SelfHealingPanel selfHealingData={selfHealingData} />
    </div>
  );
}

