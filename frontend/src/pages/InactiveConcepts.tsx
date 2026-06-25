import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";

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

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name ?? "—";

  const handleRestore = async (c: Concept) => {
    if (!window.confirm(`Të riaktivizohet koncepti "${c.name}"?`)) return;
    setRestoringId(c.id);
    try {
      await restoreConcept(c.id);
      setConcepts((prev) => prev.filter((x) => x.id !== c.id));
      setBanner({ type: "success", text: `Koncepti "${c.name}" u riaktivizua me sukses.` });
    } catch (err: any) {
      setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi riaktivizimi." });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Layout title="Konceptet joaktive" subtitle="Konceptet e çaktivizuara nga lëndët tuaja" backTo="/dashboard" user={user}>
      {banner && <Alert type={banner.type} message={banner.text} onClose={() => setBanner(null)} />}

      {loading ? (
        <LoadingSpinner text="Duke ngarkuar konceptet joaktive…" />
      ) : concepts.length === 0 ? (
        <EmptyState
          title="Nuk ka koncepte joaktive"
          description="Konceptet e çaktivizuara nga lëndët tuaja do të shfaqen këtu."
        />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={th}>Emri i konceptit</th>
                <th style={th}>Lënda</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {concepts.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                  <td style={{ ...td, fontWeight: 600, color: "#0F172A" }}>{c.name}</td>
                  <td style={{ ...td, color: "#64748B" }}>{subjectName(c.subject_id)}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button
                      onClick={() => handleRestore(c)}
                      disabled={restoringId === c.id}
                      style={btnRestore}
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
