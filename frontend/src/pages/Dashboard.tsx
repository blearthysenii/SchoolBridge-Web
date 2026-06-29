import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import { createClassroom, deactivateClassroom, getClassrooms } from "../services/classroomService";
import { getDashboardInsights, getDashboardStats } from "../services/dashboardService";

import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import ConfirmDialog from "../components/ConfirmDialog";

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
  is_active?: boolean;
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

type WeakestClassroom = {
  classroom_id: number;
  classroom_name: string;
  accuracy: number;
  total_answers: number;
};

type WeakConcept = {
  concept_id: number;
  concept_name: string;
  subject_name: string;
  classroom_name: string;
  accuracy: number;
  total_answers: number;
};

type LowStudent = {
  student_id: number;
  student_name: string;
  classroom_name: string;
  accuracy: number;
  total_answers: number;
};

type RecentTest = {
  test_id: number;
  title: string;
  subject_name: string;
  classroom_name: string;
  status: string;
  created_at: string;
};

type RecentActivity = {
  type: string;
  label: string;
  detail?: string | null;
  created_at: string;
  href?: string | null;
};

type DashboardInsights = {
  summary: {
    concepts_need_attention: number;
    students_below_60: number;
    weakest_classroom: WeakestClassroom | null;
  };
  weak_concepts: WeakConcept[];
  students_need_attention: LowStudent[];
  recent_tests: RecentTest[];
  recent_activity: RecentActivity[];
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
function IconArchive() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 13h4" />
    </svg>
  );
}

