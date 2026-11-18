import React from 'react';
import { TimelineVisualizer } from '../TimelineVisualizer';

interface HistoryTabProps {
  history: {
    age: number;
    year: number;
    month?: number;
    summary: string;
    worldSummary?: string;
  }[];
  compact?: boolean;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history, compact = false }) => {
  return <TimelineVisualizer history={history} compact={compact} />;
};
