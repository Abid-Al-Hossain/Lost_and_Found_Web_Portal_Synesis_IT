export default function Modal({ open, onClose, title, children, footer }) {
    if (!open) return null
  
    return (
      <div
        className="modal-root"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="panel modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
  
          <div className="modal-body">
            {children}
          </div>
  
          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    )
  }
  