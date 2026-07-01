import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

import { getInactiveStudents, activateStudent } from "../services/studentService";
import { getClassrooms } from "../services/classroomService";

type User = { full_name: string; email: string; role: string };

type Student = {
  id: number;
  full_name: string;
  personal_number: string;
  parent_phone: string | null;
  final_grade: number | null;
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
  const [pendingStudent, setPendingStudent] = useState<Student | null>(null);

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
    setRestoringId(s.id);
    try {
      await activateStudent(s.id);
      setStudents((prev) => prev.filter((x) => x.id !== s.id));
      setBanner({ type: "success", text: `Nxënësi "${s.full_name}" u riaktivizua me sukses.` });
    } catch (err: any) {
      setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi riaktivizimi." });
    } finally {
      setRestoringId(null);
      setPendingStudent(null);
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
        <div className="sb-table-wrap">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Emri i plotë</th>
                <th>Klasa</th>
                <th>Numri personal</th>
                <th>Telefoni i prindit</th>
                <th>Nota finale</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/students/${s.id}/results`} className="sb-td-link">
                      {s.full_name}
                    </Link>
                  </td>
                  <td className="sb-td-meta">
                    <Link to={`/classrooms/${s.classroom_id}`} className="sb-td-link" style={{ color: "#64748B" }}>
                      {classroomName(s.classroom_id)}
                    </Link>
                  </td>
                  <td className="sb-td-muted">{s.personal_number}</td>
                  <td className="sb-td-muted">{s.parent_phone || "—"}</td>
                  <td className="sb-td-muted">{s.final_grade ?? "—"}</td>
                  <td className="sb-td-actions">
                    <button
                      onClick={() => setPendingStudent(s)}
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

      {pendingStudent && (
        <ConfirmDialog
          title="Riaktivizo nxënësin"
          message={`Të riaktivizohet nxënësi "${pendingStudent.full_name}"?`}
          confirmLabel="Riaktivizo"
          submitting={restoringId === pendingStudent.id}
          onCancel={() => setPendingStudent(null)}
          onConfirm={() => handleActivate(pendingStudent)}
        />
      )}
    </Layout>
  );
}
