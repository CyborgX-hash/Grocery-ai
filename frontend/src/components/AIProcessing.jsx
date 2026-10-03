import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  'Understanding messy messages...',
  'Extracting grocery items & quantities...',
  'Resolving corrections & cancellations...',
  'Matching saved roommate preferences...',
  'Finalizing structured shopping list...',
];

export default function AIProcessing() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card ai-loader-container fade-in">
      <div className="ai-pulse-orb">
        <Sparkles size={28} />
      </div>

      <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem' }}>
        MessyList AI is at work
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Dissecting chaotic roommate messages and cross-referencing your kitchen preferences...
      </p>

      <div className="ai-steps-list">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <div
              key={step}
              className={`ai-step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            >
              {isDone ? (
                <CheckCircle2 size={18} color="var(--accent-primary)" />
              ) : isActive ? (
                <Loader2 size={18} className="animate-spin" color="var(--accent-primary)" />
              ) : (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '2px solid var(--border-subtle)',
                  }}
                />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
