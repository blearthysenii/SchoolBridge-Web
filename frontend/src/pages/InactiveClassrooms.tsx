import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

import { activateClassroom, getInactiveClassrooms } from "../services/classroomService";

type User = { full_name: string; email: string; role: string };

type Classroom = {
  id: number;
  name: string;
  grade: number;
  description?: string | null;
  created_at: string;
};

function IconRestore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export default function InactiveClassrooms() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingClassroom, setPendingClassroom] = useState<Classroom | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getInactiveClassrooms();
      setClassrooms(res.data);
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

  const handleActivate = async (classroom: Classroom) => {
    setRestoringId(classroom.id);
    try {
      await activateClassroom(classroom.id);
      setClassrooms((prev) => prev.filter((c) => c.id !== classroom.id));
      setBanner({ type: "success", text: `Klasa "${classroom.name}" u aktivizua prapë.` });
    } catch (err: any) {
      setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi aktivizimi i klasës." });
    } finally {
      setRestoringId(null);
      setPendingClassroom(null);
    }
  };

  return (
    <Layout title="Klasat jo aktive" subtitle="Klasat e çaktivizuara nga paneli juaj" backTo="/dashboard" user={user}>
      {banner && <Alert type={banner.type} message={banner.text} onClose={() => setBanner(null)} />}

      {loading ? (
        <LoadingSpinner text="Duke ngarkuar klasat jo aktive…" />
      ) : classrooms.length === 0 ? (
        <EmptyState
          title="Nuk ka klasa jo aktive"
          description="Klasat e çaktivizuara do të shfaqen këtu."
        />
      ) : (
        <div className="sb-table-wrap">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Emri i klasës</th>
                <th>Viti</th>
                <th>Përshkrimi</th>
                <th>Shtuar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {classrooms.map((c) => (
                <tr key={c.id}>
                  <td className="sb-td-name">{c.name}</td>
                  <td className="sb-td-meta">Viti {c.grade}</td>
                  <td className="sb-td-muted">{c.description || "—"}</td>
                  <td className="sb-td-meta">
                    {new Date(c.created_at).toLocaleDateString("sq-AL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="sb-td-actions">
                    <button
                      onClick={() => setPendingClassroom(c)}
                      disabled={restoringId === c.id}
                      className="sb-btn sb-btn-restore"
                    >
                      <IconRestore />
                      {restoringId === c.id ? "..." : "Aktivizo prapë"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingClassroom && (
        <ConfirmDialog
          title="Aktivizo klasën"
          message={`Të aktivizohet prapë klasa "${pendingClassroom.name}"? Ajo do të shfaqet përsëri te klasat aktive.`}
          confirmLabel="Aktivizo prapë"
          submitting={restoringId === pendingClassroom.id}
          onCancel={() => setPendingClassroom(null)}
          onConfirm={() => handleActivate(pendingClassroom)}
        />
      )}
    </Layout>
  );
}
