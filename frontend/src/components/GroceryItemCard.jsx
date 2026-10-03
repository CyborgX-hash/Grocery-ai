import React from 'react';
import { Check, Edit2, Trash2, RotateCcw, Sparkles, XCircle } from 'lucide-react';

const CATEGORY_ICONS = {
  Dairy: '🥛',
  'Dairy & Eggs': '🥚',
  Bakery: '🍞',
  'Pantry & Grains': '🌾',
  Pantry: '🧂',
  Produce: '🍎',
  Snacks: '🍿',
  Beverages: '☕',
  General: '🛒',
};

export default function GroceryItemCard({
  item,
  isReviewMode = false,
  onTogglePurchase,
  onEdit,
  onDelete,
  onRestore,
}) {
  const isCancelled = item.status === 'cancelled';
  const isPurchased = Boolean(item.isPurchased);
  const icon = CATEGORY_ICONS[item.category] || '🛒';

  return (
    <div
      className={`item-card fade-in ${isCancelled ? 'cancelled' : ''} ${isPurchased ? 'purchased' : ''}`}
      id={`item-card-${item.id}`}
    >
      <div className="item-left">
        {/* Shopping list checkbox (only if active) */}
        {!isReviewMode && !isCancelled && (
          <button
            onClick={() => onTogglePurchase && onTogglePurchase(item.id, !isPurchased)}
            className={`custom-checkbox ${isPurchased ? 'checked' : ''}`}
            aria-label={`Mark ${item.name} as ${isPurchased ? 'not purchased' : 'purchased'}`}
            id={`checkbox-item-${item.id}`}
          >
            {isPurchased && <Check size={14} strokeWidth={3} />}
          </button>
        )}

        <div style={{ fontSize: '1.4rem', userSelect: 'none', lineHeight: 1 }}>
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <div className="item-title">
            <span>{item.name}</span>

            {item.matchedPreference && (
              <span className="item-preference-badge" title="Matched roommate kitchen preference">
                <Sparkles size={11} />
                <span>Roommate Pref</span>
              </span>
            )}

            {isCancelled && (
              <span className="item-badge-cancelled">
                <XCircle size={12} />
                <span>Cancelled</span>
              </span>
            )}
          </div>

          <div className="item-meta">
            <span>
              {item.quantity} {item.unit}
            </span>
            {item.category && item.category !== 'General' && (
              <span> • {item.category}</span>
            )}
            {item.notes && !isCancelled && (
              <span style={{ color: 'var(--text-secondary)' }}> — {item.notes}</span>
            )}
          </div>

          {isCancelled && item.notes && (
            <div className="item-note-cancelled">
              Reason: {item.notes}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {isCancelled ? (
          onRestore && (
            <button
              onClick={() => onRestore(item.id)}
              className="btn btn-secondary btn-sm"
              title="Restore to active items"
              id={`restore-item-${item.id}`}
            >
              <RotateCcw size={14} />
              <span>Restore</span>
            </button>
          )
        ) : (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                title="Edit item"
                id={`edit-item-${item.id}`}
              >
                <Edit2 size={14} />
              </button>
            )}
          </>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="btn-icon"
            style={{ width: 32, height: 32, color: '#ef4444' }}
            title="Delete item"
            id={`delete-item-${item.id}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
