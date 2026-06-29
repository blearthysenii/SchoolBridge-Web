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
            position: fixed; inset: 0; background: rgba(15,23,42,0.34);
            display: flex; align-items: center; justify-content: center;
            z-index: 200; padding: 16px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            backdrop-filter: blur(10px);
          }
          .cfd-modal {
            background: rgba(255,255,255,0.84); border: 1px solid rgba(255,255,255,0.74);
            border-radius: 24px; width: 100%; max-width: 390px;
            box-shadow: 0 28px 76px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.86);
            padding: 26px; backdrop-filter: blur(22px);
          }
          .cfd-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
          .cfd-title { font-size: 16px; font-weight: 850; color: #0F172A; }
          .cfd-close {
            background: rgba(248,250,252,0.76); border: 1px solid rgba(226,232,240,0.82);
            cursor: pointer; color: #94A3B8; padding: 6px; border-radius: 13px;
            display: inline-flex; align-items: center; justify-content: center;
            transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
          }
          .cfd-close:hover { color: #475569; background: rgba(255,255,255,0.92); transform: translateY(-1px); }
          .cfd-message { font-size: 13.5px; color: #475569; line-height: 1.6; margin: 0; }
          .cfd-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }
          .cfd-btn {
            display: inline-flex; align-items: center; gap: 6px;
            border-radius: 15px; font-size: 13px; font-weight: 800;
            cursor: pointer; border: 1px solid transparent; padding: 9px 16px;
            transition: background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
            white-space: nowrap;
          }
          .cfd-btn:hover:not(:disabled) { transform: translateY(-1px); }
          .cfd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .cfd-btn-secondary { background: rgba(255,255,255,0.66); color: #475569; border-color: rgba(226,232,240,0.86); }
          .cfd-btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.94); }
          .cfd-btn-primary { background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #fff; box-shadow: 0 12px 26px rgba(37,99,235,0.22); }
          .cfd-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #1D4ED8, #1E40AF); }
          .cfd-btn-danger { background: linear-gradient(135deg, #EF4444, #DC2626); color: #fff; box-shadow: 0 12px 24px rgba(220,38,38,0.18); }
          .cfd-btn-danger:hover:not(:disabled) { background: linear-gradient(135deg, #DC2626, #B91C1C); }

          @media (max-width: 480px) {
            .cfd-modal { padding: 22px; border-radius: 22px; }
            .cfd-actions { flex-direction: column-reverse; }
            .cfd-actions .cfd-btn { width: 100%; justify-content: center; }
          }
        `}</style>
      </div>
    </div>
  );
}
