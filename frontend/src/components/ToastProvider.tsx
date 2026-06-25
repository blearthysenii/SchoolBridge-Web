import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4m0-4h.01" />
    </svg>
  ),
};

const COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", icon: "#059669" },
  error: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", icon: "#DC2626" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", icon: "#D97706" },
  info: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", icon: "#2563EB" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="sb-toast-stack">
        {toasts.map((t) => {
          const c = COLORS[t.type];
          return (
            <div
              key={t.id}
              className="sb-toast"
              style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
            >
              <span style={{ color: c.icon, flexShrink: 0, display: "flex" }}>{ICONS[t.type]}</span>
              <span className="sb-toast-message">{t.message}</span>
              <button className="sb-toast-close" onClick={() => dismiss(t.id)} aria-label="Mbyll" style={{ color: c.text }}>
                ×
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        .sb-toast-stack {
          position: fixed; top: 16px; right: 16px; z-index: 9998;
          display: flex; flex-direction: column; gap: 10px;
          width: min(360px, calc(100vw - 32px));
        }
        .sb-toast {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px; border-radius: 10px;
          font-size: 13.5px; font-weight: 500; line-height: 1.5;
          box-shadow: 0 8px 24px rgba(15,23,42,0.10);
          animation: sb-toast-in 0.18s ease;
        }
        .sb-toast-message { flex: 1; }
        .sb-toast-close {
          background: none; border: none; cursor: pointer;
          opacity: 0.55; padding: 0 2px; font-size: 16px; line-height: 1; flex-shrink: 0;
        }
        .sb-toast-close:hover { opacity: 0.9; }
        @keyframes sb-toast-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 560px) {
          .sb-toast-stack { top: auto; bottom: 16px; right: 16px; left: 16px; width: auto; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast duhet përdorur brenda ToastProvider");
  return ctx;
}
