import React from 'react';
import { MetricNode } from './ui/MetricNode';

export function ComponentCard({ componentKey, data }) {
  return (
    <MetricNode
      componentKey={componentKey}
      data={data}
    />
  );
}
