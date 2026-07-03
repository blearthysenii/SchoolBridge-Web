import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getErrorMessage } from "../services/errors";

import api from "../services/api";
import { clearAuthSession } from "../services/auth";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

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
  const [pendingTest, setPendingTest] = useState<Test | null>(null);

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
        const res = await api.get("/users/me");
        setUser(res.data);
        await load();
      } catch {
        clearAuthSession();
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
    setRestoringId(t.id);
    try {
      await updateTestStatus(t.id, "draft");
      setTests((prev) => prev.filter((x) => x.id !== t.id));
      setBanner({ type: "success", text: `Testi "${t.title}" u rikthye me sukses si skicë.` });
    } catch (err: unknown) {
      setBanner({ type: "error", text: getErrorMessage(err, "Dështoi rikthimi.") });
    } finally {
      setRestoringId(null);
      setPendingTest(null);
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
        <div className="sb-table-wrap">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Titulli i testit</th>
                <th>Klasa</th>
                <th>Lënda</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tests/${t.id}`} className="sb-td-link">
                      {t.title}
                    </Link>
                  </td>
                  <td className="sb-td-meta">
                    <Link to={`/classrooms/${t.classroom_id}`} className="sb-td-link" style={{ color: "#64748B" }}>
                      {classroomName(t.classroom_id)}
                    </Link>
                  </td>
                  <td className="sb-td-meta">{subjectName(t.subject_id)}</td>
                  <td className="sb-td-actions">
                    <button
                      onClick={() => setPendingTest(t)}
                      disabled={restoringId === t.id}
                      className="sb-btn sb-btn-restore"
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

      {pendingTest && (
        <ConfirmDialog
          title="Rikthe testin"
          message={`Të rikthehet testi "${pendingTest.title}" si skicë?`}
          confirmLabel="Rikthe"
          submitting={restoringId === pendingTest.id}
          onCancel={() => setPendingTest(null)}
          onConfirm={() => handleRestore(pendingTest)}
        />
      )}
    </Layout>
  );
}
