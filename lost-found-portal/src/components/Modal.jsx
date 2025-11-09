export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="modal-root" role="dialog" aria-modal="true" onClick={onBackdrop}>
      <div className="panel modal-card" role="document">
        {title && <h3>{title}</h3>}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