const formatPercent = (value?: number) => `${Math.round(value ?? 0)}%`;
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" });

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [pendingClassroom, setPendingClassroom] = useState<Classroom | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

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

  const loadInsights = async () => {
    const response = await getDashboardInsights();
    setInsights(response.data);
  };

  const refreshDashboard = async () => {
    await Promise.all([loadClassrooms(), loadStats(), loadInsights()]);
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

  const openClassroomWorkflow = (tab: "students" | "tests", action: "new-student" | "new-test") => {
    const classroom = classrooms[0];
    if (!classroom) {
      setBanner({ type: "error", text: "Krijoni së pari një klasë aktive." });
      return;
    }
    navigate(`/classrooms/${classroom.id}?tab=${tab}&action=${action}`);
  };

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

  const handleDeactivateClassroom = async (classroom: Classroom) => {
    setDeactivatingId(classroom.id);
    try {
      await deactivateClassroom(classroom.id);
      setClassrooms((prev) => prev.filter((c) => c.id !== classroom.id));
      await Promise.all([loadStats(), loadInsights()]);
      setBanner({
        type: "info",
        text: `Klasa "${classroom.name}" u çaktivizua. Mund ta aktivizoni prapë nga "Klasat jo aktive".`,
      });
    } catch (err: any) {
      setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi çaktivizimi i klasës." });
    } finally {
      setDeactivatingId(null);
      setPendingClassroom(null);
    }
  };

  const quickActions = [
    { label: "Krijo klasë", icon: <IconPlus />, onClick: () => setModalOpen(true) },
    { label: "Krijo test", icon: <IconTests />, onClick: () => openClassroomWorkflow("tests", "new-test") },
    { label: "Shto nxënës", icon: <IconStudents />, onClick: () => openClassroomWorkflow("students", "new-student") },
    { label: "Dorëzo rezultate", icon: <IconResults />, onClick: () => navigate("/submit-results") },
  ];

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
      {banner && <Alert type={banner.type} message={banner.text} onClose={() => setBanner(null)} />}

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

          <div className="db-section-title">Veprime të shpejta</div>
          <div className="db-quick-grid">
            {quickActions.map((action) => (
              <button key={action.label} type="button" className="db-quick-action" onClick={action.onClick}>
                <span className="db-quick-icon">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          <div className="db-section-title">Përmbledhje e boshllëqeve</div>
          <div className="db-summary-grid">
            <div className="db-summary-item">
              <div className="db-summary-value">{insights?.summary.concepts_need_attention ?? 0}</div>
              <div className="db-summary-label">Koncepte kërkojnë vëmendje</div>
            </div>
            <div className="db-summary-item">
              <div className="db-summary-value">{insights?.summary.students_below_60 ?? 0}</div>
              <div className="db-summary-label">Nxënës nën 60%</div>
            </div>
            <div className="db-summary-item db-summary-wide">
              <div className="db-summary-value db-summary-class">
                {insights?.summary.weakest_classroom?.classroom_name ?? "—"}
              </div>
              <div className="db-summary-label">
                Klasa më e dobët
                {insights?.summary.weakest_classroom && (
                  <span> · {formatPercent(insights.summary.weakest_classroom.accuracy)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="db-main-grid">
            <section className="db-panel">
              <div className="db-panel-header">
                <div>
                  <div className="db-panel-title">Konceptet më problematike</div>
                  <div className="db-panel-subtitle">Sipas përgjigjeve të dorëzuara</div>
                </div>
              </div>
              {insights?.weak_concepts.length ? (
                <div className="db-progress-list">
                  {insights.weak_concepts.map((concept) => (
                    <div key={concept.concept_id} className="db-progress-row">
                      <div className="db-progress-top">
                        <div>
                          <div className="db-row-title">{concept.concept_name}</div>
                          <div className="db-row-meta">{concept.subject_name} · {concept.classroom_name}</div>
                        </div>
                        <div className="db-percent">{formatPercent(concept.accuracy)}</div>
                      </div>
                      <div className="db-progress-track">
                        <div className="db-progress-fill" style={{ width: `${Math.max(4, Math.min(100, concept.accuracy))}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="db-empty-mini">Nuk ka të dhëna për koncepte ende.</div>
              )}
            </section>

            <section className="db-panel">
              <div className="db-panel-header">
                <div>
                  <div className="db-panel-title">Nxënës që kanë nevojë për vëmendje</div>
                  <div className="db-panel-subtitle">Performanca më e ulët</div>
                </div>
              </div>
              {insights?.students_need_attention.length ? (
                <div className="db-compact-table">
                  {insights.students_need_attention.map((student) => (
                    <Link key={student.student_id} to={`/students/${student.student_id}/results`} className="db-student-row">
                      <span>
                        <span className="db-row-title">{student.student_name}</span>
                        <span className="db-row-meta">{student.classroom_name}</span>
                      </span>
                      <span className="db-percent">{formatPercent(student.accuracy)}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="db-empty-mini">Nuk ka rezultate të mjaftueshme ende.</div>
              )}
            </section>
          </div>

          <div className="db-main-grid">
            <section className="db-panel">
              <div className="db-panel-title">Testet e fundit</div>
              {insights?.recent_tests.length ? (
                <div className="db-list">
                  {insights.recent_tests.map((test) => (
                    <Link key={test.test_id} to={`/tests/${test.test_id}`} className="db-list-row">
                      <span>
                        <span className="db-row-title">{test.title}</span>
                        <span className="db-row-meta">{test.subject_name} · {test.classroom_name}</span>
                      </span>
                      <span className="db-date">{formatDate(test.created_at)}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="db-empty-mini">Nuk ka teste ende.</div>
              )}
            </section>

            <section className="db-panel">
              <div className="db-panel-title">Aktiviteti i fundit</div>
              {insights?.recent_activity.length ? (
                <div className="db-activity-list">
                  {insights.recent_activity.map((item) => {
                    const content = (
                      <>
                        <span className="db-activity-dot" />
                        <span>
                          <span className="db-row-title">{item.label}</span>
                          {item.detail && <span className="db-row-meta">{item.detail}</span>}
                        </span>
                        <span className="db-date">{formatDate(item.created_at)}</span>
                      </>
                    );
                    return item.href ? (
                      <Link key={`${item.type}-${item.created_at}-${item.label}`} to={item.href} className="db-activity-row">
                        {content}
                      </Link>
                    ) : (
                      <div key={`${item.type}-${item.created_at}-${item.label}`} className="db-activity-row">
                        {content}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="db-empty-mini">Nuk ka aktivitet ende.</div>
              )}
            </section>
          </div>

          <div className="db-section-title">Klasat e mia</div>
          {classrooms.length > 0 ? (
            <div className="db-classroom-grid">
              {classrooms.map((c) => (
                <div key={c.id} className="db-classroom-card">
                  <Link to={`/classrooms/${c.id}`} className="db-classroom-card-main">
                    <div className="db-classroom-card-grade">Viti {c.grade}</div>
                    <div className="db-classroom-card-name">{c.name}</div>
                    {c.description && <div className="db-classroom-card-desc">{c.description}</div>}
                    <div className="db-classroom-card-meta">
                      Shtuar {formatDate(c.created_at)}
                    </div>
                  </Link>
                  <div className="db-classroom-card-actions">
                    <button
                      className="sb-btn sb-btn-warn-ghost"
                      onClick={() => setPendingClassroom(c)}
                      disabled={deactivatingId === c.id}
                    >
                      <IconArchive />
                      {deactivatingId === c.id ? "..." : "Çaktivizo klasën"}
                    </button>
                  </div>
                </div>
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

      {pendingClassroom && (
        <ConfirmDialog
          title="Çaktivizo klasën"
          message={`Të çaktivizohet klasa "${pendingClassroom.name}"? Të dhënat e saj do të ruhen dhe mund ta aktivizoni prapë më vonë.`}
          confirmLabel="Çaktivizo"
          submitting={deactivatingId === pendingClassroom.id}
          onCancel={() => setPendingClassroom(null)}
          onConfirm={() => handleDeactivateClassroom(pendingClassroom)}
        />
      )}

      <style>{`
        .db-section-title { font-size: 12.5px; font-weight: 850; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 14px; }
        .db-section-title:not(:first-child) { margin-top: 28px; }
        .db-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .db-quick-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .db-quick-action {
          display: flex; align-items: center; gap: 12px; min-height: 72px; padding: 16px;
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74); border-radius: 22px; cursor: pointer;
          color: #0F172A; font-size: 13.5px; font-weight: 700; text-align: left;
          box-shadow: 0 16px 38px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.84);
          backdrop-filter: blur(18px);
          transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease, background 0.16s ease;
        }
        .db-quick-action:hover { border-color: rgba(191,219,254,0.9); background: rgba(255,255,255,0.78); box-shadow: 0 20px 46px rgba(15,23,42,0.1); transform: translateY(-2px); }
        .db-quick-icon {
          width: 40px; height: 40px; border-radius: 15px;
          background: linear-gradient(145deg, rgba(37,99,235,0.12), rgba(255,255,255,0.72));
          border: 1px solid rgba(255,255,255,0.78); color: #2563EB;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .db-summary-grid { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 12px; }
        .db-summary-item {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 22px; padding: 20px; min-width: 0;
          box-shadow: 0 16px 38px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.84);
          backdrop-filter: blur(18px);
        }
        .db-summary-value { font-size: 26px; font-weight: 800; color: #0F172A; line-height: 1; }
        .db-summary-class { font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-summary-label { margin-top: 8px; font-size: 12.5px; color: #64748B; line-height: 1.4; }
        .db-main-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; margin-top: 14px; }
        .db-panel {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 24px; padding: 20px; min-width: 0;
          box-shadow: 0 16px 38px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.84);
          backdrop-filter: blur(18px);
        }
        .db-panel-header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .db-panel-title { font-size: 15px; font-weight: 800; color: #0F172A; }
        .db-panel-subtitle { font-size: 12px; color: #94A3B8; margin-top: 2px; }
        .db-progress-list, .db-list, .db-activity-list, .db-compact-table { display: flex; flex-direction: column; gap: 12px; }
        .db-progress-row { min-width: 0; }
        .db-progress-top, .db-list-row, .db-student-row, .db-activity-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0;
        }
        .db-list-row, .db-student-row, .db-activity-row {
          color: inherit; text-decoration: none; padding: 9px 10px;
          border-radius: 16px; transition: background 0.16s ease, transform 0.16s ease;
        }
        .db-list-row:hover, .db-student-row:hover, .db-activity-row:hover { background: rgba(255,255,255,0.54); transform: translateY(-1px); }
        .db-list-row:hover .db-row-title, .db-student-row:hover .db-row-title, .db-activity-row:hover .db-row-title { color: #2563EB; }
        .db-row-title { display: block; font-size: 13.5px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-row-meta { display: block; font-size: 12px; color: #94A3B8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-percent { font-size: 13px; font-weight: 800; color: #0F172A; flex-shrink: 0; }
        .db-date { font-size: 11.5px; color: #94A3B8; flex-shrink: 0; white-space: nowrap; }
        .db-progress-track { height: 8px; background: rgba(226,232,240,0.72); border-radius: 999px; overflow: hidden; margin-top: 8px; }
        .db-progress-fill { height: 100%; background: linear-gradient(135deg, #60A5FA, #2563EB); border-radius: inherit; }
        .db-activity-row { display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; }
        .db-activity-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563EB; align-self: center; }
        .db-empty-mini { font-size: 13px; color: #94A3B8; padding: 10px 0; }
        .db-classroom-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .db-classroom-card {
          display: flex; flex-direction: column; background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 22px; overflow: hidden;
          box-shadow: 0 16px 38px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.84);
          backdrop-filter: blur(18px);
          transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease, background 0.16s ease;
        }
        .db-classroom-card:hover { border-color: rgba(191,219,254,0.9); background: rgba(255,255,255,0.78); box-shadow: 0 20px 46px rgba(15,23,42,0.1); transform: translateY(-2px); }
        .db-classroom-card-main { display: block; padding: 18px 20px 12px; text-decoration: none; color: inherit; flex: 1; min-width: 0; }
        .db-classroom-card-grade { font-size: 11px; font-weight: 800; color: #2563EB; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 5px; }
        .db-classroom-card-name { font-size: 15.5px; font-weight: 800; color: #0F172A; }
        .db-classroom-card-desc { font-size: 12.5px; color: #94A3B8; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-classroom-card-meta { font-size: 11.5px; color: #CBD5E1; margin-top: 12px; }
        .db-classroom-card-actions { display: flex; justify-content: flex-end; padding: 0 20px 16px; }

        @media (max-width: 920px) {
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .db-quick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .db-summary-grid, .db-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .db-classroom-grid, .db-quick-grid, .db-stats-grid { grid-template-columns: 1fr; }
          .db-section-title:not(:first-child) { margin-top: 22px; }
          .db-panel, .db-summary-item { padding: 15px; }
          .db-activity-row { grid-template-columns: 10px minmax(0, 1fr); }
          .db-activity-row .db-date { grid-column: 2; margin-top: 2px; }
        }
      `}</style>
    </Layout>
  );
}

export default Dashboard;
