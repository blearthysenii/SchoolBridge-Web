type AlertType = "success" | "error" | "warning" | "info";

type AlertProps = {
  type: AlertType;
  message: string;
  onClose?: () => void;
};

const config: Record<AlertType, { bg: string; border: string; text: string; iconColor: string; icon: React.ReactNode }> = {
  success: {
    bg: "rgba(236, 253, 245, 0.76)", border: "rgba(167, 243, 208, 0.86)", text: "#065F46", iconColor: "#059669",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
  error: {
    bg: "rgba(254, 242, 242, 0.76)", border: "rgba(254, 202, 202, 0.88)", text: "#991B1B", iconColor: "#DC2626",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bg: "rgba(255, 251, 235, 0.78)", border: "rgba(253, 230, 138, 0.9)", text: "#92400E", iconColor: "#D97706",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    bg: "rgba(239, 246, 255, 0.78)", border: "rgba(191, 219, 254, 0.9)", text: "#1E40AF", iconColor: "#2563EB",
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
        padding: "13px 15px",
        borderRadius: "18px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: "0 12px 28px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        color: c.text,
        fontSize: "13.5px",
        fontWeight: 700,
        marginBottom: "16px",
      }}
    >
      <span style={{ color: c.iconColor, flexShrink: 0, display: "flex" }}>{c.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.42)",
            border: "1px solid rgba(255,255,255,0.62)",
            cursor: "pointer",
            color: c.text,
            opacity: 0.72,
            padding: "2px 7px",
            borderRadius: "10px",
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
