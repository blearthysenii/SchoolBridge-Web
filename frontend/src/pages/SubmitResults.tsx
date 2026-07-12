import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../services/errors";

import { getClassrooms } from "../services/classroomService";
import { getStudentsByClassroom } from "../services/studentService";
import { getTestsByClassroom } from "../services/testService";
import { getTestResultState, submitBatchResults, updateTestResults } from "../services/resultService";

type Classroom = { id: number; name: string; grade: number };
type Student = { id: number; full_name: string };
type Test = { id: number; title: string };
type Question = {
  question_id: number;
  question_text: string;
  question_type: string;
  current_is_correct: boolean | null;
  current_points: number | null;
  max_points: number;
  graded_by: "system" | "ai" | "teacher" | "manual" | null;
  ai_feedback_for_teacher: string | null;
  teacher_feedback_override: string | null;
  needs_teacher_review: boolean;
  source_type: "online" | "manual" | null;
  answer_id: number | null;
  result_id: number | null;
};
type BatchResultResponse = {
  submitted: number;
  correct: number;
  incorrect: number;
  score: number;
  has_existing_results?: boolean;
  questions?: Question[];
};

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}
function IconSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.4" />
      <path d="M12 2v4" />
    </svg>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Klasa & Nxënësi" },
    { n: 2, label: "Testi & Pyetjet" },
    { n: 3, label: "Rezultati" },
  ];
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <div key={s.n} className="step-wrap">
          <div className={`step-node ${current === s.n ? "active" : current > s.n ? "done" : "idle"}`}>
            {current > s.n ? <IconCheck /> : s.n}
          </div>
          <div className={`step-label ${current === s.n ? "active" : ""}`}>{s.label}</div>
          {i < steps.length - 1 && <div className={`step-line ${current > s.n ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle
        cx="55" cy="55" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="55" y="51" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>{score}%</text>
      <text x="55" y="67" textAnchor="middle" fontSize="10" fill="#94a3b8">pikë</text>
    </svg>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
function SubmitResults() {
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [selectedClassroomId, setSelectedClassroomId] = useState<number | "">("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [selectedTestId, setSelectedTestId] = useState<number | "">("");
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [hasExistingResults, setHasExistingResults] = useState(false);

  const [result, setResult] = useState<BatchResultResponse | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingClassroom, setLoadingClassroom] = useState(false);

  useEffect(() => {
    getClassrooms().then((res) => setClassrooms(res.data));
  }, []);

  const applyResultState = (data: BatchResultResponse) => {
    if (data.questions) {
      setQuestions(data.questions);
      const nextAnswers: Record<number, boolean> = {};
      data.questions.forEach((question) => {
        if (typeof question.current_is_correct === "boolean") {
          nextAnswers[question.question_id] = question.current_is_correct;
        }
      });
      setAnswers(nextAnswers);
    }
    setHasExistingResults(Boolean(data.has_existing_results));
  };

  const loadResultState = async (studentId: number, testId: number) => {
    setLoadingQuestions(true);
    try {
      const res = await getTestResultState(studentId, testId);
      applyResultState(res.data);
    } catch {
      setError("Dështoi ngarkimi i rezultateve ekzistuese. Provoni përsëri.");
      setQuestions([]);
      setAnswers({});
      setHasExistingResults(false);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleClassroomChange = async (value: string) => {
    const classroomId = value ? Number(value) : "";
    setSelectedClassroomId(classroomId);
    setSelectedStudentId("");
    setSelectedTestId("");
    setQuestions([]);
    setAnswers({});
    setHasExistingResults(false);
    setResult(null);
    setError("");
    if (!classroomId) { setStudents([]); setTests([]); return; }
    setLoadingClassroom(true);
    try {
      const [studentsRes, testsRes] = await Promise.all([
        getStudentsByClassroom(String(classroomId)),
        getTestsByClassroom(classroomId),
      ]);
      setStudents(studentsRes.data);
      setTests(testsRes.data);
    } catch {
      setError("Dështoi ngarkimi i të dhënave. Provoni përsëri.");
    } finally { setLoadingClassroom(false); }
  };

  const handleTestChange = async (value: string) => {
    const testId = value ? Number(value) : "";
    setSelectedTestId(testId);
    setAnswers({});
    setHasExistingResults(false);
    setResult(null);
    setError("");
    if (!testId) { setQuestions([]); return; }
    if (!selectedStudentId) { setQuestions([]); return; }
    await loadResultState(Number(selectedStudentId), testId);
  };

  const handleAnswer = (questionId: number, isCorrect: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: isCorrect }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedStudentId || !selectedTestId) { setError("Zgjidhni nxënësin dhe testin."); return; }
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        question_id: q.question_id,
        is_correct: answers[q.question_id] === true,
      }));
      const res = hasExistingResults
        ? await updateTestResults(selectedStudentId, selectedTestId, payload)
        : await submitBatchResults(selectedStudentId, selectedTestId, payload);
      applyResultState(res.data);
      setResult(res.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Dështoi dërgimi i rezultateve."));
    } finally { setSubmitting(false); }
  };

  const handleSubmitAnother = () => {
    setResult(null);
    setAnswers({});
    setSelectedStudentId("");
    setSelectedTestId("");
    setQuestions([]);
    setHasExistingResults(false);
    setError("");
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const currentStep: 1 | 2 | 3 = result ? 3 : questions.length > 0 ? 2 : 1;

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedTest = tests.find((t) => t.id === selectedTestId);

  const sourceLabel = (question: Question) => {
    if (question.graded_by === "system") return "Sistemi";
    if (question.graded_by === "ai") return "AI";
    if (question.graded_by === "teacher") return "Mësimdhënësi";
    if (question.graded_by === "manual") return "Manual";
    return "Pa rezultat";
  };

  const sourceClass = (question: Question) => {
    if (question.graded_by === "system") return " system";
    if (question.graded_by === "ai") return " ai";
    if (question.graded_by === "teacher") return " teacher";
    if (question.graded_by === "manual") return " manual";
    return " empty";
  };

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

        .topbar {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 24px;
          padding: 0 20px; min-height: 68px;
          display: flex; align-items: center; gap: 12px;
          position: sticky; top: 16px; z-index: 50;
          width: min(720px, calc(100% - 32px));
          margin: 16px auto 0;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.62); border: 1px solid rgba(226,232,240,0.82); border-radius: 15px;
          padding: 8px 12px; font-size: 13px; font-weight: 800; color: #475569;
          cursor: pointer; transition: background 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
        }
        .back-btn:hover { background: rgba(255,255,255,0.9); border-color: rgba(191,219,254,0.9); transform: translateY(-1px); }
        .topbar-title { font-size: 14.5px; font-weight: 800; color: #0f172a; }

        .page { max-width: 720px; margin: 0 auto; padding: 28px 28px 36px; }

        /* STEPS */
        .steps {
          display: flex; align-items: flex-start;
          gap: 0; margin-bottom: 36px; position: relative;
        }
        .step-wrap {
          display: flex; flex-direction: column; align-items: center;
          flex: 1; position: relative;
        }
        .step-node {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; z-index: 1;
          transition: all 0.2s ease;
        }
        .step-node.idle { background: rgba(255,255,255,0.62); color: #94a3b8; border: 2px solid rgba(226,232,240,0.82); }
        .step-node.active { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; border: 2px solid #2563eb; box-shadow: 0 10px 22px rgba(37,99,235,0.22); }
        .step-node.done { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: 2px solid #22c55e; }
        .step-label { font-size: 11.5px; font-weight: 800; color: #94a3b8; margin-top: 6px; text-align: center; white-space: nowrap; }
        .step-label.active { color: #2563eb; }
        .step-line {
          position: absolute; top: 16px; left: calc(50% + 16px);
          right: calc(-50% + 16px); height: 2px; background: rgba(226,232,240,0.86);
        }
        .step-line.done { background: #22c55e; }

        /* CARD */
        .card {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 24px; padding: 24px; margin-bottom: 16px;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }
        .card-title { font-size: 13.5px; font-weight: 850; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .card-title-dot { width: 6px; height: 6px; border-radius: 50%; background: #2563eb; flex-shrink: 0; }

        /* FORM SELECTS */
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { margin-bottom: 0; }
        .form-label { display: block; font-size: 12px; font-weight: 800; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
        .form-select {
          width: 100%; padding: 9px 32px 9px 12px;
          border: 1px solid rgba(226,232,240,0.86); border-radius: 15px;
          font-size: 13.5px; color: #0f172a; background: rgba(255,255,255,0.72);
          outline: none; transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
        }
        .form-select:focus { border-color: #93c5fd; background: rgba(255,255,255,0.96); box-shadow: 0 0 0 4px rgba(147,197,253,0.22); }
        .form-select:disabled { opacity: 0.5; background-color: #f8fafc; cursor: not-allowed; }

        /* CONTEXT STRIP */
        .context-strip {
          display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;
        }
        .context-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(239,246,255,0.78); border: 1px solid rgba(191,219,254,0.9);
          border-radius: 999px; padding: 5px 11px;
          font-size: 12px; font-weight: 800; color: #2563eb;
        }

        /* QUESTION LIST */
        .question-list { display: flex; flex-direction: column; gap: 10px; }
        .question-item {
          background: rgba(255,255,255,0.58); border: 1px solid rgba(255,255,255,0.72); border-radius: 20px;
          padding: 14px 16px; display: flex; align-items: flex-start; gap: 14px;
          transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
        }
        .question-item:hover { background: rgba(255,255,255,0.76); transform: translateY(-1px); box-shadow: 0 12px 28px rgba(15,23,42,0.06); }
        .question-item.answered-correct { border-color: rgba(187,247,208,0.86); background: rgba(240,253,244,0.78); }
        .question-item.answered-incorrect { border-color: rgba(254,202,202,0.88); background: rgba(255,245,245,0.78); }
        .question-num {
          width: 26px; height: 26px; border-radius: 6px;
          background: rgba(241,245,249,0.86); color: #64748b;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .question-content { flex: 1; min-width: 0; }
        .question-text { font-size: 13.5px; color: #0f172a; line-height: 1.5; padding-top: 2px; }
        .question-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .source-badge, .points-badge, .review-badge {
          display: inline-flex; align-items: center;
          border-radius: 999px; padding: 3px 8px;
          font-size: 11px; font-weight: 800;
          border: 1px solid rgba(226,232,240,0.86);
          background: rgba(248,250,252,0.78); color: #64748b;
        }
        .source-badge.system { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
        .source-badge.ai { background: #f5f3ff; border-color: #ddd6fe; color: #6d28d9; }
        .source-badge.teacher { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
        .source-badge.manual { background: #f8fafc; border-color: #cbd5e1; color: #475569; }
        .source-badge.empty { background: rgba(248,250,252,0.55); color: #94a3b8; }
        .points-badge { color: #0f172a; }
        .review-badge { background: #fef3c7; border-color: #fde68a; color: #92400e; }
        .answer-btns { display: flex; gap: 6px; flex-shrink: 0; }
        .ans-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 13px; font-size: 12px; font-weight: 800;
          cursor: pointer; border: 1.5px solid rgba(226,232,240,0.86);
          background: rgba(248,250,252,0.72); color: #64748b;
          transition: all 0.16s ease;
        }
        .ans-btn:hover { border-color: #cbd5e1; }
        .ans-btn.sel-correct { background: rgba(240,253,244,0.86); border-color: #22c55e; color: #16a34a; }
        .ans-btn.sel-incorrect { background: rgba(255,245,245,0.86); border-color: #ef4444; color: #dc2626; }

        /* PROGRESS BAR */
        .progress-wrap { margin: 20px 0 0; }
        .progress-meta { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; }
        .progress-track { height: 7px; background: rgba(226,232,240,0.78); border-radius: 99px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(135deg, #60a5fa, #2563eb); border-radius: 99px; transition: width 0.3s ease; }

        /* SUBMIT BAR */
        .submit-bar {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 22px; padding: 16px 20px; gap: 12px; margin-top: 16px;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }
        .submit-bar-info { font-size: 13px; color: #64748b; }
        .submit-bar-info strong { color: #0f172a; }

        /* BUTTONS */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; border: none; border-radius: 15px;
          padding: 10px 18px; font-size: 13.5px; font-weight: 800;
          box-shadow: 0 12px 26px rgba(37,99,235,0.22);
          cursor: pointer; transition: background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease; white-space: nowrap;
        }
        .btn-primary:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-1px); }
        .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 15px;
          font-size: 13.5px; font-weight: 800;
          background: rgba(255,255,255,0.62); color: #475569; border: 1px solid rgba(226,232,240,0.82);
          cursor: pointer; transition: background 0.16s ease, transform 0.16s ease;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.9); transform: translateY(-1px); }

        /* ERROR */
        .form-error {
          background: rgba(255,245,245,0.82); border: 1px solid rgba(254,202,202,0.9);
          border-radius: 16px; padding: 10px 14px;
          font-size: 13px; color: #dc2626; margin-top: 16px;
        }

        /* LOADING */
        .loading-row { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 13px; padding: 12px 0; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* RESULT CARD */
        .result-card {
          background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
          border-radius: 24px; padding: 38px 28px;
          text-align: center;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }
        .result-icon-wrap {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(145deg, rgba(37,99,235,0.12), rgba(255,255,255,0.72)); color: #2563eb;
          border: 1px solid rgba(255,255,255,0.78);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .result-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .result-sub { font-size: 13.5px; color: #64748b; margin-bottom: 28px; }
        .result-stats {
          display: flex; justify-content: center; gap: 28px;
          margin: 24px 0 28px;
        }
        .result-stat-val { font-size: 22px; font-weight: 700; }
        .result-stat-label { font-size: 11.5px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }
        .result-actions { display: flex; gap: 10px; justify-content: center; }

        /* EMPTY */
        .empty-note { background: rgba(255,255,255,0.52); border: 1px dashed rgba(148,163,184,0.58); border-radius: 18px; padding: 18px; text-align: center; color: #94a3b8; font-size: 13px; }

        @media (max-width: 600px) {
          .page { padding: 20px 16px; }
          .topbar { padding: 0 16px; width: min(100% - 20px, 720px); top: 10px; min-height: 62px; }
          .field-row { grid-template-columns: 1fr; }
          .question-item { flex-wrap: wrap; }
          .answer-btns { width: 100%; }
          .ans-btn { flex: 1; justify-content: center; }
          .steps { gap: 0; }
          .step-label { font-size: 10px; }
          .submit-bar { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      {/* TOP BAR */}
      <header className="topbar">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <IconBack /> Kthehu
        </button>
        <div className="topbar-title">Dorëzo rezultate testimi</div>
      </header>

      <div className="page">
        <Steps current={currentStep} />

        {result ? (
          /* ── SUCCESS STATE ── */
          <div className="result-card">
            <div className="result-icon-wrap"><IconTrophy /></div>
            <div className="result-title">
              {result.has_existing_results ? "Ndryshimet u ruajtën!" : "Rezultatet u ruajtën!"}
            </div>
            <div className="result-sub">
              {selectedStudent?.full_name && <><strong>{selectedStudent.full_name}</strong> · </>}
              {selectedTest?.title}
            </div>

            <ScoreRing score={result.score} />

            <div className="result-stats">
              <div>
                <div className="result-stat-val" style={{ color: "#22c55e" }}>{result.correct}</div>
                <div className="result-stat-label">Korrekte</div>
              </div>
              <div>
                <div className="result-stat-val" style={{ color: "#ef4444" }}>{result.incorrect}</div>
                <div className="result-stat-label">Gabim</div>
              </div>
              <div>
                <div className="result-stat-val" style={{ color: "#64748b" }}>{result.submitted}</div>
                <div className="result-stat-label">Gjithsej</div>
              </div>
            </div>

            <div className="result-actions">
              <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                <IconBack /> Kthehu në panel
              </button>
              <button className="btn-primary" onClick={handleSubmitAnother}>
                <IconRefresh /> Nxënës tjetër
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* ── STEP 1: CLASSROOM + STUDENT ── */}
            <div className="card">
              <div className="card-title">
                <div className="card-title-dot" />
                Zgjidhni klasën dhe nxënësin
              </div>

              <div className="field-row">
                <div className="form-group">
                  <label className="form-label">Klasa</label>
                  <select
                    className="form-select"
                    value={selectedClassroomId}
                    onChange={(e) => handleClassroomChange(e.target.value)}
                    required
                  >
                    <option value="">— Zgjidhni klasën —</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} · Viti {c.grade}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nxënësi</label>
                  <select
                    className="form-select"
                    value={selectedStudentId}
                    onChange={async (e) => {
                      const nextStudentId = e.target.value ? Number(e.target.value) : "";
                      setSelectedStudentId(nextStudentId);
                      setResult(null);
                      setError("");
                      setAnswers({});
                      setHasExistingResults(false);
                      if (nextStudentId && selectedTestId) {
                        await loadResultState(Number(nextStudentId), Number(selectedTestId));
                      } else {
                        setQuestions([]);
                      }
                    }}
                    disabled={!selectedClassroomId || loadingClassroom}
                    required
                  >
                    <option value="">— Zgjidhni nxënësin —</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingClassroom && (
                <div className="loading-row">
                  <span className="spin"><IconSpinner /></span>
                  Duke ngarkuar nxënësit dhe testet…
                </div>
              )}
            </div>

            {/* ── STEP 2: TEST SELECTION ── */}
            {selectedClassroomId && !loadingClassroom && (
              <div className="card">
                <div className="card-title">
                  <div className="card-title-dot" />
                  Zgjidhni testin
                </div>

                <div className="form-group">
                  <label className="form-label">Testi</label>
                  {tests.length === 0 ? (
                    <div className="empty-note">Kjo klasë nuk ka teste të disponueshme.</div>
                  ) : (
                    <select
                      className="form-select"
                      value={selectedTestId}
                      onChange={(e) => handleTestChange(e.target.value)}
                      required
                    >
                      <option value="">— Zgjidhni testin —</option>
                      {tests.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                {loadingQuestions && (
                  <div className="loading-row">
                    <span className="spin"><IconSpinner /></span>
                    Duke ngarkuar pyetjet…
                  </div>
                )}

                {selectedTestId && !selectedStudentId && !loadingQuestions && (
                  <div className="empty-note" style={{ marginTop: 12 }}>
                    Zgjidhni nxënësin për të kontrolluar rezultatet ekzistuese.
                  </div>
                )}

                {selectedTestId && selectedStudentId && !loadingQuestions && questions.length === 0 && (
                  <div className="empty-note" style={{ marginTop: 12 }}>
                    Ky test nuk ka pyetje ende.
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: QUESTIONS ── */}
            {questions.length > 0 && (
              <>
                <div className="card">
                  <div className="card-title">
                    <div className="card-title-dot" />
                    Shënoni përgjigjet · {questions.length} pyetje

                    {/* context pills */}
                    <div className="context-strip" style={{ marginLeft: "auto", marginBottom: 0 }}>
                      {selectedStudent && (
                        <span className="context-pill">{selectedStudent.full_name}</span>
                      )}
                      {selectedTest && (
                        <span className="context-pill">{selectedTest.title}</span>
                      )}
                    </div>
                  </div>

                  <div className="question-list">
                    {questions.map((q, i) => {
                      const ans = answers[q.question_id];
                      const cls = ans === undefined ? "" : ans ? " answered-correct" : " answered-incorrect";
                      return (
                        <div key={q.question_id} className={`question-item${cls}`}>
                          <div className="question-num">{i + 1}</div>
                          <div className="question-content">
                            <div className="question-text">{q.question_text}</div>
                            <div className="question-meta">
                              <span className={`source-badge${sourceClass(q)}`}>{sourceLabel(q)}</span>
                              {q.current_points !== null && (
                                <span className="points-badge">{q.current_points}/{q.max_points} pikë</span>
                              )}
                              {q.needs_teacher_review && (
                                <span className="review-badge">Kërkon rishikim</span>
                              )}
                            </div>
                          </div>
                          <div className="answer-btns">
                            <button
                              type="button"
                              className={`ans-btn${ans === true ? " sel-correct" : ""}`}
                              onClick={() => handleAnswer(q.question_id, true)}
                            >
                              <IconCheck /> Korrekte
                            </button>
                            <button
                              type="button"
                              className={`ans-btn${ans === false ? " sel-incorrect" : ""}`}
                              onClick={() => handleAnswer(q.question_id, false)}
                            >
                              <IconX /> Gabim
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* progress */}
                  <div className="progress-wrap">
                    <div className="progress-meta">
                      <span>Të shënuara</span>
                      <span>{answeredCount} / {questions.length}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="submit-bar">
                  <div className="submit-bar-info">
                    {allAnswered
                      ? hasExistingResults
                        ? <><strong>Rezultatet ekzistuese</strong> do të përditësohen pa krijuar dublikatë.</>
                        : <><strong>Të gjitha pyetjet</strong> janë shënuar — gati për dërgim.</>
                      : <><strong>{questions.length - answeredCount}</strong> pyetje mbeten pa u shënuar.</>
                    }
                  </div>
                  <button type="submit" className="btn-primary" disabled={!allAnswered || submitting}>
                    {submitting
                      ? <><span className="spin"><IconSpinner /></span> Duke dërguar…</>
                      : <><IconSend /> {hasExistingResults ? "Ruaj ndryshimet" : "Dorëzo rezultatet"}</>
                    }
                  </button>
                </div>
              </>
            )}

            {error && questions.length === 0 && (
              <div className="form-error">{error}</div>
            )}
          </form>
        )}
      </div>
    </>
  );
}

export default SubmitResults;
