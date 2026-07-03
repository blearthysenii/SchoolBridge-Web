import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../services/errors";

import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/toastContext";

import {
  createResult,
  getResultsByStudent,
  deleteResult,
} from "../services/resultService";

import { getStudentAnalytics } from "../services/analyticsService";
import { getQuestionsByStudent } from "../services/questionService";

type Result = {
  id: number;
  student_id: number;
  question_id: number;
  question_text: string;
  concept_id: number;
  concept_name: string;
  subject_id: number;
  subject_name: string;
  is_correct: boolean;
};

type StudentQuestion = {
  id: number;
  question_text: string;
  test_id: number;
  concept_id: number;
  concept_name: string;
  subject_id: number;
  subject_name: string;
};

type ConceptAnalytics = {
  concept_id: number;
  concept_name: string;
  subject_id: number;
  subject_name: string;
  correct: number;
  incorrect: number;
  total: number;
  success_rate: number;
  is_gap: boolean;
};

type StudentAnalytics = {
  student_id: number;
  student_name: string;
  parent_phone: string | null;
  final_grade: number | null;
  total_results: number;
  correct: number;
  incorrect: number;
  success_rate: number;
  concepts: ConceptAnalytics[];
  learning_gaps: ConceptAnalytics[];
};

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
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
function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconWarn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// ── Rate bar ──────────────────────────────────────────────────────────────────
function RateBar({ rate, isGap }: { rate: number; isGap: boolean }) {
  const color = isGap ? "#ef4444" : rate >= 80 ? "#22c55e" : "#f59e0b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 7, background: "rgba(226,232,240,0.78)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${rate}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 36, textAlign: "right" }}>{rate}%</span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.62)",
      border: "1px solid rgba(255,255,255,0.74)",
      borderRadius: 22,
      padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 4,
      boxShadow: "0 16px 38px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.84)",
      backdropFilter: "blur(18px)",
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent ?? "#0f172a", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</div>}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
function StudentResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [results, setResults] = useState<Result[]>([]);
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);

  const [selectedQuestionId, setSelectedQuestionId] = useState<number | "">("");
  const [isCorrect, setIsCorrect] = useState("true");

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Result | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "concepts" | "gaps" | "results">("analytics");

  const loadResults = useCallback(async () => {
    if (!id) return;
    const r = await getResultsByStudent(Number(id));
    setResults(r.data);
  }, [id]);
  const loadQuestions = useCallback(async () => {
    if (!id) return;
    const r = await getQuestionsByStudent(Number(id));
    setQuestions(r.data);
  }, [id]);
  const loadAnalytics = useCallback(async () => {
    if (!id) return;
    const r = await getStudentAnalytics(Number(id));
    setAnalytics(r.data);
  }, [id]);
  const refreshData = useCallback(async () => {
    await loadResults();
    await loadQuestions();
    await loadAnalytics();
  }, [loadAnalytics, loadQuestions, loadResults]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refreshData();
    });
    return () => {
      cancelled = true;
    };
  }, [refreshData]);

  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedQuestionId) { setFormError("Zgjidhni një pyetje."); return; }
    setSubmitting(true); setFormError("");
    try {
      await createResult(Number(id), Number(selectedQuestionId), isCorrect === "true");
      setSelectedQuestionId(""); setIsCorrect("true");
      setModalOpen(false);
      await refreshData();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Dështoi ruajtja e rezultatit."));
    } finally { setSubmitting(false); }
  };

  const handleDeleteResult = async (resultId: number) => {
    setDeletingId(resultId);
    try {
      await deleteResult(resultId);
      await refreshData();
      showToast("success", "Rezultati u fshi me sukses.");
    } catch {
      showToast("error", "Dështoi fshirja e rezultatit.");
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  const tabs = [
    { key: "analytics" as const, label: "Vështrim i përgjithshëm" },
    { key: "concepts" as const, label: "Temat", count: analytics?.concepts.length },
    { key: "gaps" as const, label: "Boshllëqet", count: analytics?.learning_gaps.length, warn: (analytics?.learning_gaps.length ?? 0) > 0 },
    { key: "results" as const, label: "Rezultatet", count: results.length },
  ];

  const rateColor = (rate: number) => rate >= 80 ? "#22c55e" : rate >= 50 ? "#f59e0b" : "#ef4444";
  const studentMeta = [
    `ID: ${id}`,
    analytics?.parent_phone ? `Prindi: ${analytics.parent_phone}` : null,
    analytics?.final_grade !== null && analytics?.final_grade !== undefined ? `Nota finale: ${analytics.final_grade}` : null,
    "Rezultatet dhe analitika",
  ].filter(Boolean).join(" · ");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 30rem),
            radial-gradient(circle at top right, rgba(219,234,254,0.56), transparent 34rem),
            #f3f4f6;
          color: #0f172a;
        }
        a { text-decoration: none; color: inherit; }

        .topbar {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 24px;
          padding: 0 20px; min-height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 16px; z-index: 50;
          width: min(900px, calc(100% - 32px));
          margin: 16px auto 0;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }
        .topbar-left { display: flex; align-items: center; gap: 10px; }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.62); border: 1px solid rgba(226,232,240,0.82); border-radius: 15px;
          padding: 8px 12px; font-size: 13px; font-weight: 800; color: #475569;
          cursor: pointer; transition: background 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
        }
        .back-btn:hover { background: rgba(255,255,255,0.9); border-color: rgba(191,219,254,0.9); transform: translateY(-1px); }
        .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13.5px; }
        .breadcrumb-seg { color: #64748b; font-weight: 700; }
        .breadcrumb-sep { color: #cbd5e1; display: flex; align-items: center; }
        .breadcrumb-current { color: #0f172a; font-weight: 800; }

        .page { max-width: 900px; margin: 0 auto; padding: 24px 28px 36px; }

        .student-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 24px; gap: 12px;
        }
        .student-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(145deg, rgba(37,99,235,0.14), rgba(255,255,255,0.74)); color: #2563eb;
          border: 1px solid rgba(255,255,255,0.78);
          font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .student-name { font-size: 20px; font-weight: 850; color: #0f172a; letter-spacing: 0; }
        .student-sub { font-size: 13px; color: #94a3b8; margin-top: 2px; }

        .stats-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 12px; margin-bottom: 28px;
        }

        .tabs {
          display: flex; border-bottom: 1px solid rgba(226,232,240,0.78);
          margin-bottom: 24px; overflow-x: auto; gap: 6px;
        }
        .tab {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; font-size: 13.5px; font-weight: 800; color: #64748b;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          cursor: pointer; white-space: nowrap; transition: color 0.16s ease, background 0.16s ease;
          background: none; border-top: none; border-left: none; border-right: none;
          border-radius: 14px 14px 0 0;
        }
        .tab:hover { color: #0f172a; background: rgba(255,255,255,0.5); }
        .tab.active { color: #2563eb; border-bottom-color: #2563eb; }
        .tab-badge {
          background: rgba(241,245,249,0.86); color: #64748b;
          font-size: 11px; font-weight: 800;
          padding: 1px 6px; border-radius: 10px; min-width: 20px; text-align: center;
        }
        .tab.active .tab-badge { background: #eff6ff; color: #2563eb; }
        .tab-badge.warn { background: #fef3c7; color: #92400e; }
        .tab.active .tab-badge.warn { background: #fef3c7; color: #92400e; }

        /* SECTION HEADER */
        .section-hdr {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-hdr-title { font-size: 14px; font-weight: 850; color: #0f172a; }
        .section-hdr-sub { font-size: 12.5px; color: #94a3b8; margin-top: 1px; }

        /* TABLE */
        .table-scroll { overflow-x: auto; border-radius: 22px; box-shadow: 0 16px 38px rgba(15,23,42,0.07); }
        .data-table {
          width: 100%; border-collapse: collapse;
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 22px; overflow: hidden;
          backdrop-filter: blur(18px);
        }
        .data-table th {
          text-align: left; font-size: 11.5px; font-weight: 800;
          color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;
          padding: 11px 16px; background: rgba(248,250,252,0.62);
          border-bottom: 1px solid rgba(226,232,240,0.72);
        }
        .data-table td {
          padding: 12px 16px; font-size: 13.5px; color: #334155;
          border-bottom: 1px solid rgba(241,245,249,0.86); vertical-align: middle;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: rgba(255,255,255,0.52); }
        .td-actions { text-align: right; }
        .rate-cell { min-width: 140px; }

        /* CONCEPT CARDS */
        .concept-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }
        .concept-card {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74); border-radius: 20px;
          padding: 16px 18px;
          box-shadow: 0 12px 28px rgba(15,23,42,0.06);
        }
        .concept-card.is-gap { border-color: rgba(254,202,202,0.88); background: rgba(255,245,245,0.78); }
        .concept-card-subject { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .concept-card-name { font-size: 14px; font-weight: 850; color: #0f172a; margin-bottom: 10px; }
        .concept-card-counts { display: flex; gap: 12px; margin-top: 10px; }
        .count-pill {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 5px;
        }
        .count-pill.correct { background: rgba(240,253,244,0.86); color: #16a34a; }
        .count-pill.incorrect { background: rgba(255,245,245,0.86); color: #dc2626; }

        /* GAP CARD */
        .gap-card {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(254,202,202,0.88);
          border-left: 4px solid #ef4444;
          border-radius: 20px; padding: 16px 18px;
          display: flex; align-items: flex-start; gap: 12px;
          box-shadow: 0 12px 28px rgba(15,23,42,0.06);
        }
        .gap-icon {
          width: 32px; height: 32px; border-radius: 7px;
          background: rgba(254,226,226,0.86); color: #ef4444;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .gap-subject { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .gap-name { font-size: 14px; font-weight: 700; color: #0f172a; }
        .gap-meta { font-size: 12px; color: #64748b; margin-top: 6px; }
        .gap-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }

        /* STATUS PILL */
        .status-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 5px;
          font-size: 12px; font-weight: 600;
        }
        .status-pill.correct { background: rgba(240,253,244,0.86); color: #16a34a; }
        .status-pill.incorrect { background: rgba(255,245,245,0.86); color: #dc2626; }

        /* EMPTY */
        .empty-state {
          background: rgba(255,255,255,0.52); border: 1px dashed rgba(148,163,184,0.58);
          border-radius: 22px; padding: 38px 24px;
          text-align: center; color: #94a3b8; font-size: 13.5px;
        }
        .empty-state strong { display: block; font-size: 14px; color: #64748b; margin-bottom: 4px; }
        .empty-gaps {
          background: rgba(240,253,244,0.78); border: 1px solid rgba(187,247,208,0.86);
          border-radius: 20px; padding: 24px;
          text-align: center; color: #16a34a; font-size: 13.5px; font-weight: 800;
        }

        /* BUTTONS */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff;
          border: none; border-radius: 15px;
          padding: 9px 15px; font-size: 13px; font-weight: 800;
          box-shadow: 0 12px 26px rgba(37,99,235,0.22);
          cursor: pointer; transition: background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease; white-space: nowrap;
        }
        .btn-primary:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-1px); }
        .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
        .btn-secondary {
          padding: 9px 16px; border-radius: 15px;
          font-size: 13px; font-weight: 800;
          background: rgba(255,255,255,0.62); color: #475569;
          border: 1px solid rgba(226,232,240,0.82); cursor: pointer; transition: background 0.16s ease, transform 0.16s ease;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.9); transform: translateY(-1px); }
        .btn-delete {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 11px; border-radius: 13px; font-size: 12px; font-weight: 800;
          color: #64748b; background: rgba(255,255,255,0.52); border: 1px solid rgba(226,232,240,0.82);
          cursor: pointer; transition: all 0.16s ease;
        }
        .btn-delete:hover { background: rgba(255,241,242,0.86); color: #e11d48; border-color: #fecdd3; transform: translateY(-1px); }
        .btn-delete:disabled { opacity: 0.4; cursor: not-allowed; }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.34);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; padding: 16px;
          backdrop-filter: blur(10px);
        }
        .modal {
          background: rgba(255,255,255,0.86); border: 1px solid rgba(255,255,255,0.78); border-radius: 24px;
          width: 100%; max-width: 460px;
          box-shadow: 0 28px 76px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.86); padding: 28px;
          backdrop-filter: blur(22px);
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .modal-title { font-size: 16px; font-weight: 850; color: #0f172a; }
        .modal-close {
          background: rgba(248,250,252,0.76); border: 1px solid rgba(226,232,240,0.82);
          cursor: pointer; color: #94a3b8; padding: 6px; border-radius: 13px;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .modal-close:hover { color: #475569; background: rgba(255,255,255,0.92); }
        .modal-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }

        /* FORM */
        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 12.5px; font-weight: 800; color: #475569; margin-bottom: 6px; }
        .form-select {
          width: 100%; padding: 9px 12px;
          border: 1px solid rgba(226,232,240,0.86); border-radius: 15px;
          font-size: 13.5px; color: #0f172a; background: rgba(255,255,255,0.72);
          outline: none; transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        .form-select:focus { border-color: #93c5fd; background: rgba(255,255,255,0.96); box-shadow: 0 0 0 4px rgba(147,197,253,0.22); }
        .form-error {
          font-size: 12px; color: #e11d48; margin-top: 10px;
          background: rgba(255,241,242,0.8);
          border: 1px solid rgba(254,205,211,0.9);
          border-radius: 15px; padding: 9px 10px;
        }

        /* ANSWER TOGGLE */
        .answer-toggle { display: flex; gap: 8px; }
        .answer-opt {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; border-radius: 15px; font-size: 13px; font-weight: 800;
          cursor: pointer; border: 2px solid rgba(226,232,240,0.86); transition: all 0.16s ease;
          color: #64748b; background: rgba(248,250,252,0.72);
        }
        .answer-opt:hover { transform: translateY(-1px); background: rgba(255,255,255,0.86); }
        .answer-opt.selected-correct { border-color: #22c55e; background: rgba(240,253,244,0.86); color: #16a34a; }
        .answer-opt.selected-incorrect { border-color: #ef4444; background: rgba(255,245,245,0.86); color: #dc2626; }

        @media (max-width: 860px) {
          .page { padding: 20px; max-width: 100%; }
          .topbar { width: min(100% - 24px, 900px); }
          .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .student-header { margin-bottom: 20px; }
        }

        @media (max-width: 640px) {
          .page { padding: 14px; overflow: hidden; }
          .topbar {
            padding: 10px 12px; width: min(100% - 20px, 900px); top: 10px; min-height: 58px;
            gap: 8px;
          }
          .topbar-left { min-width: 0; }
          .breadcrumb { display: none; }
          .back-btn { padding: 8px 11px; font-size: 12.5px; }
          .topbar .btn-primary { padding: 9px 12px; font-size: 12.5px; gap: 5px; }
          .student-header > div { min-width: 0; }
          .student-avatar { width: 38px; height: 38px; font-size: 14px; }
          .student-name { font-size: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .student-sub { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 24px; }
          .tabs {
            display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px; border-bottom: none; overflow: visible; margin-bottom: 22px;
          }
          .tab {
            justify-content: center; min-width: 0; white-space: normal; text-align: center;
            padding: 10px 8px; font-size: 12.5px; border: 1px solid rgba(226,232,240,0.78);
            border-radius: 16px; margin-bottom: 0; background: rgba(255,255,255,0.48);
          }
          .tab.active {
            background: rgba(239,246,255,0.86); border-color: rgba(191,219,254,0.95);
            box-shadow: 0 10px 22px rgba(37,99,235,0.10);
          }
          .tab-badge { min-width: 18px; padding: 1px 5px; }
          .section-hdr { align-items: flex-start; gap: 4px; }
          .section-hdr-title { font-size: 14px; }
          .section-hdr-sub { font-size: 12px; }
          .table-scroll { overflow-x: visible; max-width: 100%; border-radius: 18px; }
          .data-table { table-layout: fixed; min-width: 0; border-radius: 18px; }
          .data-table th, .data-table td { padding: 10px 9px; font-size: 12.5px; }
          .data-table th { font-size: 10.5px; letter-spacing: 0.03em; }
          .analytics-table th:first-child,
          .analytics-table td:first-child { width: 58%; }
          .analytics-table .rate-col,
          .analytics-table .rate-cell { width: 42%; min-width: 0 !important; }
          .analytics-table .student-status-col { display: none; }
          .results-table th:first-child,
          .results-table td:first-child { width: 48%; }
          .results-table th:nth-child(3),
          .results-table td:nth-child(3) { width: 30%; }
          .results-table th:nth-child(4),
          .results-table td:nth-child(4) { width: 22%; }
          .status-pill { gap: 3px; padding: 3px 7px; font-size: 11px; }
          .status-pill svg { width: 12px; height: 12px; }
          .btn-delete { padding: 6px 8px; font-size: 11.5px; gap: 3px; }
          .btn-delete svg { width: 12px; height: 12px; }
          .concept-card-counts { flex-wrap: wrap; gap: 8px; }
          .concept-grid { grid-template-columns: 1fr; }
          .hide-mobile { display: none; }
          .modal { padding: 22px; max-width: min(100%, 460px); }
          .modal-actions { flex-direction: column-reverse; }
          .modal-actions button { width: 100%; justify-content: center; }
        }

        @media (max-width: 380px) {
          .topbar { flex-wrap: wrap; }
          .topbar .btn-primary { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* TOP BAR */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <IconBack /> Kthehu
          </button>
          <div className="breadcrumb">
            <span className="breadcrumb-seg">Nxënësit</span>
            <span className="breadcrumb-sep"><IconChevron /></span>
            <span className="breadcrumb-current">
              {analytics ? analytics.student_name : `ID: ${id}`}
            </span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => { setFormError(""); setModalOpen(true); }}>
          <IconPlus /> Regjistro përgjigje
        </button>
      </header>

      <div className="page">
        {/* STUDENT HEADER */}
        <div className="student-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="student-avatar">
              {analytics?.student_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "—"}
            </div>
            <div>
              <div className="student-name">{analytics?.student_name ?? `Nxënësi #${id}`}</div>
              <div className="student-sub">{studentMeta}</div>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="stats-row">
          <StatCard label="Gjithsej" value={analytics?.total_results ?? "—"} sub="përgjigje" />
          <StatCard label="Korrekte" value={analytics?.correct ?? "—"} accent="#16a34a" />
          <StatCard label="Gabim" value={analytics?.incorrect ?? "—"} accent="#dc2626" />
          <StatCard
            label="Sukses"
            value={analytics ? `${analytics.success_rate}%` : "—"}
            accent={analytics ? rateColor(analytics.success_rate) : undefined}
          />
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
              {t.count !== undefined && (
                <span className={`tab-badge${t.warn ? " warn" : ""}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <>
            <div className="section-hdr">
              <div>
                <div className="section-hdr-title">Vështrim i përgjithshëm</div>
                <div className="section-hdr-sub">Performanca e nxënësit sipas temave</div>
              </div>
            </div>
            {analytics && analytics.concepts.length > 0 ? (
              <div className="table-scroll">
              <table className="data-table analytics-table">
                <thead>
                  <tr>
                    <th>Lënda / Tema</th>
                    <th className="rate-col">Shkalla e suksesit</th>
                    <th className="hide-mobile">Korrekte</th>
                    <th className="hide-mobile">Gabim</th>
                    <th className="student-status-col">Statusi</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.concepts.map((c) => (
                    <tr key={c.concept_id}>
                      <td>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{c.subject_name}</div>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{c.concept_name}</div>
                      </td>
                      <td className="rate-cell">
                        <RateBar rate={c.success_rate} isGap={c.is_gap} />
                      </td>
                      <td className="hide-mobile" style={{ color: "#16a34a", fontWeight: 600 }}>{c.correct}</td>
                      <td className="hide-mobile" style={{ color: "#dc2626", fontWeight: 600 }}>{c.incorrect}</td>
                      <td className="student-status-col">
                        {c.is_gap ? (
                          <span className="status-pill incorrect"><IconWarn /> Mangësi</span>
                        ) : (
                          <span className="status-pill correct"><IconCheck /> Mirë</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <div className="empty-state">
                <strong>Nuk ka të dhëna ende</strong>
                Regjistroni përgjigjet e nxënësit për të parë analitikën.
              </div>
            )}
          </>
        )}

        {/* ── CONCEPTS TAB ── */}
        {activeTab === "concepts" && (
          <>
            <div className="section-hdr">
              <div>
                <div className="section-hdr-title">Performanca sipas temave</div>
                <div className="section-hdr-sub">{analytics?.concepts.length ?? 0} tema të vlerësuara</div>
              </div>
            </div>
            {analytics && analytics.concepts.length > 0 ? (
              <div className="concept-grid">
                {analytics.concepts.map((c) => (
                  <div key={c.concept_id} className={`concept-card${c.is_gap ? " is-gap" : ""}`}>
                    <div className="concept-card-subject">{c.subject_name}</div>
                    <div className="concept-card-name">{c.concept_name}</div>
                    <RateBar rate={c.success_rate} isGap={c.is_gap} />
                    <div className="concept-card-counts">
                      <span className="count-pill correct"><IconCheck />{c.correct} korrekte</span>
                      <span className="count-pill incorrect"><IconX />{c.incorrect} gabim</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <strong>Asnjë temë e vlerësuar</strong>
                Regjistroni përgjigje për të parë performancën sipas temave.
              </div>
            )}
          </>
        )}

        {/* ── GAPS TAB ── */}
        {activeTab === "gaps" && (
          <>
            <div className="section-hdr">
              <div>
                <div className="section-hdr-title">Boshllëqet në mësim</div>
                <div className="section-hdr-sub">Tema ku nxënësi ka nevojë për mbështetje</div>
              </div>
            </div>
            {analytics && analytics.learning_gaps.length > 0 ? (
              <div className="gap-grid">
                {analytics.learning_gaps.map((gap) => (
                  <div key={gap.concept_id} className="gap-card">
                    <div className="gap-icon"><IconWarn /></div>
                    <div style={{ flex: 1 }}>
                      <div className="gap-subject">{gap.subject_name}</div>
                      <div className="gap-name">{gap.concept_name}</div>
                      <div style={{ marginTop: 8 }}>
                        <RateBar rate={gap.success_rate} isGap={true} />
                      </div>
                      <div className="gap-meta">
                        {gap.correct} korrekte · {gap.incorrect} gabim · {gap.total} gjithsej
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-gaps">
                Asnjë boshllëk i zbuluar — nxënësi po performon mirë në të gjitha temat.
              </div>
            )}
          </>
        )}

        {/* ── RESULTS TAB ── */}
        {activeTab === "results" && (
          <>
            <div className="section-hdr">
              <div>
                <div className="section-hdr-title">Të gjitha rezultatet</div>
                <div className="section-hdr-sub">{results.length} përgjigje të regjistruara</div>
              </div>
            </div>
            {results.length > 0 ? (
              <div className="table-scroll">
              <table className="data-table results-table">
                <thead>
                  <tr>
                    <th>Pyetja</th>
                    <th className="hide-mobile">Lënda / Tema</th>
                    <th>Statusi</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td style={{ maxWidth: 300 }}>
                        <div style={{ fontWeight: 500, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.question_text}
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{r.subject_name}</div>
                        <div style={{ fontSize: 13, color: "#334155" }}>{r.concept_name}</div>
                      </td>
                      <td>
                        {r.is_correct ? (
                          <span className="status-pill correct"><IconCheck /> Korrekte</span>
                        ) : (
                          <span className="status-pill incorrect"><IconX /> Gabim</span>
                        )}
                      </td>
                      <td className="td-actions">
                        <button
                          className="btn-delete"
                          onClick={() => setPendingDelete(r)}
                          disabled={deletingId === r.id}
                        >
                          <IconTrash />
                          {deletingId === r.id ? "…" : "Fshi"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <div className="empty-state">
                <strong>Asnjë rezultat ende</strong>
                Regjistroni përgjigjen e parë duke klikuar "Regjistro përgjigje".
              </div>
            )}
          </>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Fshi rezultatin"
          message={`Të fshihet rezultati për pyetjen "${pendingDelete.question_text}"? Ky veprim nuk mund të kthehet.`}
          confirmLabel="Fshi"
          variant="danger"
          submitting={deletingId === pendingDelete.id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => handleDeleteResult(pendingDelete.id)}
        />
      )}

      {/* ── MODAL ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Regjistro përgjigje</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}><IconClose /></button>
            </div>
            <form onSubmit={handleCreateResult}>
              <div className="form-group">
                <label className="form-label">Pyetja</label>
                <select
                  className="form-select"
                  value={selectedQuestionId}
                  onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
                  required
                >
                  <option value="">— Zgjidhni pyetjen —</option>
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.subject_name} → {q.concept_name} → {q.question_text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Përgjigja</label>
                <div className="answer-toggle">
                  <div
                    className={`answer-opt${isCorrect === "true" ? " selected-correct" : ""}`}
                    onClick={() => setIsCorrect("true")}
                  >
                    <IconCheck /> Korrekte
                  </div>
                  <div
                    className={`answer-opt${isCorrect === "false" ? " selected-incorrect" : ""}`}
                    onClick={() => setIsCorrect("false")}
                  >
                    <IconX /> Gabim
                  </div>
                </div>
              </div>

              {formError && <div className="form-error">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Anulo</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Duke ruajtur…" : "Ruaj rezultatin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentResults;
