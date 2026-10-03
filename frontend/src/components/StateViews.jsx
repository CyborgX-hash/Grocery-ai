import React from 'react';

export function EmptyState({ icon = '🛒', title, description, action }) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{icon}</div>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 420 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        border: '1px solid #fecaca',
        background: 'var(--badge-cancelled-bg)',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
      <h3 style={{ fontSize: '1.15rem', color: '#991b1b', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: '#b91c1c', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto 1.25rem' }}>
        {message || "Couldn't complete that operation. Please try again."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm">
          Try Again
        </button>
      )}
    </div>
  );
}
