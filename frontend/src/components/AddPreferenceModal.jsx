import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'General',
  'Dairy',
  'Dairy & Eggs',
  'Bakery',
  'Produce',
  'Pantry & Grains',
  'Pantry',
  'Snacks',
  'Beverages',
];

const COMMON_UNITS = ['packet', 'pack', 'kg', 'g', 'pieces', 'dozen', 'litre', 'bottle', 'jar', 'box'];

export default function AddPreferenceModal({ preference, isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const [itemName, setItemName] = useState(preference?.itemName || '');
  const [preferredProduct, setPreferredProduct] = useState(preference?.preferredProduct || '');
  const [defaultQuantity, setDefaultQuantity] = useState(preference?.defaultQuantity || 1);
  const [defaultUnit, setDefaultUnit] = useState(preference?.defaultUnit || 'packet');
  const [category, setCategory] = useState(preference?.category || 'General');
  const [notes, setNotes] = useState(preference?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !preferredProduct.trim()) return;

    onSave({
      ...(preference?.id ? { id: preference.id } : {}),
      itemName: itemName.trim(),
      preferredProduct: preferredProduct.trim(),
      defaultQuantity: Number(defaultQuantity) > 0 ? Number(defaultQuantity) : 1,
      defaultUnit,
      category,
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.25rem' }}>
              {preference ? 'Edit Kitchen Preference' : 'Add Kitchen Preference'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          When anyone mentions this item in messy chats, MessyList AI will automatically choose this exact product.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Casual Item Mention (What roommate says)</label>
            <input
              type="text"
              className="input-text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Milk, Bread, Chips, Atta"
              required
              id="pref-item-name-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Preferred Brand / Exact Product</label>
            <input
              type="text"
              className="input-text"
              value={preferredProduct}
              onChange={(e) => setPreferredProduct(e.target.value)}
              placeholder="e.g. Amul Taaza Toned Milk (Blue pack)"
              required
              id="pref-preferred-product-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Default Quantity</label>
              <input
                type="number"
                step="any"
                min="0.1"
                className="input-text"
                value={defaultQuantity}
                onChange={(e) => setDefaultQuantity(e.target.value)}
                required
                id="pref-default-qty-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Default Unit</label>
              <select
                className="select"
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value)}
                id="pref-default-unit-select"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              id="pref-category-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Notes (Optional)</label>
            <input
              type="text"
              className="input-text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. check 3 days expiry, blue pack only"
              id="pref-notes-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="save-preference-submit-btn">
              <span>{preference ? 'Save Preference' : 'Add Preference'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
