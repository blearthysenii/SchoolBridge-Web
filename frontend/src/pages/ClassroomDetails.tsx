import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";

import api from "../services/api";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

import { getClassrooms } from "../services/classroomService";

import {
  createStudent,
  getStudentsByClassroom,
  updateStudent,
  deactivateStudent,
} from "../services/studentService";

import {
  createSubject,
  getSubjectsByClassroom,
  updateSubject,
  deleteSubject,
} from "../services/subjectService";

import {
  createConcept,
  getConceptsBySubject,
  updateConcept,
  deleteConcept,
} from "../services/conceptService";

import {
  createTest,
  getTestsByClassroom,
  deleteTest,
} from "../services/testService";

type User = { full_name: string; email: string; role: string };

type Classroom = { id: number; name: string; grade: number };

type Student = {
  id: number;
  full_name: string;
  personal_number: string;
  date_birth: string | null;
  classroom_id: number;
  is_active?: boolean;
};

type Subject = {
  id: number;
  name: string;
  classroom_id: number;
  is_active?: boolean;
};

type Concept = {
  id: number;
  name: string;
  subject_id: number;
  is_active?: boolean;
};

type Test = {
  id: number;
  title: string;
  classroom_id: number;
  subject_id: number;
  status?: "draft" | "published" | "archived";
};

type ModalType =
  | "student"
  | "subject"
  | "concept"
  | "test"
  | "editStudent"
  | "editSubject"
  | "editConcept"
  | null;

type PendingAction =
  | { kind: "deactivateStudent"; id: number; label: string }
  | { kind: "deleteSubject"; id: number; label: string }
  | { kind: "deleteConcept"; id: number; label: string }
  | { kind: "deleteTest"; id: number; label: string };

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
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
function IconStudent() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconSubject() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function IconConcept() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconTest() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  onAdd,
  addLabel,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="sb-section-header">
      <div className="sb-section-header-left">
        <div className="sb-section-icon">{icon}</div>
        <div>
          <div className="sb-section-title">{title}</div>
          <div className="sb-section-count">{count} gjithsej</div>
        </div>
      </div>
      <button className="sb-btn sb-btn-primary" onClick={onAdd}>
        <IconPlus />
        {addLabel}
      </button>
    </div>
  );
}

