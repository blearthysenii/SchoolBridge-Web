import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoUrl from "../images/logo.png";

type User = {
  full_name: string;
  email: string;
  role: string;
} | null;

type LayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  user?: User;
  actions?: React.ReactNode;
};

const navItems = [
  {
    label: "Paneli Kryesor",
    path: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Dorëzo Rezultate",
    path: "/submit-results",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const archiveNavIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 13h4" />
  </svg>
);

const archiveNavItems = [
  { label: "Nxënës joaktivë", path: "/inactive-students", icon: archiveNavIcon },
  { label: "Lëndë joaktive", path: "/inactive-subjects", icon: archiveNavIcon },
  { label: "Koncepte joaktive", path: "/inactive-concepts", icon: archiveNavIcon },
  { label: "Teste të arkivuara", path: "/archived-tests", icon: archiveNavIcon },
];

export default function Layout({ children, title, subtitle, backTo, backLabel, user, actions }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0F4F8" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 90,
            display: "none",
          }}
          className="sb-sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sb-sidebar${sidebarOpen ? " sb-sidebar-open" : ""}`}
        style={{
          width: "240px",
          background: "#0F1629",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          transition: "transform 0.25s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <img
              src={logoUrl}
              alt="SchoolBridge"
              style={{ height: "30px", width: "auto", objectFit: "contain" }}
            />
            <span
              style={{
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "-0.2px",
              }}
            >
              SchoolBridge
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 0" }}>
          <div
            style={{
              padding: "8px 16px 4px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#475569",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Menuja
          </div>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 16px",
                  margin: "2px 8px",
                  color: active ? "#FFFFFF" : "#94A3B8",
                  textDecoration: "none",
                  background: active ? "rgba(15,118,110,0.22)" : "transparent",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                  borderLeft: active ? "3px solid #14B8A6" : "3px solid transparent",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          <div
            style={{
              padding: "16px 16px 4px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#475569",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Arkivi
          </div>
          {archiveNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 16px",
                  margin: "2px 8px",
                  color: active ? "#FFFFFF" : "#94A3B8",
                  textDecoration: "none",
                  background: active ? "rgba(15,118,110,0.22)" : "transparent",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                  borderLeft: active ? "3px solid #14B8A6" : "3px solid transparent",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {user && (
          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#0F766E,#14B8A6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    color: "#F1F5F9",
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.full_name}
                </div>
                <div style={{ color: "#475569", fontSize: "11px" }}>
                  {user.role === "teacher" ? "Mësues" : "Nxënës"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "7px 10px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                borderRadius: "7px",
                color: "#F87171",
                cursor: "pointer",
                fontSize: "12.5px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "background 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Dil nga llogaria
            </button>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div
        className="sb-main-with-sidebar"
        style={{
          flex: 1,
          marginLeft: "240px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Topbar */}
        <header
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "sticky",
            top: 0,
            zIndex: 50,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#64748B",
              flexShrink: 0,
            }}
            className="sb-hamburger"
            aria-label="Menuja"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "6px 12px",
                cursor: "pointer",
                color: "#64748B",
                fontSize: "13px",
                fontWeight: 500,
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              {backLabel || "Prapa"}
            </button>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#1E293B",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#94A3B8",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>{actions}</div>}
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: "24px",
          }}
          className="sb-fade-in"
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sb-sidebar { transform: translateX(-100%); }
          .sb-sidebar.sb-sidebar-open { transform: translateX(0); }
          .sb-main-with-sidebar { margin-left: 0 !important; }
          .sb-sidebar-overlay { display: block !important; }
          .sb-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
