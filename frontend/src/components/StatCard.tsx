type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
};

export default function StatCard({ label, value, icon, color = "#2563EB" }: StatCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        transition: "box-shadow 0.15s",
      }}
    >
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "10px",
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#1E293B",
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "13px", color: "#64748B", marginTop: "3px" }}>{label}</div>
      </div>
    </div>
  );
}
