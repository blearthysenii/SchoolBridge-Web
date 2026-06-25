import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";

import { getArchivedTests, updateTestStatus } from "../services/testService";
import { getClassrooms } from "../services/classroomService";
import { getSubjectsByClassroom } from "../services/subjectService";

type User = { full_name: string; email: string; role: string };

type Test = { id: number; title: string; classroom_id: number; subject_id: number };
type Classroom = { id: number; name: string };
type Subject = { id: number; name: string };

function IconRestore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export default function ArchivedTests() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [testsRes, classroomsRes] = await Promise.all([
        getArchivedTests(),
        getClassrooms(),
      ]);
      setTests(testsRes.data);
      setClassrooms(classroomsRes.data);

      const subjectLists = await Promise.all(
        classroomsRes.data.map((c: { id: number }) => getSubjectsByClassroom(String(c.id)))
      );
      setSubjects(subjectLists.flatMap((r) => r.data));
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
  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name ?? "—";

  const handleRestore = async (t: Test) => {
    if (!window.confirm(`Të rikthehet testi "${t.title}" si draft?`)) return;
    setRestoringId(t.id);
    try {
      await updateTestStatus(t.id, "draft");
      setTests((prev) => prev.filter((x) => x.id !== t.id));
      setBanner({ type: "success", text: `Testi "${t.title}" u rikthye me sukses si draft.` });
    } catch (err: any) {
      setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi rikthimi." });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Layout title="Testet e arkivuara" subtitle="Testet e arkivuara nga klasat tuaja" backTo="/dashboard" user={user}>
      {banner && <Alert type={banner.type} message={banner.text} onClose={() => setBanner(null)} />}

      {loading ? (
        <LoadingSpinner text="Duke ngarkuar testet e arkivuara…" />
      ) : tests.length === 0 ? (
        <EmptyState
          title="Nuk ka teste të arkivuara"
          description="Testet e arkivuara (që kanë rezultate të lidhura) do të shfaqen këtu."
        />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={th}>Titulli i testit</th>
                <th style={th}>Klasa</th>
                <th style={th}>Lënda</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                  <td style={td}>
                    <Link to={`/tests/${t.id}`} style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
                      {t.title}
                    </Link>
                  </td>
                  <td style={td}>
                    <Link to={`/classrooms/${t.classroom_id}`} style={{ color: "#64748B", textDecoration: "none" }}>
                      {classroomName(t.classroom_id)}
                    </Link>
                  </td>
                  <td style={{ ...td, color: "#64748B" }}>{subjectName(t.subject_id)}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button
                      onClick={() => handleRestore(t)}
                      disabled={restoringId === t.id}
                      style={btnRestore}
                    >
                      <IconRestore />
                      {restoringId === t.id ? "…" : "Rikthe"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: "11.5px",
  fontWeight: 600,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  padding: "10px 16px",
};

const td: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "13.5px",
  color: "#334155",
  verticalAlign: "middle",
};

const btnRestore: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "12.5px",
  fontWeight: 600,
  color: "#0F766E",
  background: "#ECFDF5",
  border: "1px solid #A7F3D0",
  cursor: "pointer",
};
