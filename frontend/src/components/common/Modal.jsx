import { useEffect } from "react";

/**
 * Reusable overlay modal.
 * Props: title, onClose, children, size ("sm" | "md" | "lg"), customHeader
 */
export default function Modal({ title, onClose, children, size = "md", customHeader }) {
  /* Close on Escape key */
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop click propagation so clicking inside the card does NOT close it */}
      <div className={`modal-card modal-${size}`} onClick={(e) => e.stopPropagation()}>
        {customHeader ? (
          customHeader
        ) : (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
              ✕
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
