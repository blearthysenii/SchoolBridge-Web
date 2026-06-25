import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

import { getInactiveSubjects, restoreSubject } from "../services/subjectService";
import { getClassrooms } from "../services/classroomService";

type User = { full_name: string; email: string; role: string };

type Subject = { id: number; name: string; classroom_id: number };
type Classroom = { id: number; name: string };

function IconRestore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export default function InactiveSubjects() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingSubject, setPendingSubject] = useState<Subject | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [subjectsRes, classroomsRes] = await Promise.all([
        getInactiveSubjects(),
        getClassrooms(),
      ]);
      setSubjects(subjectsRes.data);
      setClassrooms(classroomsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } });
        setUser(res.data);
        await load();
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  const classroomName = (id: number) => classrooms.find((c) => c.id === id)?.name ?? "—";

  const handleRestore = async (s: Subject) => {
    setRestoringId(s.id);
    try {
      await restoreSubject(s.id);
      setSubjects((prev) => prev.filter((x) => x.id !== s.id));
      setBanner({ type: "success", text: `Lënda "${s.name}" u riaktivizua me sukses.` });
    } catch (err: any) {
      setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi riaktivizimi." });
    } finally {
      setRestoringId(null);
      setPendingSubject(null);
    }
  };

  return (
    <Layout title="Lëndët joaktive" subtitle="Lëndët e çaktivizuara nga klasat tuaja" backTo="/dashboard" user={user}>
      {banner && <Alert type={banner.type} message={banner.text} onClose={() => setBanner(null)} />}

      {loading ? (
        <LoadingSpinner text="Duke ngarkuar lëndët joaktive…" />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="Nuk ka lëndë joaktive"
          description="Lëndët e çaktivizuara nga klasat tuaja do të shfaqen këtu."
        />
      ) : (
        <div className="sb-table-wrap">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Emri i lëndës</th>
                <th>Klasa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="sb-td-name">{s.name}</td>
                  <td className="sb-td-meta">
                    <Link to={`/classrooms/${s.classroom_id}`} className="sb-td-link" style={{ color: "#64748B" }}>
                      {classroomName(s.classroom_id)}
                    </Link>
                  </td>
                  <td className="sb-td-actions">
                    <button
                      onClick={() => setPendingSubject(s)}
                      disabled={restoringId === s.id}
                      className="sb-btn sb-btn-restore"
                    >
                      <IconRestore />
                      {restoringId === s.id ? "…" : "Riaktivizo"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingSubject && (
        <ConfirmDialog
          title="Riaktivizo lëndën"
          message={`Të riaktivizohet lënda "${pendingSubject.name}"?`}
          confirmLabel="Riaktivizo"
          submitting={restoringId === pendingSubject.id}
          onCancel={() => setPendingSubject(null)}
          onConfirm={() => handleRestore(pendingSubject)}
        />
      )}
    </Layout>
  );
}
