type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "rgba(15, 118, 110, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          color: "#0F766E",
        }}
      >
        {icon || (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z" />
          </svg>
        )}
      </div>
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "#1E293B",
          marginBottom: "6px",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: "13.5px",
            color: "#64748B",
            marginBottom: "20px",
            maxWidth: "280px",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
