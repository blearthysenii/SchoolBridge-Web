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

const ROLE_LABELS: Record<string, string> = {
  teacher: "Mësues",
  admin: "Administrator",
  student: "Nxënës",
};

const navItems = [
  {
    label: "Paneli Kryesor",
    path: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const archiveNavIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 13h4" />
  </svg>
);

const archiveNavItems = [
  { label: "Nxënës joaktivë", path: "/inactive-students" },
  { label: "Lëndë joaktive", path: "/inactive-subjects" },
  { label: "Koncepte joaktive", path: "/inactive-concepts" },
  { label: "Teste të arkivuara", path: "/archived-tests" },
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
    <div className="sb-shell">
      {sidebarOpen && (
        <div className="sb-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sb-sidebar${sidebarOpen ? " sb-sidebar-open" : ""}`}>
        <Link to="/dashboard" className="sb-sidebar-logo">
          <img src={logoUrl} alt="SchoolBridge" className="sb-sidebar-logo-img" />
          <span className="sb-sidebar-logo-text">SchoolBridge</span>
        </Link>

        <nav className="sb-sidebar-nav">
          <div className="sb-nav-label">Menuja</div>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sb-nav-item${active ? " sb-nav-item-active" : ""}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          <div className="sb-nav-label">Arkivi</div>
          {archiveNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sb-nav-item${active ? " sb-nav-item-active" : ""}`}
              >
                {archiveNavIcon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="sb-sidebar-footer">
            <div className="sb-sidebar-user">
              <div className="sb-avatar">{initials}</div>
              <div className="sb-sidebar-user-text">
                <div className="sb-sidebar-user-name">{user.full_name}</div>
                <div className="sb-sidebar-user-role">{ROLE_LABELS[user.role] ?? user.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="sb-logout-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Dil nga llogaria
            </button>
          </div>
        )}
      </aside>

      <div className="sb-main">
        <header className="sb-topbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sb-hamburger"
            aria-label="Menuja"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {backTo && (
            <button onClick={() => navigate(backTo)} className="sb-back-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              <span>{backLabel || "Prapa"}</span>
            </button>
          )}

          <div className="sb-topbar-titles">
            <h1 className="sb-topbar-title">{title}</h1>
            {subtitle && <p className="sb-topbar-subtitle">{subtitle}</p>}
          </div>

          {actions && <div className="sb-topbar-actions">{actions}</div>}
        </header>

        <main className="sb-page">{children}</main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .sb-shell, .sb-shell * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .sb-shell { display: flex; min-height: 100vh; background: #F8FAFC; color: #0F172A; width: 100%; max-width: 100vw; overflow-x: hidden; }

        .sb-sidebar-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.35);
          z-index: 90; display: none;
        }

        .sb-sidebar {
          width: 232px; background: #FFFFFF; border-right: 1px solid #E2E8F0;
          display: flex; flex-direction: column;
          position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
          transition: transform 0.22s ease;
        }
        .sb-sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 20px 16px; border-bottom: 1px solid #F1F5F9;
          text-decoration: none;
        }
        .sb-sidebar-logo-img { height: 28px; width: auto; object-fit: contain; }
        .sb-sidebar-logo-text { color: #0F172A; font-weight: 700; font-size: 14.5px; letter-spacing: -0.2px; }

        .sb-sidebar-nav { flex: 1; padding: 10px 8px; overflow-y: auto; }
        .sb-nav-label {
          padding: 10px 10px 4px; font-size: 10.5px; font-weight: 600;
          color: #94A3B8; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .sb-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; margin: 1px 0; border-radius: 7px;
          color: #475569; text-decoration: none;
          font-size: 13.5px; font-weight: 500;
          transition: background 0.12s, color 0.12s;
        }
        .sb-nav-item:hover { background: #F1F5F9; color: #0F172A; }
        .sb-nav-item-active { background: #EFF6FF; color: #2563EB; font-weight: 600; }
        .sb-nav-item-active svg { stroke: #2563EB; }

        .sb-sidebar-footer { padding: 12px 10px 14px; border-top: 1px solid #F1F5F9; }
        .sb-sidebar-user { display: flex; align-items: center; gap: 10px; padding: 8px 10px; margin-bottom: 2px; }
        .sb-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #DBEAFE; color: #2563EB;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 12px; flex-shrink: 0;
        }
        .sb-sidebar-user-text { overflow: hidden; }
        .sb-sidebar-user-name {
          font-size: 13px; font-weight: 600; color: #0F172A;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-sidebar-user-role { font-size: 11.5px; color: #94A3B8; }
        .sb-logout-btn {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 8px 10px; margin-top: 4px; border-radius: 7px;
          background: none; border: none; cursor: pointer;
          color: #64748B; font-size: 13.5px; font-weight: 500;
          transition: background 0.12s, color 0.12s;
        }
        .sb-logout-btn:hover { background: #FFF1F2; color: #E11D48; }

        .sb-main { margin-left: 232px; flex: 1; min-width: 0; max-width: 100%; display: flex; flex-direction: column; min-height: 100vh; }

        .sb-topbar {
          background: #FFFFFF; border-bottom: 1px solid #E2E8F0;
          padding: 0 24px; height: 60px;
          display: flex; align-items: center; gap: 14px;
          position: sticky; top: 0; z-index: 50;
        }
        .sb-hamburger {
          display: none; background: none; border: none; cursor: pointer;
          padding: 4px; color: #475569; flex-shrink: 0;
        }
        .sb-back-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: 1px solid #E2E8F0; border-radius: 7px;
          padding: 6px 12px; cursor: pointer;
          color: #475569; font-size: 13px; font-weight: 500;
          flex-shrink: 0; transition: background 0.12s, border-color 0.12s;
        }
        .sb-back-btn:hover { background: #F1F5F9; border-color: #CBD5E1; }

        .sb-topbar-titles { flex: 1; min-width: 0; }
        .sb-topbar-title {
          font-size: 16.5px; font-weight: 700; color: #0F172A; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-topbar-subtitle {
          font-size: 12px; color: #94A3B8; margin: 1px 0 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-topbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .sb-page { flex: 1; padding: 24px; max-width: 1100px; width: 100%; }

        /* ── Shared building blocks used across pages ── */
        .sb-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; }

        .sb-table-wrap { background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; overflow-x: auto; }
        .sb-table { width: 100%; border-collapse: collapse; min-width: 480px; }
        .sb-table th {
          text-align: left; font-size: 11.5px; font-weight: 600;
          color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;
          padding: 10px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0;
          white-space: nowrap;
        }
        .sb-table td {
          padding: 12px 16px; font-size: 13.5px; color: #334155;
          border-bottom: 1px solid #F1F5F9; vertical-align: middle;
        }
        .sb-table tr:last-child td { border-bottom: none; }
        .sb-table tr:hover td { background: #FAFBFF; }
        .sb-td-name { font-weight: 600; color: #0F172A; }
        .sb-td-link { font-weight: 600; color: #2563EB; text-decoration: none; }
        .sb-td-link:hover { text-decoration: underline; }
        .sb-td-meta { color: #64748B; }
        .sb-td-muted { color: #94A3B8; }
        .sb-td-actions { text-align: right; white-space: nowrap; }

        .sb-btn {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 7px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.12s, border-color 0.12s, color 0.12s;
          white-space: nowrap; border: 1px solid transparent;
        }
        .sb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sb-btn-primary { background: #2563EB; color: #fff; padding: 8px 14px; }
        .sb-btn-primary:hover:not(:disabled) { background: #1D4ED8; }
        .sb-btn-secondary { background: #F1F5F9; color: #475569; padding: 8px 16px; }
        .sb-btn-secondary:hover:not(:disabled) { background: #E2E8F0; }
        .sb-btn-ghost { background: #fff; color: #64748B; border-color: #E2E8F0; padding: 5px 11px; font-size: 12.5px; }
        .sb-btn-ghost:hover:not(:disabled) { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
        .sb-btn-danger-ghost { background: #fff; color: #64748B; border-color: #E2E8F0; padding: 5px 11px; font-size: 12.5px; }
        .sb-btn-danger-ghost:hover:not(:disabled) { background: #FFF1F2; color: #E11D48; border-color: #FECDD3; }
        .sb-btn-warn-ghost { background: #fff; color: #64748B; border-color: #E2E8F0; padding: 5px 11px; font-size: 12.5px; }
        .sb-btn-warn-ghost:hover:not(:disabled) { background: #FFFBEB; color: #B45309; border-color: #FDE68A; }
        .sb-btn-restore { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; padding: 6px 12px; font-size: 12.5px; }
        .sb-btn-restore:hover:not(:disabled) { background: #DBEAFE; }
        .sb-btn-danger { background: #DC2626; color: #fff; padding: 8px 14px; }
        .sb-btn-danger:hover:not(:disabled) { background: #B91C1C; }

        .sb-modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.35);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; padding: 16px;
        }
        .sb-modal { background: #fff; border-radius: 12px; width: 100%; max-width: 420px; box-shadow: 0 12px 40px rgba(15,23,42,0.16); padding: 28px; }
        .sb-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .sb-modal-title { font-size: 16px; font-weight: 700; color: #0F172A; }
        .sb-modal-close { background: none; border: none; cursor: pointer; color: #94A3B8; padding: 2px; border-radius: 5px; }
        .sb-modal-close:hover { color: #475569; background: #F1F5F9; }
        .sb-modal-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }

        .sb-form-group { margin-bottom: 14px; }
        .sb-form-label { display: block; font-size: 12.5px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .sb-form-input, .sb-form-select {
          width: 100%; padding: 9px 12px; border: 1px solid #E2E8F0; border-radius: 7px;
          font-size: 13.5px; color: #0F172A; background: #fff;
          outline: none; transition: border-color 0.12s, box-shadow 0.12s;
        }
        .sb-form-input:focus, .sb-form-select:focus { border-color: #93C5FD; box-shadow: 0 0 0 3px rgba(147,197,253,0.25); }
        .sb-form-input::placeholder { color: #CBD5E1; }
        .sb-form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
        }
        .sb-form-error { font-size: 12px; color: #DC2626; margin-top: 10px; }
        .sb-hint { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 7px; padding: 10px 12px; font-size: 12.5px; color: #92400E; margin-bottom: 14px; }

        .sb-tabs { display: flex; gap: 0; border-bottom: 1px solid #E2E8F0; margin-bottom: 22px; overflow-x: auto; }
        .sb-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; font-size: 13.5px; font-weight: 500; color: #64748B;
          border: none; border-bottom: 2px solid transparent; margin-bottom: -1px;
          cursor: pointer; white-space: nowrap; background: none; transition: color 0.12s;
        }
        .sb-tab:hover { color: #0F172A; }
        .sb-tab-active { color: #2563EB; border-bottom-color: #2563EB; }
        .sb-tab-badge { background: #F1F5F9; color: #64748B; font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 10px; min-width: 20px; text-align: center; }
        .sb-tab-active .sb-tab-badge { background: #EFF6FF; color: #2563EB; }

        .sb-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
        .sb-section-header-left { display: flex; align-items: center; gap: 12px; }
        .sb-section-icon { width: 38px; height: 38px; border-radius: 8px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sb-section-title { font-size: 15px; font-weight: 700; color: #0F172A; }
        .sb-section-count { font-size: 12px; color: #94A3B8; margin-top: 1px; }

        .sb-filter-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding: 12px 14px; }
        .sb-filter-row label { font-size: 12.5px; font-weight: 600; color: #64748B; white-space: nowrap; }

        .sb-fade-in { animation: sb-fade 0.15s ease; }
        @keyframes sb-fade { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 768px) {
          .sb-sidebar { transform: translateX(-100%); box-shadow: 4px 0 24px rgba(15,23,42,0.12); }
          .sb-sidebar.sb-sidebar-open { transform: translateX(0); }
          .sb-main { margin-left: 0; }
          .sb-sidebar-overlay { display: block; }
          .sb-hamburger { display: flex; }
          .sb-page { padding: 16px; }
          .sb-topbar { padding: 0 16px; }
          .sb-topbar-subtitle { display: none; }
        }

        @media (max-width: 560px) {
          .sb-topbar { flex-wrap: wrap; height: auto; min-height: 56px; padding: 10px 14px; gap: 8px 10px; }
          .sb-topbar-titles { order: 1; flex: 1 1 auto; }
          .sb-back-btn span { display: none; }
          .sb-back-btn { padding: 6px 9px; }
          .sb-topbar-actions { order: 3; flex: 1 1 100%; }
          .sb-topbar-actions .sb-btn { flex: 1; justify-content: center; }
          .sb-page { padding: 14px; }
          .sb-modal { padding: 20px; }
          .sb-section-header { gap: 10px 12px; }
          .sb-section-header .sb-btn-primary { padding: 7px 12px; font-size: 12.5px; }
          .sb-filter-row { flex-wrap: wrap; align-items: stretch; }
          .sb-filter-row label { width: 100%; }
          .sb-tab { padding: 9px 13px; font-size: 12.5px; gap: 5px; }
          .sb-table th, .sb-table td { padding: 10px 12px; }
          .sb-sidebar-logo { padding: 16px 16px 14px; }
        }

        .sb-tabs, .sb-table-wrap { -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
      `}</style>
    </div>
  );
}
