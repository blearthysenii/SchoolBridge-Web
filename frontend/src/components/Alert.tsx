type AlertType = "success" | "error" | "warning" | "info";

type AlertProps = {
  type: AlertType;
  message: string;
  onClose?: () => void;
};

const config: Record<AlertType, { bg: string; border: string; text: string; iconColor: string; icon: React.ReactNode }> = {
  success: {
    bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", iconColor: "#059669",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
  error: {
    bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", iconColor: "#DC2626",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", iconColor: "#D97706",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", iconColor: "#2563EB",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4m0-4h.01" />
      </svg>
    ),
  },
};

export default function Alert({ type, message, onClose }: AlertProps) {
  const c = config[type];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 14px",
        borderRadius: "8px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: "13.5px",
        fontWeight: 500,
        marginBottom: "14px",
      }}
    >
      <span style={{ color: c.iconColor, flexShrink: 0, display: "flex" }}>{c.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: c.text,
            opacity: 0.55,
            padding: "0 2px",
            fontSize: "15px",
            lineHeight: 1,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Mbyll"
        >
          ×
        </button>
      )}
    </div>
  );
}
