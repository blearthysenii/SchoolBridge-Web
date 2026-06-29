import { type LucideIcon, Archive, BookOpen, Box, ChevronLeft, ClipboardCheck, FileText, Home, Layers, LogOut, Menu, Users, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import logoUrl from "../images/logo.png";

type UserType = {
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
  user?: UserType;
  actions?: React.ReactNode;
};

type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

const ROLE_LABELS: Record<string, string> = {
  teacher: "Mësues",
  admin: "Administrator",
  student: "Nxënës",
};

const navItems: NavItem[] = [
  { label: "Paneli Kryesor", path: "/dashboard", icon: Home },
  { label: "Dorëzo Rezultate", path: "/submit-results", icon: ClipboardCheck },
];

const archiveNavItems: NavItem[] = [
  { label: "Klasat jo aktive", path: "/inactive-classrooms", icon: Archive },
  { label: "Nxënës joaktivë", path: "/inactive-students", icon: Users },
  { label: "Lëndë joaktive", path: "/inactive-subjects", icon: BookOpen },
  { label: "Koncepte joaktive", path: "/inactive-concepts", icon: Layers },
  { label: "Teste të arkivuara", path: "/archived-tests", icon: FileText },
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sb-shell">
      {sidebarOpen && (
        <div className="sb-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sb-sidebar${sidebarOpen ? " sb-sidebar-open" : ""}`}>
        <div className="sb-sidebar-head">
          <Link to="/dashboard" className="sb-sidebar-logo" onClick={() => setSidebarOpen(false)}>
            <span className="sb-logo-orb">
              <img src={logoUrl} alt="SchoolBridge" className="sb-sidebar-logo-img" />
            </span>
            <span className="sb-sidebar-logo-text">SchoolBridge</span>
          </Link>

          <button className="sb-sidebar-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Mbyll menunë">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {user && (
          <div className="sb-user-card">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-sidebar-user-text">
              <div className="sb-sidebar-user-name">{user.full_name}</div>
              <div className="sb-sidebar-user-role">{ROLE_LABELS[user.role] ?? user.role}</div>
            </div>
          </div>
        )}

        <nav className="sb-sidebar-nav">
          <div className="sb-nav-label">Menuja</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sb-nav-item${active ? " sb-nav-item-active" : ""}`}
              >
                <span className="sb-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="sb-sidebar-separator" />
          <div className="sb-nav-label">Arkivi</div>
          {archiveNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sb-nav-item${active ? " sb-nav-item-active" : ""}`}
              >
                <span className="sb-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="sb-sidebar-footer">
            <div className="sb-footer-mini">
              <Box size={17} strokeWidth={1.8} />
              <span>Hapësira e mësuesit</span>
            </div>
            <button onClick={handleLogout} className="sb-logout-btn">
              <LogOut size={15} strokeWidth={2} />
              Dil nga llogaria
            </button>
          </div>
        )}
      </aside>

      <div className="sb-main">
        <header className="sb-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="sb-hamburger"
            aria-label="Menuja"
          >
            <Menu size={21} strokeWidth={2} />
          </button>

          {backTo && (
            <button onClick={() => navigate(backTo)} className="sb-back-btn">
              <ChevronLeft size={15} strokeWidth={2.2} />
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .sb-shell, .sb-shell * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; letter-spacing: 0; }

        .sb-shell {
          display: flex; min-height: 100vh; width: 100%; max-width: 100vw; overflow-x: hidden;
          background:
            radial-gradient(circle at 20% 0%, rgba(255,255,255,0.95), transparent 30%),
            radial-gradient(circle at 82% 8%, rgba(219,234,254,0.65), transparent 28%),
            #F3F4F6;
          color: #0F172A;
        }

        .sb-sidebar-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.28);
          z-index: 90; display: none; backdrop-filter: blur(6px);
        }

        .sb-sidebar {
          width: 292px; background: rgba(255,255,255,0.58);
          border: 1px solid rgba(255,255,255,0.76); border-radius: 28px;
          box-shadow: 0 24px 70px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(22px);
          display: flex; flex-direction: column;
          position: fixed; left: 20px; top: 20px; bottom: 20px; z-index: 100;
          padding: 18px; transition: transform 0.24s ease, opacity 0.2s ease;
        }
        .sb-sidebar-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .sb-sidebar-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; min-width: 0; }
        .sb-logo-orb {
          width: 44px; height: 44px; border-radius: 16px; background: rgba(255,255,255,0.72);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.72); box-shadow: 0 10px 20px rgba(15,23,42,0.08);
          flex-shrink: 0;
        }
        .sb-sidebar-logo-img { height: 26px; width: auto; object-fit: contain; }
        .sb-sidebar-logo-text { color: #0F172A; font-weight: 800; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sb-sidebar-close { display: none; background: rgba(255,255,255,0.7); border: 1px solid rgba(226,232,240,0.8); border-radius: 12px; color: #475569; padding: 7px; cursor: pointer; }

        .sb-user-card {
          display: flex; align-items: center; gap: 12px; padding: 12px; margin-bottom: 14px;
          border-radius: 22px; background: rgba(255,255,255,0.48);
          border: 1px solid rgba(255,255,255,0.72);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);
          min-width: 0;
        }
        .sb-avatar {
          width: 42px; height: 42px; border-radius: 15px;
          background: linear-gradient(145deg, #111827, #334155); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 13px; flex-shrink: 0;
          box-shadow: 0 12px 24px rgba(15,23,42,0.18);
        }
        .sb-sidebar-user-text { overflow: hidden; min-width: 0; }
        .sb-sidebar-user-name {
          font-size: 13.5px; font-weight: 800; color: #0F172A;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-sidebar-user-role { font-size: 12px; color: #64748B; margin-top: 2px; }

        .sb-sidebar-nav { flex: 1; padding: 2px 0 10px; overflow-y: auto; scrollbar-width: thin; }
        .sb-nav-label {
          padding: 12px 8px 7px; font-size: 10.5px; font-weight: 800;
          color: #94A3B8; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .sb-nav-item {
          position: relative; display: flex; align-items: center; gap: 11px;
          padding: 11px 12px; margin: 4px 0; border-radius: 18px;
          color: #475569; text-decoration: none;
          font-size: 13.5px; font-weight: 700;
          transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
        }
        .sb-nav-icon { width: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sb-nav-item:hover { background: rgba(255,255,255,0.58); color: #0F172A; transform: translateX(2px); }
        .sb-nav-item-active {
          color: #0F172A; font-weight: 800;
          background: linear-gradient(135deg, rgba(255,255,255,0.82), rgba(219,234,254,0.66));
          border: 1px solid rgba(255,255,255,0.82);
          box-shadow: 0 16px 36px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .sb-nav-item-active .sb-nav-icon { color: #2563EB; }
        .sb-sidebar-separator { height: 1px; margin: 14px 8px 4px; background: rgba(148,163,184,0.28); }

        .sb-sidebar-footer { padding-top: 14px; border-top: 1px solid rgba(148,163,184,0.22); }
        .sb-footer-mini {
          display: flex; align-items: center; gap: 8px; color: #64748B; font-size: 12.5px; font-weight: 700;
          padding: 8px 10px 10px;
        }
        .sb-logout-btn {
          display: flex; align-items: center; gap: 9px; width: 100%;
          padding: 11px 12px; border-radius: 16px;
          background: rgba(255,255,255,0.44); border: 1px solid rgba(255,255,255,0.64); cursor: pointer;
          color: #475569; font-size: 13.5px; font-weight: 800;
          transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
        }
        .sb-logout-btn:hover { background: rgba(254,242,242,0.72); color: #DC2626; transform: translateY(-1px); }

        .sb-main {
          margin-left: 340px; flex: 1; min-width: 0; max-width: 100%;
          display: flex; flex-direction: column; min-height: 100vh;
          padding: 20px 28px 28px 0;
        }

        .sb-topbar {
          min-height: 76px; padding: 0 22px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 14px;
          position: sticky; top: 20px; z-index: 50;
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.72); border-radius: 26px;
          box-shadow: 0 18px 46px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }
        .sb-hamburger {
          display: none; background: rgba(255,255,255,0.64); border: 1px solid rgba(226,232,240,0.9); border-radius: 14px;
          cursor: pointer; padding: 8px; color: #334155; flex-shrink: 0;
        }
        .sb-back-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.62); border: 1px solid rgba(226,232,240,0.8); border-radius: 15px;
          padding: 8px 12px; cursor: pointer;
          color: #475569; font-size: 13px; font-weight: 800;
          flex-shrink: 0; transition: background 0.16s ease, transform 0.16s ease;
        }
        .sb-back-btn:hover { background: rgba(255,255,255,0.86); transform: translateY(-1px); }

        .sb-topbar-titles { flex: 1; min-width: 0; }
        .sb-topbar-title {
          font-size: 23px; font-weight: 800; color: #020617; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-topbar-subtitle {
          font-size: 12.5px; color: #64748B; margin: 4px 0 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-topbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .sb-page { flex: 1; padding: 0; max-width: 1360px; width: 100%; }

        .sb-card {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.72); border-radius: 22px;
          box-shadow: 0 16px 38px rgba(15,23,42,0.07); backdrop-filter: blur(18px);
        }

        .sb-table-wrap {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.72); border-radius: 22px;
          overflow: hidden; overflow-x: auto; box-shadow: 0 16px 38px rgba(15,23,42,0.07); backdrop-filter: blur(18px);
        }
        .sb-table { width: 100%; border-collapse: collapse; min-width: 480px; }
        .sb-table th {
          text-align: left; font-size: 11.5px; font-weight: 800;
          color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;
          padding: 12px 16px; background: rgba(248,250,252,0.62); border-bottom: 1px solid rgba(226,232,240,0.72);
          white-space: nowrap;
        }
        .sb-table td {
          padding: 13px 16px; font-size: 13.5px; color: #334155;
          border-bottom: 1px solid rgba(241,245,249,0.86); vertical-align: middle;
        }
        .sb-table tr:last-child td { border-bottom: none; }
        .sb-table tr:hover td { background: rgba(255,255,255,0.52); }
        .sb-td-name { font-weight: 700; color: #0F172A; }
        .sb-td-link { font-weight: 800; color: #2563EB; text-decoration: none; }
        .sb-td-link:hover { text-decoration: underline; }
        .sb-td-meta { color: #64748B; }
        .sb-td-muted { color: #94A3B8; }
        .sb-td-actions { text-align: right; white-space: nowrap; }

        .sb-btn {
          display: inline-flex; align-items: center; gap: 7px;
          border-radius: 15px; font-size: 13px; font-weight: 800;
          cursor: pointer; transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
          white-space: nowrap; border: 1px solid transparent;
        }
        .sb-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .sb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sb-btn-primary { background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #fff; padding: 10px 15px; box-shadow: 0 12px 26px rgba(37,99,235,0.22); }
        .sb-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #1D4ED8, #1E40AF); }
        .sb-btn-secondary { background: rgba(255,255,255,0.62); color: #475569; border-color: rgba(226,232,240,0.82); padding: 9px 16px; }
        .sb-btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.9); }
        .sb-btn-ghost { background: rgba(255,255,255,0.62); color: #64748B; border-color: rgba(226,232,240,0.82); padding: 6px 12px; font-size: 12.5px; }
        .sb-btn-ghost:hover:not(:disabled) { background: rgba(239,246,255,0.8); color: #2563EB; border-color: #BFDBFE; }
        .sb-btn-danger-ghost, .sb-btn-warn-ghost { background: rgba(255,255,255,0.62); color: #64748B; border-color: rgba(226,232,240,0.82); padding: 6px 12px; font-size: 12.5px; }
        .sb-btn-danger-ghost:hover:not(:disabled), .sb-btn-warn-ghost:hover:not(:disabled) { background: rgba(255,251,235,0.86); color: #B45309; border-color: #FDE68A; }
        .sb-btn-restore { background: rgba(239,246,255,0.72); color: #2563EB; border-color: #BFDBFE; padding: 7px 13px; font-size: 12.5px; }
        .sb-btn-restore:hover:not(:disabled) { background: rgba(219,234,254,0.82); }
        .sb-btn-danger { background: #DC2626; color: #fff; padding: 9px 15px; }
        .sb-btn-danger:hover:not(:disabled) { background: #B91C1C; }

        .sb-modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.3);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; padding: 16px; backdrop-filter: blur(8px);
        }
        .sb-modal {
          background: rgba(255,255,255,0.86); border: 1px solid rgba(255,255,255,0.78);
          border-radius: 24px; width: 100%; max-width: 420px; box-shadow: 0 24px 70px rgba(15,23,42,0.2); padding: 28px; backdrop-filter: blur(20px);
        }
        .sb-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .sb-modal-title { font-size: 16px; font-weight: 800; color: #0F172A; }
        .sb-modal-close { background: rgba(248,250,252,0.78); border: 1px solid rgba(226,232,240,0.8); cursor: pointer; color: #94A3B8; padding: 5px; border-radius: 12px; }
        .sb-modal-close:hover { color: #475569; background: #F1F5F9; }
        .sb-modal-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }

        .sb-form-group { margin-bottom: 14px; }
        .sb-form-label { display: block; font-size: 12.5px; font-weight: 800; color: #475569; margin-bottom: 6px; }
        .sb-form-input, .sb-form-select {
          width: 100%; padding: 10px 12px; border: 1px solid rgba(226,232,240,0.9); border-radius: 15px;
          font-size: 13.5px; color: #0F172A; background: rgba(255,255,255,0.72);
          outline: none; transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }
        .sb-form-input:focus, .sb-form-select:focus { border-color: #93C5FD; background: rgba(255,255,255,0.95); box-shadow: 0 0 0 4px rgba(147,197,253,0.22); }
        .sb-form-input::placeholder { color: #CBD5E1; }
        .sb-form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
        }
        .sb-form-error { font-size: 12px; color: #DC2626; margin-top: 10px; }
        .sb-hint { background: rgba(255,251,235,0.8); border: 1px solid #FDE68A; border-radius: 16px; padding: 10px 12px; font-size: 12.5px; color: #92400E; margin-bottom: 14px; }

        .sb-tabs { display: flex; gap: 6px; border-bottom: 1px solid rgba(226,232,240,0.8); margin-bottom: 22px; overflow-x: auto; }
        .sb-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 16px; font-size: 13.5px; font-weight: 700; color: #64748B;
          border: none; border-bottom: 2px solid transparent; margin-bottom: -1px;
          cursor: pointer; white-space: nowrap; background: none; transition: color 0.16s ease, background 0.16s ease;
          border-radius: 14px 14px 0 0;
        }
        .sb-tab:hover { color: #0F172A; background: rgba(255,255,255,0.5); }
        .sb-tab-active { color: #2563EB; border-bottom-color: #2563EB; }
        .sb-tab-badge { background: rgba(241,245,249,0.86); color: #64748B; font-size: 11px; font-weight: 800; padding: 1px 6px; border-radius: 10px; min-width: 20px; text-align: center; }
        .sb-tab-active .sb-tab-badge { background: #EFF6FF; color: #2563EB; }

        .sb-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
        .sb-section-header-left { display: flex; align-items: center; gap: 12px; }
        .sb-section-icon { width: 40px; height: 40px; border-radius: 15px; background: rgba(239,246,255,0.78); color: #2563EB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sb-section-title { font-size: 15px; font-weight: 800; color: #0F172A; }
        .sb-section-count { font-size: 12px; color: #94A3B8; margin-top: 1px; }

        .sb-filter-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding: 12px 14px; }
        .sb-filter-row label { font-size: 12.5px; font-weight: 800; color: #64748B; white-space: nowrap; }

        .sb-fade-in { animation: sb-fade 0.18s ease; }
        @keyframes sb-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1180px) {
          .sb-sidebar { width: 264px; left: 16px; }
          .sb-main { margin-left: 302px; }
        }

        @media (max-width: 900px) {
          .sb-sidebar {
            left: 14px; top: 14px; bottom: 14px; width: min(320px, calc(100vw - 28px));
            transform: translateX(calc(-100% - 28px)); opacity: 0;
          }
          .sb-sidebar.sb-sidebar-open { transform: translateX(0); opacity: 1; }
          .sb-sidebar-close { display: flex; align-items: center; justify-content: center; }
          .sb-main { margin-left: 0; padding: 14px; }
          .sb-sidebar-overlay { display: block; }
          .sb-hamburger { display: flex; }
          .sb-topbar { top: 14px; min-height: 64px; border-radius: 22px; padding: 0 14px; }
          .sb-topbar-subtitle { display: none; }
          .sb-page { width: 100%; }
        }

        @media (max-width: 560px) {
          .sb-main { padding: 10px; }
          .sb-topbar { flex-wrap: wrap; height: auto; min-height: 58px; padding: 10px 12px; gap: 8px 10px; }
          .sb-topbar-title { font-size: 18px; }
          .sb-topbar-titles { order: 1; flex: 1 1 auto; }
          .sb-back-btn span { display: none; }
          .sb-back-btn { padding: 8px; }
          .sb-topbar-actions { order: 3; flex: 1 1 100%; }
          .sb-topbar-actions .sb-btn { flex: 1; justify-content: center; }
          .sb-modal { padding: 20px; border-radius: 22px; }
          .sb-section-header { gap: 10px 12px; }
          .sb-section-header .sb-btn-primary { padding: 8px 12px; font-size: 12.5px; }
          .sb-filter-row { flex-wrap: wrap; align-items: stretch; }
          .sb-filter-row label { width: 100%; }
          .sb-tab { padding: 9px 13px; font-size: 12.5px; gap: 5px; }
          .sb-table th, .sb-table td { padding: 10px 12px; }
        }

        .sb-tabs, .sb-table-wrap, .sb-sidebar-nav { -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
      `}</style>
    </div>
  );
}
