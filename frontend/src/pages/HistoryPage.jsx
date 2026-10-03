import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, ArrowRight, Trash2, PlusCircle } from 'lucide-react';
import { api } from '../services/api';
import { LoadingState, EmptyState } from '../components/StateViews';

export default function HistoryPage({ onOpenList, onNavigate }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const data = await api.getLists();
      setLists(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleDeleteList = async (listId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this grocery list?')) return;

    try {
      await api.deleteList(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
            Purchase History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            All past roommate grocery lists and kitchen restock logs.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create')}
          className="btn btn-primary"
          id="history-create-new-btn"
        >
          <PlusCircle size={16} />
          <span>New Grocery Request</span>
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading grocery history..." />
      ) : lists.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No grocery lists recorded yet"
          description="When you create and save shopping lists from your roommate's messages, they will appear here."
          action={
            <button onClick={() => onNavigate('create')} className="btn btn-primary">
              Create First List
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lists.map((list) => {
            const isCompleted = list.status === 'completed' || (list.stats?.pending === 0 && list.stats?.active > 0);
            const dateStr = new Date(list.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={list.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
                onClick={() => onOpenList(list.id)}
                id={`history-list-${list.id}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{list.title}</h3>
                      {isCompleted ? (
                        <span className="item-preference-badge" style={{ background: 'var(--badge-active-bg)', color: 'var(--badge-active-text)' }}>
                          <CheckCircle2 size={12} />
                          <span>Fully Purchased</span>
                        </span>
                      ) : (
                        <span className="item-preference-badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
                          <Clock size={12} />
                          <span>{list.stats?.pending} pending</span>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span>{list.stats?.total} items ({list.stats?.purchased} purchased, {list.stats?.pending} pending)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => handleDeleteList(list.id, e)}
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      title="Delete this list"
                      id={`delete-history-list-${list.id}`}
                    >
                      <Trash2 size={15} />
                    </button>

                    <button className="btn btn-secondary btn-sm">
                      <span>Open List</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '0.25rem' }}>
                  <div className="progress-container" style={{ margin: 0, height: 6 }}>
                    <div className="progress-fill" style={{ width: `${list.stats?.percentComplete}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
