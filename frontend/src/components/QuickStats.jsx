import React from 'react';
import { ShoppingBag, CheckCircle, Clock, Sparkles } from 'lucide-react';

export default function QuickStats({ stats }) {
  const statItems = [
    {
      label: 'Items Bought This Week',
      value: stats?.itemsBoughtThisWeek ?? 0,
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Items Currently Pending',
      value: stats?.itemsPending ?? 0,
      icon: Clock,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Grocery Requests Processed',
      value: stats?.groceryRequestsProcessed ?? 0,
      icon: ShoppingBag,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Learned Preferences',
      value: stats?.savedPreferences ?? 0,
      icon: Sparkles,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="stat-card">
            <div className="stat-icon" style={{ background: item.bg, color: item.color }}>
              <Icon size={22} />
            </div>
            <div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
