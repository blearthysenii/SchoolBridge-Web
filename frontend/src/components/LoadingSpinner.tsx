type LoadingSpinnerProps = {
  size?: number;
  text?: string;
  fullPage?: boolean;
};

export default function LoadingSpinner({ size = 32, text, fullPage }: LoadingSpinnerProps) {
  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: fullPage ? "0" : "40px",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid rgba(37, 99, 235, 0.12)`,
          borderTopColor: "#2563EB",
          borderRadius: "50%",
          animation: "sb-spin 0.75s linear infinite",
          flexShrink: 0,
        }}
      />
      {text && (
        <p style={{ color: "#64748B", fontSize: "13.5px", fontWeight: 500 }}>{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}