function Modal({
  title,
  onClose,
  onSubmit,
  submitting,
  error,
  children,
  submitLabel,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
  children: React.ReactNode;
  submitLabel: string;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="sb-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sb-modal">
        <div className="sb-modal-header">
          <div className="sb-modal-title">{title}</div>
          <button className="sb-modal-close" onClick={onClose} aria-label="Mbyll"><IconClose /></button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          {error && <div className="sb-form-error">{error}</div>}
          <div className="sb-modal-actions">
            <button type="button" className="sb-btn sb-btn-secondary" onClick={onClose}>Anulo</button>
            <button type="submit" className="sb-btn sb-btn-primary" disabled={submitting}>
              {submitting ? "Duke ruajtur…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClassroomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quickActionHandledRef = useRef("");

  const [user, setUser] = useState<User | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [fullName, setFullName] = useState("");
  const [personalNumber, setPersonalNumber] = useState("");
  const [dateBirth, setDateBirth] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [conceptName, setConceptName] = useState("");

  const [testTitle, setTestTitle] = useState("");
  const [selectedTestSubjectId, setSelectedTestSubjectId] = useState<number | "">("");

  // UI state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "subjects" | "concepts" | "tests">("students");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // ── Loaders ──
  // Pamjet aktive nuk duhet të shfaqin rekorde të çaktivizuara/arkivuara,
  // edhe nëse përgjigja nga backend-i i përfshin.
  const loadStudents = async () => {
    if (!id) return;
    const r = await getStudentsByClassroom(id);
    setStudents(r.data.filter((s: Student) => s.is_active !== false));
  };
  const loadSubjects = async () => {
    if (!id) return;
    const r = await getSubjectsByClassroom(id);
    setSubjects(r.data.filter((s: Subject) => s.is_active !== false));
  };
  const loadConcepts = async (subjectId: number) => {
    const r = await getConceptsBySubject(subjectId);
    setConcepts(r.data.filter((c: Concept) => c.is_active !== false));
  };
  const loadTests = async () => {
    if (!id) return;
    const r = await getTestsByClassroom(Number(id));
    setTests(r.data.filter((t: Test) => t.status !== "archived"));
  };
  const loadClassroom = async () => {
    const r = await getClassrooms();
    const found = r.data.find((c: Classroom) => c.id === Number(id));
    setClassroom(found ?? null);
  };
  const refreshData = async () => {
    await Promise.all([loadClassroom(), loadStudents(), loadSubjects(), loadTests()]);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } });
        setUser(res.data);
        await refreshData();
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, navigate]);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  const openModal = (type: ModalType) => {
    setFormError("");
    setEditingId(null);
    if (type === "student") { setFullName(""); setPersonalNumber(""); setDateBirth(""); }
    if (type === "subject") setSubjectName("");
    if (type === "concept") setConceptName("");
    if (type === "test") { setTestTitle(""); setSelectedTestSubjectId(""); }
    setActiveModal(type);
  };
  const closeModal = () => {
    setActiveModal(null);
    setFormError("");
    setEditingId(null);
  };

  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const action = params.get("action");
    const key = `${id}:${location.search}`;

    if (quickActionHandledRef.current === key) return;

    if (tab === "students" || tab === "subjects" || tab === "concepts" || tab === "tests") {
      setActiveTab(tab);
      quickActionHandledRef.current = key;
    }

    if (action === "new-student") {
      setActiveTab("students");
      openModal("student");
      quickActionHandledRef.current = key;
    }

    if (action === "new-test") {
      setActiveTab("tests");
      openModal("test");
      quickActionHandledRef.current = key;
    }
  }, [id, loading, location.search]);

  const openEditStudent = (s: Student) => {
    setEditingId(s.id);
    setFullName(s.full_name);
    setPersonalNumber(s.personal_number);
    setDateBirth(s.date_birth ? s.date_birth.slice(0, 10) : "");
    openModal("editStudent");
  };

  const openEditSubject = (s: Subject) => {
    setEditingId(s.id);
    setSubjectName(s.name);
    openModal("editSubject");
  };

  const openEditConcept = (c: Concept) => {
    setEditingId(c.id);
    setConceptName(c.name);
    openModal("editConcept");
  };

  // ── Handlers ──
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true); setFormError("");
    try {
      await createStudent(fullName, personalNumber, dateBirth, Number(id));
      setFullName(""); setPersonalNumber(""); setDateBirth("");
      await loadStudents();
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Dështoi shtimi i nxënësit.");
    } finally { setSubmitting(false); }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true); setFormError("");
    try {
      await createSubject(subjectName, Number(id));
      setSubjectName("");
      await loadSubjects();
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Dështoi shtimi i lëndës.");
    } finally { setSubmitting(false); }
  };

  const handleSubjectChange = async (subjectId: string) => {
    const parsed = Number(subjectId);
    setSelectedSubjectId(parsed);
    if (parsed) await loadConcepts(parsed);
    else setConcepts([]);
  };

  const handleCreateConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) { setFormError("Zgjidhni një lëndë."); return; }
    setSubmitting(true); setFormError("");
    try {
      await createConcept(conceptName, Number(selectedSubjectId));
      setConceptName("");
      await loadConcepts(Number(selectedSubjectId));
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Dështoi shtimi i konceptit.");
    } finally { setSubmitting(false); }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedTestSubjectId) { setFormError("Zgjidhni një lëndë."); return; }
    setSubmitting(true); setFormError("");
    try {
      await createTest(testTitle, Number(id), Number(selectedTestSubjectId));
      setTestTitle(""); setSelectedTestSubjectId("");
      await loadTests();
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Dështoi krijimi i testit.");
    } finally { setSubmitting(false); }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true); setFormError("");
    try {
      await updateStudent(editingId, {
        full_name: fullName,
        personal_number: personalNumber,
        date_birth: dateBirth || null,
      });
      setFullName(""); setPersonalNumber(""); setDateBirth("");
      await loadStudents();
      closeModal();
      setBanner({ type: "success", text: "Nxënësi u përditësua me sukses." });
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Dështoi përditësimi i nxënësit.");
    } finally { setSubmitting(false); }
  };

  const handleDeactivateStudent = async (studentId: number) => {
    setDeletingId(studentId);
    try {
      await deactivateStudent(studentId);
      await loadStudents();
      setBanner({ type: "info", text: "Nxënësi u bë joaktiv. Mund ta riaktivizoni nga skeda e nxënësve joaktivë." });
    } catch (err: any) { setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi çaktivizimi." }); }
    finally { setDeletingId(null); }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true); setFormError("");
    try {
      await updateSubject(editingId, subjectName);
      setSubjectName("");
      await loadSubjects();
      closeModal();
      setBanner({ type: "success", text: "Lënda u riemërua me sukses." });
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Dështoi riemërimi i lëndës.");
    } finally { setSubmitting(false); }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    setDeletingId(subjectId);
    try {
      const res = await deleteSubject(subjectId);
      await loadSubjects();
      if (selectedSubjectId === subjectId) { setSelectedSubjectId(""); setConcepts([]); }
      const softDeleted = res.data?.message?.includes("joaktive");
      setBanner({ type: softDeleted ? "info" : "success", text: res.data?.message || "Lënda u fshi me sukses." });
    } catch (err: any) { setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi fshirja." }); }
    finally { setDeletingId(null); }
  };

  const handleUpdateConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true); setFormError("");
    try {
      await updateConcept(editingId, conceptName);
      setConceptName("");
      if (selectedSubjectId) await loadConcepts(Number(selectedSubjectId));
      closeModal();
      setBanner({ type: "success", text: "Koncepti u riemërua me sukses." });
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Dështoi riemërimi i konceptit.");
    } finally { setSubmitting(false); }
  };

  const handleDeleteConcept = async (conceptId: number) => {
    setDeletingId(conceptId);
    try {
      const res = await deleteConcept(conceptId);
      if (selectedSubjectId) await loadConcepts(Number(selectedSubjectId));
      const softDeleted = res.data?.message?.includes("joaktiv");
      setBanner({ type: softDeleted ? "info" : "success", text: res.data?.message || "Koncepti u fshi me sukses." });
    } catch (err: any) { setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi fshirja." }); }
    finally { setDeletingId(null); }
  };

  const handleDeleteTest = async (testId: number) => {
    setDeletingId(testId);
    try {
      const res = await deleteTest(testId);
      await loadTests();
      const archived = res.data?.message?.includes("arkivua");
      setBanner({ type: archived ? "info" : "success", text: res.data?.message || "Testi u fshi me sukses." });
    } catch (err: any) { setBanner({ type: "error", text: err.response?.data?.detail || "Dështoi fshirja." }); }
    finally { setDeletingId(null); }
  };

  const runPendingAction = async () => {
    if (!pendingAction) return;
    const { kind, id: targetId } = pendingAction;
    setPendingAction(null);
    if (kind === "deactivateStudent") await handleDeactivateStudent(targetId);
    if (kind === "deleteSubject") await handleDeleteSubject(targetId);
    if (kind === "deleteConcept") await handleDeleteConcept(targetId);
    if (kind === "deleteTest") await handleDeleteTest(targetId);
  };

  const tabs: { key: typeof activeTab; label: string; count: number }[] = [
    { key: "students", label: "Nxënësit", count: students.length },
    { key: "subjects", label: "Lëndët", count: subjects.length },
    { key: "concepts", label: "Konceptet", count: concepts.length },
    { key: "tests", label: "Testet", count: tests.length },
  ];

  return (
    <Layout
      title={classroom ? classroom.name : "Detajet e klasës"}
      subtitle={classroom ? `Viti ${classroom.grade} · Menaxhoni nxënësit, lëndët, konceptet dhe testet` : undefined}
      backTo="/dashboard"
      backLabel="Paneli"
      user={user}
    >
      {banner && (
        <Alert type={banner.type} message={banner.text} onClose={() => setBanner(null)} />
      )}

      {loading ? (
        <LoadingSpinner text="Duke ngarkuar klasën…" />
      ) : (
        <>
          <div className="sb-tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`sb-tab${activeTab === t.key ? " sb-tab-active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
                <span className="sb-tab-badge">{t.count}</span>
              </button>
            ))}
          </div>

          {/* ── STUDENTS TAB ── */}
          {activeTab === "students" && (
            <>
              <SectionHeader
                icon={<IconStudent />}
                title="Nxënësit"
                count={students.length}
                onAdd={() => openModal("student")}
                addLabel="Shto nxënës"
              />
              {students.length > 0 ? (
                <div className="sb-table-wrap">
                  <table className="sb-table">
                    <thead>
                      <tr>
                        <th>Emri i plotë</th>
                        <th>Numri personal</th>
                        <th>Datëlindja</th>
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
                          <td className="sb-td-meta">{s.personal_number}</td>
                          <td className="sb-td-meta">
                            {s.date_birth
                              ? new Date(s.date_birth).toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </td>
                          <td className="sb-td-actions">
                            <button className="sb-btn sb-btn-ghost" style={{ marginRight: 6 }} onClick={() => openEditStudent(s)}>
                              <IconEdit />
                              Ndrysho
                            </button>
                            <button
                              className="sb-btn sb-btn-warn-ghost"
                              onClick={() => setPendingAction({ kind: "deactivateStudent", id: s.id, label: s.full_name })}
                              disabled={deletingId === s.id}
                            >
                              <IconArchive />
                              {deletingId === s.id ? "…" : "Çaktivizo"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Asgjë këtu ende" description="Shtoni nxënësin e parë duke klikuar 'Shto nxënës'." />
              )}
            </>
          )}

          {/* ── SUBJECTS TAB ── */}
          {activeTab === "subjects" && (
            <>
              <SectionHeader
                icon={<IconSubject />}
                title="Lëndët"
                count={subjects.length}
                onAdd={() => openModal("subject")}
                addLabel="Shto lëndë"
              />
              {subjects.length > 0 ? (
                <div className="sb-table-wrap">
                  <table className="sb-table">
                    <thead>
                      <tr>
                        <th>Emri i lëndës</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s.id}>
                          <td className="sb-td-name">{s.name}</td>
                          <td className="sb-td-actions">
                            <button className="sb-btn sb-btn-ghost" style={{ marginRight: 6 }} onClick={() => openEditSubject(s)}>
                              <IconEdit />
                              Ndrysho
                            </button>
                            <button
                              className="sb-btn sb-btn-warn-ghost"
                              onClick={() => setPendingAction({ kind: "deleteSubject", id: s.id, label: s.name })}
                              disabled={deletingId === s.id}
                            >
                              <IconArchive />
                              {deletingId === s.id ? "…" : "Çaktivizo"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Asgjë këtu ende" description="Shtoni lëndën e parë duke klikuar 'Shto lëndë'." />
              )}
            </>
          )}

          {/* ── CONCEPTS TAB ── */}
          {activeTab === "concepts" && (
            <>
              <SectionHeader
                icon={<IconConcept />}
                title="Konceptet"
                count={concepts.length}
                onAdd={() => openModal("concept")}
                addLabel="Shto koncept"
              />
              <div className="sb-card sb-filter-row">
                <label>Filtro sipas lëndës:</label>
                <select
                  className="sb-form-select"
                  style={{ flex: 1 }}
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                >
                  <option value="">— Zgjidhni lëndën —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {!selectedSubjectId ? (
                <EmptyState title="Asgjë këtu ende" description="Zgjidhni një lëndë për të parë konceptet e saj." />
              ) : concepts.length > 0 ? (
                <div className="sb-table-wrap">
                  <table className="sb-table">
                    <thead>
                      <tr>
                        <th>Emri i konceptit</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {concepts.map((c) => (
                        <tr key={c.id}>
                          <td className="sb-td-name">{c.name}</td>
                          <td className="sb-td-actions">
                            <button className="sb-btn sb-btn-ghost" style={{ marginRight: 6 }} onClick={() => openEditConcept(c)}>
                              <IconEdit />
                              Ndrysho
                            </button>
                            <button
                              className="sb-btn sb-btn-warn-ghost"
                              onClick={() => setPendingAction({ kind: "deleteConcept", id: c.id, label: c.name })}
                              disabled={deletingId === c.id}
                            >
                              <IconArchive />
                              {deletingId === c.id ? "…" : "Çaktivizo"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Asgjë këtu ende" description="Kjo lëndë nuk ka koncepte ende." />
              )}
            </>
          )}

          {/* ── TESTS TAB ── */}
          {activeTab === "tests" && (
            <>
              <SectionHeader
                icon={<IconTest />}
                title="Testet"
                count={tests.length}
                onAdd={() => openModal("test")}
                addLabel="Shto test"
              />
              {tests.length > 0 ? (
                <div className="sb-table-wrap">
                  <table className="sb-table">
                    <thead>
                      <tr>
                        <th>Titulli i testit</th>
                        <th>Lënda</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <Link to={`/tests/${t.id}`} className="sb-td-link">{t.title}</Link>
                          </td>
                          <td className="sb-td-meta">
                            {subjects.find((s) => s.id === t.subject_id)?.name ?? "—"}
                          </td>
                          <td className="sb-td-actions">
                            <button
                              className="sb-btn sb-btn-warn-ghost"
                              onClick={() => setPendingAction({ kind: "deleteTest", id: t.id, label: t.title })}
                              disabled={deletingId === t.id}
                            >
                              <IconArchive />
                              {deletingId === t.id ? "…" : "Arkivo"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Asgjë këtu ende" description="Krijoni testin e parë duke klikuar 'Shto test'." />
              )}
            </>
          )}
        </>
      )}

      {/* ── CREATE / EDIT MODALS ── */}
      {activeModal === "student" && (
        <Modal title="Shto nxënës të ri" onClose={closeModal} onSubmit={handleCreateStudent} submitting={submitting} error={formError} submitLabel="Shto nxënësin">
          <div className="sb-form-group">
            <label className="sb-form-label">Emri i plotë</label>
            <input className="sb-form-input" type="text" placeholder="p.sh. Artan Berisha" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="sb-form-group">
            <label className="sb-form-label">Numri personal</label>
            <input className="sb-form-input" type="text" placeholder="Numri personal i nxënësit" value={personalNumber} onChange={(e) => setPersonalNumber(e.target.value)} required />
          </div>
          <div className="sb-form-group">
            <label className="sb-form-label">Datëlindja <span style={{ color: "#94A3B8", fontWeight: 400 }}>(opcionale)</span></label>
            <input className="sb-form-input" type="date" value={dateBirth} onChange={(e) => setDateBirth(e.target.value)} />
          </div>
        </Modal>
      )}

      {activeModal === "subject" && (
        <Modal title="Shto lëndë të re" onClose={closeModal} onSubmit={handleCreateSubject} submitting={submitting} error={formError} submitLabel="Shto lëndën">
          <div className="sb-form-group">
            <label className="sb-form-label">Emri i lëndës</label>
            <input className="sb-form-input" type="text" placeholder="p.sh. Matematikë" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
          </div>
        </Modal>
      )}

      {activeModal === "concept" && (
        <Modal title="Shto koncept të ri" onClose={closeModal} onSubmit={handleCreateConcept} submitting={submitting} error={formError} submitLabel="Shto konceptin">
          {!selectedSubjectId && (
            <div className="sb-hint">
              Zgjidhni fillimisht një lëndë në skedën "Konceptet" për të lidhur konceptin.
            </div>
          )}
          <div className="sb-form-group">
            <label className="sb-form-label">Lënda</label>
            <select className="sb-form-select" value={selectedSubjectId} onChange={(e) => handleSubjectChange(e.target.value)} required>
              <option value="">— Zgjidhni lëndën —</option>
              {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div className="sb-form-group">
            <label className="sb-form-label">Emri i konceptit</label>
            <input className="sb-form-input" type="text" placeholder="p.sh. Thyesat" value={conceptName} onChange={(e) => setConceptName(e.target.value)} required />
          </div>
        </Modal>
      )}

      {activeModal === "test" && (
        <Modal title="Krijo test të ri" onClose={closeModal} onSubmit={handleCreateTest} submitting={submitting} error={formError} submitLabel="Krijo testin">
          <div className="sb-form-group">
            <label className="sb-form-label">Lënda</label>
            <select className="sb-form-select" value={selectedTestSubjectId} onChange={(e) => setSelectedTestSubjectId(Number(e.target.value))} required>
              <option value="">— Zgjidhni lëndën —</option>
              {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div className="sb-form-group">
            <label className="sb-form-label">Titulli i testit</label>
            <input className="sb-form-input" type="text" placeholder="p.sh. Matematikë — Testi 1" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} required />
          </div>
        </Modal>
      )}

      {activeModal === "editStudent" && (
        <Modal title="Ndrysho nxënësin" onClose={closeModal} onSubmit={handleUpdateStudent} submitting={submitting} error={formError} submitLabel="Ruaj ndryshimet">
          <div className="sb-form-group">
            <label className="sb-form-label">Emri i plotë</label>
            <input className="sb-form-input" type="text" placeholder="p.sh. Artan Berisha" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="sb-form-group">
            <label className="sb-form-label">Numri personal</label>
            <input className="sb-form-input" type="text" placeholder="Numri personal i nxënësit" value={personalNumber} onChange={(e) => setPersonalNumber(e.target.value)} required />
          </div>
          <div className="sb-form-group">
            <label className="sb-form-label">Datëlindja <span style={{ color: "#94A3B8", fontWeight: 400 }}>(opcionale)</span></label>
            <input className="sb-form-input" type="date" value={dateBirth} onChange={(e) => setDateBirth(e.target.value)} />
          </div>
        </Modal>
      )}

      {activeModal === "editSubject" && (
        <Modal title="Ndrysho lëndën" onClose={closeModal} onSubmit={handleUpdateSubject} submitting={submitting} error={formError} submitLabel="Ruaj ndryshimet">
          <div className="sb-form-group">
            <label className="sb-form-label">Emri i lëndës</label>
            <input className="sb-form-input" type="text" placeholder="p.sh. Matematikë" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
          </div>
        </Modal>
      )}

      {activeModal === "editConcept" && (
        <Modal title="Ndrysho konceptin" onClose={closeModal} onSubmit={handleUpdateConcept} submitting={submitting} error={formError} submitLabel="Ruaj ndryshimet">
          <div className="sb-form-group">
            <label className="sb-form-label">Emri i konceptit</label>
            <input className="sb-form-input" type="text" placeholder="p.sh. Thyesat" value={conceptName} onChange={(e) => setConceptName(e.target.value)} required />
          </div>
        </Modal>
      )}

      {pendingAction && (
        <ConfirmDialog
          title={
            pendingAction.kind === "deactivateStudent" ? "Çaktivizo nxënësin" :
            pendingAction.kind === "deleteTest" ? "Arkivo testin" :
            pendingAction.kind === "deleteSubject" ? "Çaktivizo lëndën" : "Çaktivizo konceptin"
          }
          message={
            pendingAction.kind === "deactivateStudent"
              ? `Të çaktivizohet nxënësi "${pendingAction.label}"? Mund ta riaktivizoni më vonë nga "Arkivi" në menu.`
              : pendingAction.kind === "deleteTest"
              ? `Të arkivohet testi "${pendingAction.label}"? Mund ta rikthesh më vonë si skicë nga "Arkivi" në menu.`
              : `Të çaktivizohet "${pendingAction.label}"? Mund ta riaktivizoni më vonë nga "Arkivi" në menu.`
          }
          confirmLabel={pendingAction.kind === "deleteTest" ? "Arkivo" : "Çaktivizo"}
          variant="default"
          submitting={deletingId === pendingAction.id}
          onCancel={() => setPendingAction(null)}
          onConfirm={runPendingAction}
        />
      )}
    </Layout>
  );
}

export default ClassroomDetails;
