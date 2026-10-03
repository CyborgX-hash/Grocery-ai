import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Edit2, Trash2, BrainCircuit, Info } from 'lucide-react';
import { api } from '../services/api';
import AddPreferenceModal from '../components/AddPreferenceModal';
import { LoadingState, EmptyState } from '../components/StateViews';

const PREF_ICONS = {
  Milk: '🥛',
  Bread: '🍞',
  Eggs: '🥚',
  Atta: '🌾',
  Chips: '🍿',
  Maggi: '🍜',
  Coffee: '☕',
  Tea: '🍵',
  Sugar: '🧂',
  General: '🛒',
};

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPref, setEditingPref] = useState(null);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await api.getPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleOpenAdd = () => {
    setEditingPref(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pref) => {
    setEditingPref(pref);
    setIsModalOpen(true);
  };

  const handleSavePref = async (prefData) => {
    try {
      if (prefData.id) {
        await api.updatePreference(prefData.id, prefData);
      } else {
        await api.createPreference(prefData);
      }
      fetchPreferences();
    } catch (err) {
      console.error('Failed to save preference:', err);
      alert(err.message || 'Failed to save preference');
    }
  };

  const handleDeletePref = async (id) => {
    if (!window.confirm('Delete this roommate preference?')) return;
    try {
      await api.deletePreference(id);
      setPreferences((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete preference:', err);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
            Personal Preferences & Kitchen Memory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Teach MessyList AI your household's exact brands and defaults.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          id="add-preference-btn"
        >
          <Plus size={16} />
          <span>Add Preference</span>
        </button>
      </div>

      {/* Explanatory Memory Callout */}
      <div
        className="card"
        style={{
          background: 'var(--bg-secondary)',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <BrainCircuit size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            How AI Uses This Memory
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Whenever your roommate types a vague message like <em>"bhai milk le aana"</em>, MessyList consults this memory and automatically selects <strong>Amul Taaza Toned Milk (1 packet)</strong>. No more guessing or buying the wrong brand!
          </p>
        </div>
      </div>

      {/* Preferences List */}
      {loading ? (
        <LoadingState message="Loading kitchen preferences..." />
      ) : preferences.length === 0 ? (
        <EmptyState
          icon="🧠"
          title="No preferences added yet"
          description="Add your first preference (e.g. Milk → Amul Taaza) so the AI knows exactly what to pick."
          action={
            <button onClick={handleOpenAdd} className="btn btn-primary">
              Add First Preference
            </button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
          {preferences.map((pref) => {
            const icon = PREF_ICONS[pref.itemName] || '🛒';

            return (
              <div
                key={pref.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1.25rem',
                }}
                id={`preference-card-${pref.id}`}
              >
                <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.75rem', lineHeight: 1, userSelect: 'none' }}>{icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{pref.itemName}</span>
                      <span className="item-preference-badge">
                        <Sparkles size={11} />
                        <span>AI Learned</span>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '0.3rem' }}>
                      → {pref.preferredProduct}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                      Default: {pref.defaultQuantity} {pref.defaultUnit}
                    </div>

                    {pref.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                        "{pref.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => handleOpenEdit(pref)}
                    className="btn-icon"
                    style={{ width: 32, height: 32 }}
                    title="Edit preference"
                    id={`edit-pref-${pref.id}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePref(pref.id)}
                    className="btn-icon"
                    style={{ width: 32, height: 32, color: '#ef4444' }}
                    title="Delete preference"
                    id={`delete-pref-${pref.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Preference Modal */}
      <AddPreferenceModal
        isOpen={isModalOpen}
        preference={editingPref}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePref}
      />
    </div>
  );
}
