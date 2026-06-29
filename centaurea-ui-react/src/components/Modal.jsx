import { createPortal } from 'react-dom';

function Modal({ isOpen, title, onClose, actions, children }) {
  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">{title}</h3>
        <div className="modal__content">{children}</div>
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
