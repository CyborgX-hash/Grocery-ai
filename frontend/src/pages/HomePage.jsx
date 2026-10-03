import React, { useEffect, useState } from 'react';
import { PlusCircle, ArrowRight, Sparkles, CheckCircle2, ShoppingCart, ListOrdered, Calendar } from 'lucide-react';
import { api } from '../services/api';
import QuickStats from '../components/QuickStats';
import { EmptyState, LoadingState } from '../components/StateViews';

export default function HomePage({ onNavigate, onOpenList }) {
  const [stats, setStats] = useState(null);
  const [recentLists, setRecentLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getLists()])
      .then(([statsData, listsData]) => {
        setStats(statsData);
        setRecentLists(listsData.slice(0, 3));
      })
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <section className="hero-section">
        <h1 className="hero-title">
          Turn chaotic grocery messages into a <span>clean shopping list</span>.
        </h1>

        <p className="hero-subtitle">
          Your roommate texts in chaotic Hinglish, cancels items mid-conversation, and forgets brands.
          MessyList uses open-weight AI to understand intent, quantities, and kitchen preferences in seconds.
        </p>

        <div className="hero-actions">
          <button
            onClick={() => onNavigate('create')}
            className="btn btn-primary btn-lg"
            id="hero-create-btn"
          >
            <PlusCircle size={20} />
            <span>Create Grocery List</span>
          </button>

          <button
            onClick={() => onNavigate('create', { triggerDemo: true })}
            className="btn btn-secondary btn-lg"
            id="hero-demo-btn"
          >
            <Sparkles size={18} color="var(--accent-primary)" />
            <span>Try Roommate Demo</span>
          </button>
        </div>
      </section>

      {/* Quick Statistics */}
      <QuickStats stats={stats} />

      {/* Recent Shopping Lists */}
      <section style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Recent Shopping Lists</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Your active and previously processed roommate requests
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="btn btn-ghost btn-sm"
            style={{ fontWeight: 600 }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <LoadingState message="Loading your grocery lists..." />
        ) : recentLists.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No grocery lists created yet"
            description="Paste your roommate's chaotic messages to generate your very first smart shopping checklist."
            action={
              <button onClick={() => onNavigate('create')} className="btn btn-primary">
                Create Grocery List
              </button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentLists.map((list) => {
              const isCompleted = list.status === 'completed' || (list.stats?.pending === 0 && list.stats?.active > 0);

              return (
                <div
                  key={list.id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                  onClick={() => onOpenList(list.id)}
                  id={`recent-list-${list.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>{list.title}</h3>
                        {isCompleted ? (
                          <span className="ai-status-pill" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                            <CheckCircle2 size={12} />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="ai-status-pill">
                            <span>{list.stats?.pending} pending</span>
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={13} />
                          {new Date(list.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>{list.stats?.total} total items</span>
                      </div>
                    </div>

                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); onOpenList(list.id); }}>
                      <span>Open Checklist</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Progress bar preview */}
                  <div style={{ marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <span>{list.stats?.purchased} of {list.stats?.active} items purchased</span>
                      <span style={{ fontWeight: 700 }}>{list.stats?.percentComplete}%</span>
                    </div>
                    <div className="progress-container" style={{ margin: 0, height: 6 }}>
                      <div className="progress-fill" style={{ width: `${list.stats?.percentComplete}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works Feature Spotlight */}
      <section style={{ marginTop: '3.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          Built for the Roommate Who Chats Like This
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: 550, margin: '0 auto 2rem' }}>
          MessyList handles the real chaos of shared living: mid-sentence mind changes, Hinglish vocabulary, and brand preferences.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="card">
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🗣️</div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Hinglish & Natural Slang</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Understands "doodh le aana", "5kg wala atta", "brown wali bread", and Indian household grocery jargon effortlessly.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🚫</div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Cancellation Intelligence</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Detects when someone texts "actually Rahul eggs la raha" and automatically cancels eggs with a transparent reason.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🧠</div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Kitchen Memory & Preferences</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Remembers your roommate only drinks Amul Taaza blue packet milk and eats 100% whole wheat brown bread without you having to retype it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
