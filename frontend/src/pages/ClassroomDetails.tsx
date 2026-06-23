import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  createStudent,
  getStudentsByClassroom,
  deleteStudent,
} from "../services/studentService";

import {
  createSubject,
  getSubjectsByClassroom,
  deleteSubject,
} from "../services/subjectService";

import {
  createConcept,
  getConceptsBySubject,
  deleteConcept,
} from "../services/conceptService";

import {
  createTest,
  getTestsByClassroom,
  deleteTest,
} from "../services/testService";

type Student = {
  id: number;
  full_name: string;
  personal_number: string;
  date_birth: string | null;
  classroom_id: number;
};

type Subject = {
  id: number;
  name: string;
  classroom_id: number;
};

type Concept = {
  id: number;
  name: string;
  subject_id: number;
};

type Test = {
  id: number;
  title: string;
  classroom_id: number;
  subject_id: number;
};

type ModalType = "student" | "subject" | "concept" | "test" | null;

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
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
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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
function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────
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
    <div className="section-header">
      <div className="section-header-left">
        <div className="section-icon">{icon}</div>
        <div>
          <div className="section-title-text">{title}</div>
          <div className="section-count">{count} gjithsej</div>
        </div>
      </div>
      <button className="btn-primary" onClick={onAdd}>
        <IconPlus />
        {addLabel}
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <strong>Asgjë këtu ende</strong>
      {text}
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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><IconClose /></button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Anulo</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Duke ruajtur…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function ClassroomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [tests, setTests] = useState<Test[]>([]);

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

  // ── Loaders ──
  const loadStudents = async () => {
    if (!id) return;
    const r = await getStudentsByClassroom(id);
    setStudents(r.data);
  };
  const loadSubjects = async () => {
    if (!id) return;
    const r = await getSubjectsByClassroom(id);
    setSubjects(r.data);
  };
  const loadConcepts = async (subjectId: number) => {
    const r = await getConceptsBySubject(subjectId);
    setConcepts(r.data);
  };
  const loadTests = async () => {
    if (!id) return;
    const r = await getTestsByClassroom(Number(id));
    setTests(r.data);
  };
  const refreshData = async () => {
    await loadStudents();
    await loadSubjects();
    await loadTests();
  };

  useEffect(() => { refreshData(); }, [id]);

  const openModal = (type: ModalType) => {
    setFormError("");
    setActiveModal(type);
  };
  const closeModal = () => {
    setActiveModal(null);
    setFormError("");
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

  const handleDeleteStudent = async (studentId: number) => {
    setDeletingId(studentId);
    try { await deleteStudent(studentId); await loadStudents(); }
    catch (err: any) { alert(err.response?.data?.detail || "Dështoi fshirja."); }
    finally { setDeletingId(null); }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    setDeletingId(subjectId);
    try {
      await deleteSubject(subjectId);
      await loadSubjects();
      if (selectedSubjectId === subjectId) { setSelectedSubjectId(""); setConcepts([]); }
    } catch (err: any) { alert(err.response?.data?.detail || "Dështoi fshirja."); }
    finally { setDeletingId(null); }
  };

  const handleDeleteConcept = async (conceptId: number) => {
    setDeletingId(conceptId);
    try {
      await deleteConcept(conceptId);
      if (selectedSubjectId) await loadConcepts(Number(selectedSubjectId));
    } catch (err: any) { alert(err.response?.data?.detail || "Dështoi fshirja."); }
    finally { setDeletingId(null); }
  };

  const handleDeleteTest = async (testId: number) => {
    setDeletingId(testId);
    try { await deleteTest(testId); await loadTests(); }
    catch (err: any) { alert(err.response?.data?.detail || "Dështoi fshirja."); }
    finally { setDeletingId(null); }
  };

  const tabs: { key: typeof activeTab; label: string; count: number }[] = [
    { key: "students", label: "Nxënësit", count: students.length },
    { key: "subjects", label: "Lëndët", count: subjects.length },
    { key: "concepts", label: "Konceptet", count: concepts.length },
    { key: "tests", label: "Testet", count: tests.length },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #0f172a; }
        a { text-decoration: none; color: inherit; }

        /* TOPBAR */
        .topbar {
          background: #fff; border-bottom: 1px solid #e2e8f0;
          padding: 0 28px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .topbar-left { display: flex; align-items: center; gap: 10px; }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: 1px solid #e2e8f0; border-radius: 7px;
          padding: 6px 12px; font-size: 13px; font-weight: 500; color: #475569;
          cursor: pointer; transition: background 0.12s, border-color 0.12s;
        }
        .back-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13.5px; }
        .breadcrumb-link { color: #64748b; font-weight: 500; }
        .breadcrumb-link:hover { color: #2563eb; }
        .breadcrumb-sep { color: #cbd5e1; }
        .breadcrumb-current { color: #0f172a; font-weight: 600; }

        /* PAGE BODY */
        .page { max-width: 900px; margin: 0 auto; padding: 28px; }

        /* PAGE TITLE ROW */
        .page-title-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 24px; gap: 12px;
        }
        .page-title { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.4px; }
        .page-subtitle { font-size: 13px; color: #94a3b8; margin-top: 3px; }

        /* TABS */
        .tabs {
          display: flex; gap: 0;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 24px;
          overflow-x: auto;
        }
        .tab {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; font-size: 13.5px; font-weight: 500; color: #64748b;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          cursor: pointer; white-space: nowrap; transition: color 0.12s;
          background: none; border-top: none; border-left: none; border-right: none;
        }
        .tab:hover { color: #0f172a; }
        .tab.active { color: #2563eb; border-bottom-color: #2563eb; }
        .tab-badge {
          background: #f1f5f9; color: #64748b;
          font-size: 11px; font-weight: 600;
          padding: 1px 6px; border-radius: 10px;
          min-width: 20px; text-align: center;
        }
        .tab.active .tab-badge { background: #eff6ff; color: #2563eb; }

        /* SECTION HEADER */
        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; gap: 12px;
        }
        .section-header-left { display: flex; align-items: center; gap: 12px; }
        .section-icon {
          width: 38px; height: 38px; border-radius: 8px;
          background: #eff6ff; color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .section-title-text { font-size: 15px; font-weight: 700; color: #0f172a; }
        .section-count { font-size: 12px; color: #94a3b8; margin-top: 1px; }

        /* TABLE */
        .data-table {
          width: 100%; border-collapse: collapse;
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 10px; overflow: hidden;
        }
        .data-table th {
          text-align: left; font-size: 11.5px; font-weight: 600;
          color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;
          padding: 10px 16px; background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .data-table td {
          padding: 12px 16px; font-size: 13.5px; color: #334155;
          border-bottom: 1px solid #f1f5f9; vertical-align: middle;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: #fafbff; }

        .td-name { font-weight: 600; color: #0f172a; }
        .td-link { font-weight: 600; color: #2563eb; }
        .td-link:hover { text-decoration: underline; }
        .td-meta { font-size: 12.5px; color: #94a3b8; }
        .td-actions { text-align: right; }

        .btn-delete {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
          color: #64748b; background: none; border: 1px solid #e2e8f0;
          cursor: pointer; transition: all 0.12s;
        }
        .btn-delete:hover { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
        .btn-delete:disabled { opacity: 0.4; cursor: not-allowed; }

        /* SUBJECT SELECTOR for concepts tab */
        .subject-filter {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px; padding: 12px 14px;
          background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
        }
        .subject-filter label { font-size: 12.5px; font-weight: 600; color: #64748b; white-space: nowrap; }
        .subject-filter select {
          flex: 1; padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 6px;
          font-size: 13px; color: #0f172a; background: #f8fafc;
          outline: none; transition: border-color 0.12s;
        }
        .subject-filter select:focus { border-color: #93c5fd; }

        /* EMPTY */
        .empty-state {
          background: #f8fafc; border: 1px dashed #e2e8f0;
          border-radius: 10px; padding: 36px 24px;
          text-align: center; color: #94a3b8; font-size: 13.5px;
        }
        .empty-state strong { display: block; font-size: 14px; color: #64748b; margin-bottom: 4px; }

        /* BUTTONS */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #2563eb; color: #fff;
          border: none; border-radius: 7px;
          padding: 8px 14px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.12s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
        .btn-secondary {
          padding: 8px 16px; border-radius: 7px;
          font-size: 13px; font-weight: 600;
          background: #f1f5f9; color: #475569;
          border: none; cursor: pointer; transition: background 0.12s;
        }
        .btn-secondary:hover { background: #e2e8f0; }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.35);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; padding: 16px;
        }
        .modal {
          background: #fff; border-radius: 12px;
          width: 100%; max-width: 420px;
          box-shadow: 0 12px 40px rgba(15,23,42,0.18);
          padding: 28px;
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .modal-title { font-size: 16px; font-weight: 700; color: #0f172a; }
        .modal-close {
          background: none; border: none; cursor: pointer;
          color: #94a3b8; padding: 2px; border-radius: 5px;
        }
        .modal-close:hover { color: #475569; background: #f1f5f9; }
        .modal-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }

        /* FORM */
        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 12.5px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .form-input {
          width: 100%; padding: 9px 12px;
          border: 1px solid #e2e8f0; border-radius: 7px;
          font-size: 13.5px; color: #0f172a; background: #fff;
          outline: none; transition: border-color 0.12s, box-shadow 0.12s;
        }
        .form-input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(147,197,253,0.25); }
        .form-input::placeholder { color: #cbd5e1; }
        .form-select {
          width: 100%; padding: 9px 12px;
          border: 1px solid #e2e8f0; border-radius: 7px;
          font-size: 13.5px; color: #0f172a; background: #fff;
          outline: none; transition: border-color 0.12s, box-shadow 0.12s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        .form-select:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(147,197,253,0.25); }
        .form-error { font-size: 12px; color: #e11d48; margin-top: 10px; }

        /* CONCEPT HINT */
        .concept-hint {
          background: #fffbeb; border: 1px solid #fde68a;
          border-radius: 7px; padding: 10px 12px;
          font-size: 12.5px; color: #92400e; margin-bottom: 14px;
        }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .page { padding: 16px; }
          .topbar { padding: 0 16px; }
          .breadcrumb { display: none; }
          .page-title { font-size: 18px; }
          .data-table th, .data-table td { padding: 10px 12px; }
          .hide-mobile { display: none; }
          .tab { padding: 10px 12px; font-size: 12.5px; }
        }
      `}</style>

      {/* TOP BAR */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <IconBack />
            Kthehu
          </button>
          <div className="breadcrumb">
            <Link to="/dashboard" className="breadcrumb-link">Paneli</Link>
            <span className="breadcrumb-sep"><IconChevron /></span>
            <span className="breadcrumb-current">Klasa #{id}</span>
          </div>
        </div>
      </header>

      <div className="page">
        {/* PAGE TITLE */}
        <div className="page-title-row">
          <div>
            <div className="page-title">Detajet e klasës</div>
            <div className="page-subtitle">ID: {id} · Menaxhoni nxënësit, lëndët, konceptet dhe testet</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className="tab-badge">{t.count}</span>
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Emri i plotë</th>
                    <th className="hide-mobile">Numri personal</th>
                    <th className="hide-mobile">Datëlindja</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link to={`/students/${s.id}/results`} className="td-link">
                          {s.full_name}
                        </Link>
                      </td>
                      <td className="td-meta hide-mobile">{s.personal_number}</td>
                      <td className="td-meta hide-mobile">
                        {s.date_birth
                          ? new Date(s.date_birth).toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="td-actions">
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteStudent(s.id)}
                          disabled={deletingId === s.id}
                        >
                          <IconTrash />
                          {deletingId === s.id ? "…" : "Fshi"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState text="Shtoni nxënësin e parë duke klikuar 'Shto nxënës'." />
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Emri i lëndës</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td className="td-name">{s.name}</td>
                      <td className="td-actions">
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteSubject(s.id)}
                          disabled={deletingId === s.id}
                        >
                          <IconTrash />
                          {deletingId === s.id ? "…" : "Fshi"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState text="Shtoni lëndën e parë duke klikuar 'Shto lëndë'." />
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

            <div className="subject-filter">
              <label>Filtro sipas lëndës:</label>
              <select
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
              <EmptyState text="Zgjidhni një lëndë për të parë konceptet e saj." />
            ) : concepts.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Emri i konceptit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {concepts.map((c) => (
                    <tr key={c.id}>
                      <td className="td-name">{c.name}</td>
                      <td className="td-actions">
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteConcept(c.id)}
                          disabled={deletingId === c.id}
                        >
                          <IconTrash />
                          {deletingId === c.id ? "…" : "Fshi"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState text="Kjo lëndë nuk ka koncepte ende." />
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Titulli i testit</th>
                    <th className="hide-mobile">Lënda</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/tests/${t.id}`} className="td-link">{t.title}</Link>
                      </td>
                      <td className="td-meta hide-mobile">
                        {subjects.find((s) => s.id === t.subject_id)?.name ?? "—"}
                      </td>
                      <td className="td-actions">
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteTest(t.id)}
                          disabled={deletingId === t.id}
                        >
                          <IconTrash />
                          {deletingId === t.id ? "…" : "Fshi"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState text="Krijoni testin e parë duke klikuar 'Shto test'." />
            )}
          </>
        )}
      </div>

      {/* ── MODALS ── */}
      {activeModal === "student" && (
        <Modal
          title="Shto nxënës të ri"
          onClose={closeModal}
          onSubmit={handleCreateStudent}
          submitting={submitting}
          error={formError}
          submitLabel="Shto nxënësin"
        >
          <div className="form-group">
            <label className="form-label">Emri i plotë</label>
            <input className="form-input" type="text" placeholder="p.sh. Artan Berisha" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Numri personal</label>
            <input className="form-input" type="text" placeholder="Numri personal i nxënësit" value={personalNumber} onChange={(e) => setPersonalNumber(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Datëlindja <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opcionale)</span></label>
            <input className="form-input" type="date" value={dateBirth} onChange={(e) => setDateBirth(e.target.value)} />
          </div>
        </Modal>
      )}

      {activeModal === "subject" && (
        <Modal
          title="Shto lëndë të re"
          onClose={closeModal}
          onSubmit={handleCreateSubject}
          submitting={submitting}
          error={formError}
          submitLabel="Shto lëndën"
        >
          <div className="form-group">
            <label className="form-label">Emri i lëndës</label>
            <input className="form-input" type="text" placeholder="p.sh. Matematikë" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
          </div>
        </Modal>
      )}

      {activeModal === "concept" && (
        <Modal
          title="Shto koncept të ri"
          onClose={closeModal}
          onSubmit={handleCreateConcept}
          submitting={submitting}
          error={formError}
          submitLabel="Shto konceptin"
        >
          {!selectedSubjectId && (
            <div className="concept-hint">
              Zgjidhni fillimisht një lëndë në skedën "Konceptet" për të lidhur konceptin.
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Lënda</label>
            <select className="form-select" value={selectedSubjectId} onChange={(e) => handleSubjectChange(e.target.value)} required>
              <option value="">— Zgjidhni lëndën —</option>
              {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Emri i konceptit</label>
            <input className="form-input" type="text" placeholder="p.sh. Thyesat" value={conceptName} onChange={(e) => setConceptName(e.target.value)} required />
          </div>
        </Modal>
      )}

      {activeModal === "test" && (
        <Modal
          title="Krijo test të ri"
          onClose={closeModal}
          onSubmit={handleCreateTest}
          submitting={submitting}
          error={formError}
          submitLabel="Krijo testin"
        >
          <div className="form-group">
            <label className="form-label">Lënda</label>
            <select className="form-select" value={selectedTestSubjectId} onChange={(e) => setSelectedTestSubjectId(Number(e.target.value))} required>
              <option value="">— Zgjidhni lëndën —</option>
              {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Titulli i testit</label>
            <input className="form-input" type="text" placeholder="p.sh. Matematikë — Testi 1" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} required />
          </div>
        </Modal>
      )}
    </>
  );
}

export default ClassroomDetails;