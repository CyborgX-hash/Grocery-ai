import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

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

const COMMON_UNITS = ['packet', 'pack', 'kg', 'g', 'pieces', 'dozen', 'litre', 'bottle', 'box', 'jar'];

export default function EditItemModal({ item, isOpen, onClose, onSave }) {
  if (!isOpen || !item) return null;

  const [name, setName] = useState(item.name || '');
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [unit, setUnit] = useState(item.unit || 'packet');
  const [category, setCategory] = useState(item.category || 'General');
  const [notes, setNotes] = useState(item.notes || '');
  const [status, setStatus] = useState(item.status || 'active');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...item,
      name: name.trim(),
      quantity: Number(quantity) > 0 ? Number(quantity) : 1,
      unit,
      category,
      notes: notes.trim() || null,
      status,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Edit Grocery Item</h3>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Item Name</label>
            <input
              type="text"
              className="input-text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amul Taaza Milk"
              required
              id="edit-item-name-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input
                type="number"
                step="any"
                min="0.1"
                className="input-text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                id="edit-item-qty-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Unit</label>
              <select
                className="select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                id="edit-item-unit-select"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                id="edit-item-category-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Status</label>
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                id="edit-item-status-select"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Notes / Roommate remarks</label>
            <input
              type="text"
              className="input-text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. check expiry date, Rahul bringing it, etc."
              id="edit-item-notes-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="save-item-modal-btn">
              <Check size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
