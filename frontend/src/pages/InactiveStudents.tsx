import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";

import { getInactiveStudents, activateStudent } from "../services/studentService";
import { getClassrooms } from "../services/classroomService";

type User = { full_name: string; email: string; role: string };

type Student = {
  id: number;
  full_name: string;
  personal_number: string;
  date_birth: string | null;
  classroom_id: number;
};

type Classroom = { id: number; name: string };

function IconRestore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export default function InactiveStudents() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [studentsRes, classroomsRes] = await Promise.all([
        getInactiveStudents(),
        getClassrooms(),
      ]);
      setStudents(studentsRes.data);
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

  const handleActivate = async (s: Student) => {
    if (!window.confirm(`Të riaktivizohet nxënësi "${s.full_name}"?`)) return;
    setRestoringId(s.id);
    try {
      await activateStudent(s.id);
      setStudents((prev) => prev.filter((x) => x.id !== s.id));
      setBanner({ type: "success", text: `Nxënësi "${s.full_name}" u riaktivizua me sukses.` });
    } catch (err: any) {
      setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi riaktivizimi." });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Layout title="Nxënësit joaktivë" subtitle="Nxënësit e çaktivizuar nga klasat tuaja" backTo="/dashboard" user={user}>
      {banner && <Alert type={banner.type} message={banner.text} onClose={() => setBanner(null)} />}

      {loading ? (
        <LoadingSpinner text="Duke ngarkuar nxënësit joaktivë…" />
      ) : students.length === 0 ? (
        <EmptyState
          title="Nuk ka nxënës joaktivë"
          description="Nxënësit e çaktivizuar nga klasat tuaja do të shfaqen këtu."
        />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={th}>Emri i plotë</th>
                <th style={th}>Klasa</th>
                <th style={th}>Numri personal</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                  <td style={td}>
                    <Link to={`/students/${s.id}/results`} style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
                      {s.full_name}
                    </Link>
                  </td>
                  <td style={td}>
                    <Link to={`/classrooms/${s.classroom_id}`} style={{ color: "#64748B", textDecoration: "none" }}>
                      {classroomName(s.classroom_id)}
                    </Link>
                  </td>
                  <td style={{ ...td, color: "#94A3B8" }}>{s.personal_number}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button
                      onClick={() => handleActivate(s)}
                      disabled={restoringId === s.id}
                      style={btnRestore}
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
