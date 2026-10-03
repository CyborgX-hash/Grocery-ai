import React from 'react';

export default function ProgressBar({ completed, total }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ margin: '1.25rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {completed} / {total} items purchased
        </span>
        <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
          {percentage}%
        </span>
      </div>

      <div className="progress-container">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}
