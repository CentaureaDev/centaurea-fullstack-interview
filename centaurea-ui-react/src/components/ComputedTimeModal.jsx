import React from 'react';
import { createPortal } from 'react-dom';

function ComputedTimeModal({
  isOpen,
  value,
  maxValue,
  isFuture,
  isSaving,
  onChange,
  onCancel,
  onSave
}) {
  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h3 className="modal__title">Update Computed Time</h3>
        <div className="modal__content">
          <div className="form__group">
            <label className="form__label">Select a date and time (must be in the past)</label>
            <input
              type="datetime-local"
              className="form__input"
              value={value}
              max={maxValue}
              onChange={(event) => onChange(event.target.value)}
              autoFocus
            />
            {isFuture && <div className="modal__hint">Time must be in the past.</div>}
          </div>
        </div>
        <div className="modal__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={onSave}
            disabled={!value || isFuture || isSaving}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ComputedTimeModal;
