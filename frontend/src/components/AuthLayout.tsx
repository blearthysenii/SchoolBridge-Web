import logoUrl from "../images/logo.png";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F0F4F8",
      }}
    >
      {/* Left brand panel */}
      <div
        style={{
          flex: "0 0 42%",
          background: "linear-gradient(155deg, #0A1628 0%, #0F1E3D 50%, #0D3B38 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "48px 56px",
          position: "relative",
          overflow: "hidden",
        }}
        className="sb-auth-panel"
      >
        {/* Background decorations */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(15,118,110,0.12)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "-60px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: "rgba(20,184,166,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            right: "40px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(15,118,110,0.07)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "auto" }}>
          <img
            src={logoUrl}
            alt="SchoolBridge"
            style={{ height: "36px", width: "auto" }}
          />
          <span
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "18px",
              letterSpacing: "-0.3px",
            }}
          >
            SchoolBridge
          </span>
        </div>

        {/* Middle content */}
        <div style={{ marginTop: "auto", marginBottom: "auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              background: "rgba(15,118,110,0.25)",
              border: "1px solid rgba(20,184,166,0.3)",
              borderRadius: "999px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#14B8A6",
              }}
            />
            <span style={{ color: "#5EEAD4", fontSize: "12px", fontWeight: 600 }}>
              Platformë Edukative
            </span>
          </div>

          <h2
            style={{
              color: "#FFFFFF",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.8px",
              lineHeight: 1.25,
              marginBottom: "14px",
            }}
          >
            Analizo. Mëso.
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #0F766E, #14B8A6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Përmirëso rezultatet.
            </span>
          </h2>

          <p
            style={{
              color: "#94A3B8",
              fontSize: "14.5px",
              lineHeight: 1.7,
              maxWidth: "340px",
            }}
          >
            Platforma adaptive për mësuesit — gjurmo boshllëqet mësimore, menaxho klasat dhe merr rekomandime të mbështetura nga AI.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ marginTop: "auto" }}>
          {[
            "Analitikë e detajuar për çdo nxënës",
            "Detektim automatik i boshllëqeve",
            "Menaxhim i testeve dhe pyetjeve",
          ].map((feature) => (
            <div
              key={feature}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "rgba(15,118,110,0.3)",
                  border: "1px solid rgba(20,184,166,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#14B8A6",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <span style={{ color: "#CBD5E1", fontSize: "13px" }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#1E293B",
                letterSpacing: "-0.5px",
                marginBottom: "6px",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: "14px", color: "#64748B" }}>{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sb-auth-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
