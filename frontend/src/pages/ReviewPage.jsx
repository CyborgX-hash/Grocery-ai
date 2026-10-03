import React, { useState } from 'react';
import { Sparkles, Plus, Check, ArrowLeft, AlertCircle, Save } from 'lucide-react';
import GroceryItemCard from '../components/GroceryItemCard';
import EditItemModal from '../components/EditItemModal';
import { api } from '../services/api';

export default function ReviewPage({ parsedData, onSaveSuccess, onBack }) {
  const [items, setItems] = useState(parsedData?.items || []);
  const [listTitle, setListTitle] = useState(
    `Restock — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  );
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const activeCount = items.filter((i) => i.status === 'active').length;
  const cancelledCount = items.filter((i) => i.status === 'cancelled').length;

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveItemEdit = (updatedItem) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const handleDeleteItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleRestoreItem = (itemId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: 'active', notes: null } : item
      )
    );
  };

  const handleAddNewItem = () => {
    const newItem = {
      id: `manual-${Date.now()}`,
      name: '',
      quantity: 1,
      unit: 'packet',
      category: 'General',
      notes: null,
      status: 'active',
      isPurchased: false,
    };
    setEditingItem(newItem);
    setIsEditModalOpen(true);
  };

  const handleSaveNewOrUpdatedItem = (item) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      return [...prev, item];
    });
  };

  const handleSaveList = async () => {
    if (items.length === 0) {
      setError('You must have at least one grocery item in the list.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const createdList = await api.createList({
        title: listTitle.trim() || 'Roommate Grocery List',
        rawInput: parsedData?.rawInput || '',
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          notes: item.notes,
          status: item.status,
          confidence: item.confidence ?? 1.0,
          matchedPreference: item.matchedPreference || null,
        })),
      });

      onSaveSuccess(createdList.id);
    } catch (err) {
      console.error('Failed to save list:', err);
      setError(err.message || 'Failed to save grocery list. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Top Bar with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={onBack} className="btn btn-ghost btn-sm" id="back-to-input-btn">
          <ArrowLeft size={16} />
          <span>Edit Raw Messages</span>
        </button>

        <span className="ai-status-pill">
          <Sparkles size={13} color="var(--accent-primary)" />
          <span>{parsedData?.provider || 'Open-Weight AI'}</span>
        </span>
      </div>

      {/* Header & Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
          Here's what I understood
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Review the parsed items, check for cancelled products, and make any manual adjustments before saving.
        </p>
      </div>

      {/* AI Interpretation Summary Banner */}
      <div
        className="card"
        style={{
          background: 'var(--bg-secondary)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>
              {activeCount} active items • {cancelledCount} cancelled/delegated
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Detected: {parsedData?.detectedLanguage || 'Hinglish / English'}
            </div>
          </div>
        </div>

        <button
          onClick={handleAddNewItem}
          className="btn btn-secondary btn-sm"
          id="review-add-item-btn"
        >
          <Plus size={14} />
          <span>Add Item Manually</span>
        </button>
      </div>

      {/* List Title Input */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <label className="input-label" style={{ marginBottom: '0.4rem' }}>
          List Name
        </label>
        <input
          type="text"
          className="input-text"
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          placeholder="e.g. Weekend Restock, Quick Snack Run"
          id="list-title-input"
        />
      </div>

      {/* Error Notice */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--badge-cancelled-bg)',
            color: 'var(--badge-cancelled-text)',
            border: '1px solid var(--badge-cancelled-border)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Items Section */}
      <div className="items-list">
        {items.map((item) => (
          <GroceryItemCard
            key={item.id}
            item={item}
            isReviewMode={true}
            onEdit={handleEditClick}
            onDelete={handleDeleteItem}
            onRestore={handleRestoreItem}
          />
        ))}
      </div>

      {/* Bottom Save Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <button onClick={handleAddNewItem} className="btn btn-secondary">
          <Plus size={16} />
          <span>Add Another Item</span>
        </button>

        <button
          onClick={handleSaveList}
          disabled={isSaving || items.length === 0}
          className="btn btn-primary btn-lg"
          id="save-shopping-list-btn"
        >
          <Save size={18} />
          <span>{isSaving ? 'Saving List...' : 'Save Shopping List'}</span>
        </button>
      </div>

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        item={editingItem}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveNewOrUpdatedItem}
      />
    </div>
  );
}
