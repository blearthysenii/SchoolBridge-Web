import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../services/errors";

import api from "../services/api";
import { clearAuthSession } from "../services/auth";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

import { getInactiveConcepts, restoreConcept } from "../services/conceptService";
import { getClassrooms } from "../services/classroomService";
import { getSubjectsByClassroom } from "../services/subjectService";

type User = { full_name: string; email: string; role: string };

type Concept = { id: number; name: string; subject_id: number };
type Subject = { id: number; name: string };

function IconRestore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export default function InactiveConcepts() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingConcept, setPendingConcept] = useState<Concept | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [conceptsRes, classroomsRes] = await Promise.all([
        getInactiveConcepts(),
        getClassrooms(),
      ]);
      setConcepts(conceptsRes.data);

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

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name ?? "—";

  const handleRestore = async (c: Concept) => {
    setRestoringId(c.id);
    try {
      await restoreConcept(c.id);
      setConcepts((prev) => prev.filter((x) => x.id !== c.id));
      setBanner({ type: "success", text: `Tema "${c.name}" u riaktivizua me sukses.` });
    } catch (err: unknown) {
      setBanner({ type: "error", text: getErrorMessage(err, "Dështoi riaktivizimi.") });
    } finally {
      setRestoringId(null);
      setPendingConcept(null);
    }
  };

  return (
    <Layout title="Temat joaktive" subtitle="Temat e çaktivizuara nga lëndët tuaja" backTo="/dashboard" user={user}>
      {banner && <Alert type={banner.type} message={banner.text} onClose={() => setBanner(null)} />}

      {loading ? (
        <LoadingSpinner text="Duke ngarkuar temat joaktive…" />
      ) : concepts.length === 0 ? (
        <EmptyState
          title="Nuk ka tema joaktive"
          description="Temat e çaktivizuara nga lëndët tuaja do të shfaqen këtu."
        />
      ) : (
        <div className="sb-table-wrap">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Emri i temës</th>
                <th>Lënda</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {concepts.map((c) => (
                <tr key={c.id}>
                  <td className="sb-td-name">{c.name}</td>
                  <td className="sb-td-meta">{subjectName(c.subject_id)}</td>
                  <td className="sb-td-actions">
                    <button
                      onClick={() => setPendingConcept(c)}
                      disabled={restoringId === c.id}
                      className="sb-btn sb-btn-restore"
                    >
                      <IconRestore />
                      {restoringId === c.id ? "…" : "Riaktivizo"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingConcept && (
        <ConfirmDialog
          title="Riaktivizo temën"
          message={`Të riaktivizohet tema "${pendingConcept.name}"?`}
          confirmLabel="Riaktivizo"
          submitting={restoringId === pendingConcept.id}
          onCancel={() => setPendingConcept(null)}
          onConfirm={() => handleRestore(pendingConcept)}
        />
      )}
    </Layout>
  );
}
