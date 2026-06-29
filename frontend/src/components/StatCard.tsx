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
        background: "rgba(255,255,255,0.66)",
        backdropFilter: "blur(18px)",
        borderRadius: "24px",
        padding: "20px",
        border: "1px solid rgba(255,255,255,0.76)",
        boxShadow: "0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        minWidth: 0,
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 22px 52px rgba(15,23,42,0.11), inset 0 1px 0 rgba(255,255,255,0.9)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86)";
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "17px",
          background: `linear-gradient(145deg, ${color}18, rgba(255,255,255,0.62))`,
          border: "1px solid rgba(255,255,255,0.82)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.76)",
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "25px",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "5px", fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}
