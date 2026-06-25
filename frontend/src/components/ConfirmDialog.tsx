import { useEffect } from "react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  submitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Konfirmo",
  cancelLabel = "Anulo",
  variant = "default",
  submitting = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="cfd-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="cfd-modal">
        <div className="cfd-header">
          <div className="cfd-title">{title}</div>
          <button className="cfd-close" onClick={onCancel} aria-label="Mbyll">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="cfd-message">{message}</p>
        <div className="cfd-actions">
          <button type="button" className="cfd-btn cfd-btn-secondary" onClick={onCancel} disabled={submitting}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`cfd-btn ${variant === "danger" ? "cfd-btn-danger" : "cfd-btn-primary"}`}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? "Duke procesuar…" : confirmLabel}
          </button>
        </div>

        <style>{`
          .cfd-overlay {
            position: fixed; inset: 0; background: rgba(15,23,42,0.35);
            display: flex; align-items: center; justify-content: center;
            z-index: 200; padding: 16px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          .cfd-modal {
            background: #fff; border-radius: 12px; width: 100%; max-width: 380px;
            box-shadow: 0 12px 40px rgba(15,23,42,0.16); padding: 24px;
          }
          .cfd-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
          .cfd-title { font-size: 16px; font-weight: 700; color: #0F172A; }
          .cfd-close { background: none; border: none; cursor: pointer; color: #94A3B8; padding: 2px; border-radius: 5px; }
          .cfd-close:hover { color: #475569; background: #F1F5F9; }
          .cfd-message { font-size: 13.5px; color: #475569; line-height: 1.6; margin: 0; }
          .cfd-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }
          .cfd-btn {
            display: inline-flex; align-items: center; gap: 6px;
            border-radius: 7px; font-size: 13px; font-weight: 600;
            cursor: pointer; border: none; padding: 8px 16px;
            transition: background 0.12s; white-space: nowrap;
          }
          .cfd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .cfd-btn-secondary { background: #F1F5F9; color: #475569; }
          .cfd-btn-secondary:hover:not(:disabled) { background: #E2E8F0; }
          .cfd-btn-primary { background: #2563EB; color: #fff; }
          .cfd-btn-primary:hover:not(:disabled) { background: #1D4ED8; }
          .cfd-btn-danger { background: #DC2626; color: #fff; }
          .cfd-btn-danger:hover:not(:disabled) { background: #B91C1C; }

          @media (max-width: 480px) {
            .cfd-modal { padding: 20px; }
          }
        `}</style>
      </div>
    </div>
  );
}
