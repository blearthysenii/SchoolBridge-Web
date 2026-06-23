import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import { createClassroom, getClassrooms } from "../services/classroomService";
import { getDashboardStats } from "../services/dashboardService";

type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
};

type Classroom = {
  id: number;
  name: string;
  grade: number;
  description?: string;
  created_at: string;
};

type DashboardStats = {
  classrooms: number;
  students: number;
  subjects: number;
  concepts: number;
  tests: number;
  questions: number;
  results: number;
};

const ROLE_LABELS: Record<string, string> = {
  teacher: "Mësues",
  admin: "Administrator",
  student: "Nxënës",
};

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIconWrap}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value ?? "—"}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

function IconClassroom() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconStudents() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconSubjects() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function IconTests() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconResults() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconConcepts() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [grade, setGrade] = useState(1);
  const [description, setDescription] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  const loadClassrooms = async () => {
    const response = await getClassrooms();
    setClassrooms(response.data);
  };

  const loadStats = async () => {
    const response = await getDashboardStats();
    setStats(response.data);
  };

  const refreshDashboard = async () => {
    await loadClassrooms();
    await loadStats();
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        await refreshDashboard();
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    if (modalOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [modalOpen]);

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    try {
      await createClassroom(name, grade, description);
      setName("");
      setGrade(1);
      setDescription("");
      setModalOpen(false);
      await refreshDashboard();
    } catch {
      setFormError("Dështoi krijimi i klasës. Provoni përsëri.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { label: "Paneli kryesor", icon: <IconClassroom />, active: true, to: "#" },
    { label: "Klasat", icon: <IconClassroom />, active: false, to: "#" },
    { label: "Nxënësit", icon: <IconStudents />, active: false, to: "#" },
    { label: "Lëndët", icon: <IconSubjects />, active: false, to: "#" },
    { label: "Testet", icon: <IconTests />, active: false, to: "#" },
    { label: "Rezultatet", icon: <IconResults />, to: "/submit-results" },
  ];

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #0f172a; }
        a { text-decoration: none; color: inherit; }

        .db-shell { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          width: 232px;
          background: #fff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
          transition: transform 0.22s ease;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 20px 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .sidebar-logo-mark {
          width: 32px; height: 32px;
          background: #2563eb;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: -0.5px;
          flex-shrink: 0;
        }
        .sidebar-logo-text { font-size: 14px; font-weight: 600; color: #0f172a; letter-spacing: -0.2px; }
        .sidebar-logo-sub { font-size: 11px; color: #94a3b8; }

        .sidebar-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
        .nav-label { font-size: 10.5px; font-weight: 600; color: #94a3b8; letter-spacing: 0.6px; text-transform: uppercase; padding: 10px 10px 4px; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 7px;
          font-size: 13.5px; font-weight: 500; color: #475569;
          cursor: pointer; transition: background 0.12s, color 0.12s;
        }
        .nav-item:hover { background: #f1f5f9; color: #0f172a; }
        .nav-item.active { background: #eff6ff; color: #2563eb; }
        .nav-item.active svg { stroke: #2563eb; }
        .nav-item svg { flex-shrink: 0; }

        .sidebar-footer {
          padding: 14px 10px;
          border-top: 1px solid #f1f5f9;
        }
        .sidebar-user {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 7px;
        }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #dbeafe; color: #2563eb;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .avatar-name { font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.2; }
        .avatar-role { font-size: 11.5px; color: #94a3b8; }
        .logout-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 7px; margin-top: 4px;
          font-size: 13.5px; font-weight: 500; color: #64748b;
          background: none; border: none; cursor: pointer; width: 100%;
          transition: background 0.12s, color 0.12s;
        }
        .logout-btn:hover { background: #fff1f2; color: #e11d48; }

        /* MAIN */
        .main { margin-left: 232px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

        /* TOP BAR */
        .topbar {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 28px;
          height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .topbar-title { font-size: 14.5px; font-weight: 600; color: #0f172a; }
        .topbar-sub { font-size: 12.5px; color: #94a3b8; margin-top: 1px; }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .btn-primary {
          display: flex; align-items: center; gap: 6px;
          background: #2563eb; color: #fff;
          border: none; border-radius: 7px;
          padding: 8px 14px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.12s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #1d4ed8; }
        .menu-btn {
          display: none;
          background: none; border: none; cursor: pointer; color: #475569;
          padding: 4px;
        }

        /* PAGE CONTENT */
        .page { padding: 28px; max-width: 1100px; }
        .section-title { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }

        /* STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }

        /* CLASSROOMS */
        .classroom-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .classroom-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px 18px;
          transition: border-color 0.14s, box-shadow 0.14s;
          cursor: pointer;
        }
        .classroom-card:hover { border-color: #bfdbfe; box-shadow: 0 2px 8px rgba(37,99,235,0.07); }
        .classroom-card-grade { font-size: 11px; font-weight: 600; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .classroom-card-name { font-size: 15px; font-weight: 700; color: #0f172a; }
        .classroom-card-desc { font-size: 12.5px; color: #94a3b8; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .classroom-card-meta { font-size: 11.5px; color: #cbd5e1; margin-top: 12px; }

        .empty-state {
          background: #f8fafc; border: 1px dashed #e2e8f0;
          border-radius: 10px; padding: 36px 24px;
          text-align: center; color: #94a3b8; font-size: 13.5px;
        }
        .empty-state strong { display: block; font-size: 14px; color: #64748b; margin-bottom: 4px; }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.35);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; padding: 16px;
        }
        .modal {
          background: #fff; border-radius: 12px;
          width: 100%; max-width: 420px;
          box-shadow: 0 12px 40px rgba(15,23,42,0.18);
          padding: 28px;
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .modal-title { font-size: 16px; font-weight: 700; color: #0f172a; }
        .modal-close { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 2px; border-radius: 5px; }
        .modal-close:hover { color: #475569; background: #f1f5f9; }

        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 12.5px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .form-input {
          width: 100%; padding: 9px 12px;
          border: 1px solid #e2e8f0; border-radius: 7px;
          font-size: 13.5px; color: #0f172a; background: #fff;
          outline: none; transition: border-color 0.12s, box-shadow 0.12s;
        }
        .form-input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(147,197,253,0.25); }
        .form-input::placeholder { color: #cbd5e1; }
        .form-error { font-size: 12px; color: #e11d48; margin-top: 10px; }

        .modal-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }
        .btn-secondary {
          padding: 8px 16px; border-radius: 7px;
          font-size: 13px; font-weight: 600;
          background: #f1f5f9; color: #475569;
          border: none; cursor: pointer; transition: background 0.12s;
        }
        .btn-secondary:hover { background: #e2e8f0; }
        .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }

        /* SIDEBAR OVERLAY (mobile) */
        .sidebar-overlay { display: none; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(15,23,42,0.15); }
          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(15,23,42,0.3); z-index: 99; }
          .main { margin-left: 0; }
          .menu-btn { display: flex; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .page { padding: 18px 16px; }
          .topbar { padding: 0 16px; }
          .topbar-sub { display: none; }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-shell">
        {/* SIDEBAR */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <nav className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">SB</div>
            <div>
              <div className="sidebar-logo-text">SchoolBridge</div>
              <div className="sidebar-logo-sub">Sistemi shkollor</div>
            </div>
          </div>

          <div className="sidebar-nav">
            <div className="nav-label">Menaxhimi</div>
            {navItems.map((item) =>
              item.to && item.to !== "#" ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`nav-item${item.active ? " active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.label}
                  className={`nav-item${item.active ? " active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </div>
              )
            )}
          </div>

          <div className="sidebar-footer">
            {user && (
              <div className="sidebar-user">
                <div className="avatar">{initials}</div>
                <div>
                  <div className="avatar-name">{user.full_name}</div>
                  <div className="avatar-role">{ROLE_LABELS[user.role] ?? user.role}</div>
                </div>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              <IconLogout />
              Dil nga sistemi
            </button>
          </div>
        </nav>

        {/* MAIN AREA */}
        <div className="main">
          {/* TOP BAR */}
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="menu-btn" onClick={() => setSidebarOpen((o) => !o)}>
                <IconMenu />
              </button>
              <div>
                <div className="topbar-title">
                  {user ? `Mirë se erdhe, ${user.full_name.split(" ")[0]}` : "Paneli kryesor"}
                </div>
                <div className="topbar-sub">
                  {new Date().toLocaleDateString("sq-AL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>
            <div className="topbar-right">
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                <IconPlus />
                Klasa e re
              </button>
            </div>
          </header>

          {/* PAGE */}
          <main className="page">
            {!user ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Duke ngarkuar…</p>
            ) : (
              <>
                {/* STATS */}
                <div className="section-title">Statistikat</div>
                <div className="stats-grid">
                  <StatCard label="Klasa" value={stats?.classrooms} icon={<IconClassroom />} />
                  <StatCard label="Nxënës" value={stats?.students} icon={<IconStudents />} />
                  <StatCard label="Lëndë" value={stats?.subjects} icon={<IconSubjects />} />
                  <StatCard label="Teste" value={stats?.tests} icon={<IconTests />} />
                  <StatCard label="Rezultate" value={stats?.results} icon={<IconResults />} />
                  <StatCard label="Koncepte" value={stats?.concepts} icon={<IconConcepts />} />
                </div>

                {/* CLASSROOMS */}
                <div className="section-title">Klasat e mia</div>
                {classrooms.length > 0 ? (
                  <div className="classroom-grid">
                    {classrooms.map((c) => (
                      <Link to={`/classrooms/${c.id}`} key={c.id}>
                        <div className="classroom-card">
                          <div className="classroom-card-grade">Viti {c.grade}</div>
                          <div className="classroom-card-name">{c.name}</div>
                          {c.description && (
                            <div className="classroom-card-desc">{c.description}</div>
                          )}
                          <div className="classroom-card-meta">
                            Shtuar{" "}
                            {new Date(c.created_at).toLocaleDateString("sq-AL", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <strong>Nuk ka klasa ende</strong>
                    Krijoni klasën tuaj të parë duke klikuar "Klasa e re".
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* CREATE CLASSROOM MODAL */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal" ref={modalRef}>
            <div className="modal-header">
              <div className="modal-title">Krijo klasë të re</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleCreateClassroom}>
              <div className="form-group">
                <label className="form-label">Emri i klasës</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="p.sh. 5A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Viti shkollor</label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  max={5}
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Përshkrim (opcionale)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Shkruani një përshkrim të shkurtër…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {formError && <div className="form-error">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                  Anulo
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? "Duke krijuar…" : "Krijo klasën"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  statCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    background: "#eff6ff",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    flexShrink: 0,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 3,
    fontWeight: 500,
  },
};

export default Dashboard;