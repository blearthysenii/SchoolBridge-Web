import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import { createClassroom, getClassrooms } from "../services/classroomService";
import { getDashboardStats } from "../services/dashboardService";

import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";

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
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
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
        navigate("/login");
      } finally {
        setLoading(false);
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

  return (
    <Layout
      title={user ? `Mirë se erdhe, ${user.full_name.split(" ")[0]}` : "Paneli kryesor"}
      subtitle={new Date().toLocaleDateString("sq-AL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      user={user}
      actions={
        <button className="sb-btn sb-btn-primary" onClick={() => setModalOpen(true)}>
          <IconPlus />
          Klasa e re
        </button>
      }
    >
      {loading ? (
        <LoadingSpinner text="Duke ngarkuar panelin…" />
      ) : (
        <>
          <div className="db-section-title">Statistikat</div>
          <div className="db-stats-grid">
            <StatCard label="Klasa" value={stats?.classrooms ?? "—"} icon={<IconClassroom />} />
            <StatCard label="Nxënës" value={stats?.students ?? "—"} icon={<IconStudents />} />
            <StatCard label="Lëndë" value={stats?.subjects ?? "—"} icon={<IconSubjects />} />
            <StatCard label="Teste" value={stats?.tests ?? "—"} icon={<IconTests />} />
            <StatCard label="Rezultate" value={stats?.results ?? "—"} icon={<IconResults />} />
            <StatCard label="Koncepte" value={stats?.concepts ?? "—"} icon={<IconConcepts />} />
          </div>

          <div className="db-section-title">Klasat e mia</div>
          {classrooms.length > 0 ? (
            <div className="db-classroom-grid">
              {classrooms.map((c) => (
                <Link to={`/classrooms/${c.id}`} key={c.id} className="db-classroom-card">
                  <div className="db-classroom-card-grade">Viti {c.grade}</div>
                  <div className="db-classroom-card-name">{c.name}</div>
                  {c.description && <div className="db-classroom-card-desc">{c.description}</div>}
                  <div className="db-classroom-card-meta">
                    Shtuar{" "}
                    {new Date(c.created_at).toLocaleDateString("sq-AL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nuk ka klasa ende"
              description='Krijoni klasën tuaj të parë duke klikuar "Klasa e re".'
              action={
                <button className="sb-btn sb-btn-primary" onClick={() => setModalOpen(true)}>
                  <IconPlus />
                  Klasa e re
                </button>
              }
            />
          )}
        </>
      )}

      {modalOpen && (
        <div className="sb-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="sb-modal" ref={modalRef}>
            <div className="sb-modal-header">
              <div className="sb-modal-title">Krijo klasë të re</div>
              <button className="sb-modal-close" onClick={() => setModalOpen(false)} aria-label="Mbyll">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateClassroom}>
              <div className="sb-form-group">
                <label className="sb-form-label">Emri i klasës</label>
                <input
                  className="sb-form-input"
                  type="text"
                  placeholder="p.sh. 5A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="sb-form-group">
                <label className="sb-form-label">Viti shkollor</label>
                <input
                  className="sb-form-input"
                  type="number"
                  min={1}
                  max={5}
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  required
                />
              </div>

              <div className="sb-form-group">
                <label className="sb-form-label">
                  Përshkrim <span style={{ color: "#94A3B8", fontWeight: 400 }}>(opcionale)</span>
                </label>
                <input
                  className="sb-form-input"
                  type="text"
                  placeholder="Shkruani një përshkrim të shkurtër…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {formError && <div className="sb-form-error">{formError}</div>}

              <div className="sb-modal-actions">
                <button type="button" className="sb-btn sb-btn-secondary" onClick={() => setModalOpen(false)}>
                  Anulo
                </button>
                <button type="submit" className="sb-btn sb-btn-primary" disabled={creating}>
                  {creating ? "Duke krijuar…" : "Krijo klasën"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .db-section-title { font-size: 13px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 14px; }
        .db-section-title:not(:first-child) { margin-top: 28px; }
        .db-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .db-classroom-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .db-classroom-card {
          display: block; background: #fff; border: 1px solid #E2E8F0; border-radius: 10px;
          padding: 16px 18px; text-decoration: none; color: inherit;
          transition: border-color 0.14s, box-shadow 0.14s;
        }
        .db-classroom-card:hover { border-color: #BFDBFE; box-shadow: 0 2px 8px rgba(37,99,235,0.08); }
        .db-classroom-card-grade { font-size: 11px; font-weight: 600; color: #2563EB; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
        .db-classroom-card-name { font-size: 15px; font-weight: 700; color: #0F172A; }
        .db-classroom-card-desc { font-size: 12.5px; color: #94A3B8; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-classroom-card-meta { font-size: 11.5px; color: #CBD5E1; margin-top: 12px; }

        @media (max-width: 768px) {
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .db-classroom-grid { grid-template-columns: 1fr; }
          .db-section-title:not(:first-child) { margin-top: 22px; }
        }
        @media (max-width: 400px) {
          .db-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </Layout>
  );
}

export default Dashboard;
