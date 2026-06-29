import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/ToastProvider";

import {
  getQuestionsByTest,
  deleteQuestion,
} from "../services/questionService";

import { getTestById } from "../services/testService";
import { getConceptsBySubject } from "../services/conceptService";

type QuestionType = "multiple_choice" | "short_answer" | "true_false" | "essay";
type LayoutPosition = "full" | "left" | "right";
type TestStatus = "draft" | "published" | "archived";

type QuestionOption = {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
};

type Question = {
  id: number;
  question_text: string;
  test_id: number;
  concept_id: number;
  question_type?: QuestionType;
  layout_position?: LayoutPosition;
  points?: number;
  options?: QuestionOption[];
};

type Test = {
  id: number;
  title: string;
  status?: TestStatus;
  classroom_id: number;
  subject_id: number;
};

type Concept = {
  id: number;
  name: string;
  subject_id: number;
};

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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

function IconBarChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconQuestion() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function IconPreview() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);

  const [questionText, setQuestionText] = useState("");
  const [selectedConceptId, setSelectedConceptId] = useState<number | "">("");
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [layoutPosition, setLayoutPosition] = useState<LayoutPosition>("full");
  const [points, setPoints] = useState(1);

  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");

  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [pendingDeleteQuestionId, setPendingDeleteQuestionId] = useState<number | null>(null);

  const resetForm = () => {
    setQuestionText("");
    setSelectedConceptId("");
    setQuestionType("multiple_choice");
    setLayoutPosition("full");
    setPoints(1);
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setEditingQuestionId(null);
    setFormError("");
  };

  const loadTest = async () => {
    if (!id) return;

    const response = await getTestById(Number(id));
    setTest(response.data);

    const conceptsResponse = await getConceptsBySubject(response.data.subject_id);
    setConcepts(conceptsResponse.data);
  };

  const loadQuestions = async () => {
    if (!id) return;

    const response = await getQuestionsByTest(Number(id));
    setQuestions(response.data);
  };

  const getConceptName = (conceptId: number) => {
    return concepts.find((c) => c.id === conceptId)?.name ?? `Koncepti #${conceptId}`;
  };

  const getQuestionTypeLabel = (type?: QuestionType) => {
    if (type === "short_answer") return "Përgjigje e shkurtër";
    if (type === "true_false") return "E vërtetë / E gabuar";
    if (type === "essay") return "Ese";
    return "Me opsione";
  };

  const getStatusLabel = (status?: TestStatus) => {
    if (status === "published") return "Publikuar";
    if (status === "archived") return "Arkivuar";
    return "Skicë";
  };

  const orderedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => a.id - b.id);
  }, [questions]);

  useEffect(() => {
    loadTest();
    loadQuestions();
  }, [id]);

  useEffect(() => {
    if (!modalOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        resetForm();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const buildOptionsPayload = () => {
    if (questionType === "short_answer" || questionType === "essay") {
      return [];
    }

    if (questionType === "true_false") {
      return [
        {
          option_text: "E vërtetë",
          is_correct: correctOption === "A",
        },
        {
          option_text: "E gabuar",
          is_correct: correctOption === "B",
        },
      ];
    }

    return [
      {
        option_text: optionA.trim(),
        is_correct: correctOption === "A",
      },
      {
        option_text: optionB.trim(),
        is_correct: correctOption === "B",
      },
      {
        option_text: optionC.trim(),
        is_correct: correctOption === "C",
      },
      {
        option_text: optionD.trim(),
        is_correct: correctOption === "D",
      },
    ];
  };

  const validateForm = () => {
    if (!selectedConceptId) {
      setFormError("Zgjidhni një koncept.");
      return false;
    }

    if (!questionText.trim()) {
      setFormError("Shkruani tekstin e pyetjes.");
      return false;
    }

    if (points < 1) {
      setFormError("Pikët duhet të jenë së paku 1.");
      return false;
    }

    if (questionType === "multiple_choice") {
      if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
        setFormError("Plotësoni të gjitha opsionet A, B, C dhe D.");
        return false;
      }
    }

    return true;
  };

  const handleCreateOrUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;
    if (!validateForm()) return;

    setSubmitting(true);
    setFormError("");

    try {
      const payload = {
        question_text: questionText.trim(),
        test_id: Number(id),
        concept_id: Number(selectedConceptId),
        question_type: questionType,
        layout_position: layoutPosition,
        points,
        options: buildOptionsPayload(),
      };

      if (editingQuestionId) {
        await api.put(`/questions/${editingQuestionId}`, payload);
      } else {
        await api.post("/questions/", payload);
      }

      resetForm();
      setModalOpen(false);
      await loadQuestions();
    } catch (err: any) {
      setFormError(
        err.response?.data?.detail ||
          "Dështoi ruajtja e pyetjes. Kontrollo a e ke endpoint-in PUT /questions/{id} në backend."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.question_text);
    setSelectedConceptId(question.concept_id);
    setQuestionType(question.question_type ?? "multiple_choice");
    setLayoutPosition(question.layout_position ?? "full");
    setPoints(question.points ?? 1);

    const options = question.options ?? [];
    setOptionA(options[0]?.option_text ?? "");
    setOptionB(options[1]?.option_text ?? "");
    setOptionC(options[2]?.option_text ?? "");
    setOptionD(options[3]?.option_text ?? "");

    const correctIndex = options.findIndex((option) => option.is_correct);
    setCorrectOption((["A", "B", "C", "D"][correctIndex] as "A" | "B" | "C" | "D") ?? "A");

    setFormError("");
    setModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    setDeletingId(questionId);

    try {
      await deleteQuestion(questionId);
      await loadQuestions();
      showToast("success", "Pyetja u fshi me sukses.");
    } catch (err: any) {
      showToast("error", err.response?.data?.detail || "Dështoi fshirja e pyetjes.");
    } finally {
      setDeletingId(null);
      setPendingDeleteQuestionId(null);
    }
  };

  const handleUpdateStatus = async (status: TestStatus) => {
    if (!id) return;

    setStatusSaving(true);

    try {
      const response = await api.put(`/tests/${id}/status`, { status });
      setTest(response.data);
      showToast("success", "Statusi i testit u ruajt me sukses.");
    } catch (err: any) {
      showToast("error", err.response?.data?.detail || "Dështoi ruajtja e statusit të testit.");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
  if (!id) return;

  try {
    const response = await api.get(`/tests/${id}/pdf`, {
      responseType: "blob",
    });

    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = fileURL;
    link.download = `${test?.title ?? "test"}.pdf`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(fileURL);
  } catch (err: any) {
    showToast("error", err.response?.data?.detail || "Dështoi shkarkimi i PDF-it.");
  }
};

  const renderOptions = (question: Question) => {
    if (!question.options || question.options.length === 0) return null;

    return (
      <div className="q-options">
        {question.options.map((option, index) => {
          const letter = ["A", "B", "C", "D"][index] ?? index + 1;

          return (
            <div
              key={option.id}
              className={`q-option ${option.is_correct ? "q-option-correct" : ""}`}
            >
              <span className="q-option-letter">{letter}</span>
              <span>{option.option_text}</span>
              {option.is_correct && <span className="q-correct-badge">Saktë</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 30rem),
            radial-gradient(circle at top right, rgba(219,234,254,0.56), transparent 34rem),
            #f3f4f6;
          color: #0f172a;
        }
        a { text-decoration: none; color: inherit; }

        .topbar {
          background: rgba(255,255,255,0.62);
          border: 1px solid rgba(255,255,255,0.74);
          border-radius: 24px;
          padding: 0 20px;
          min-height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 16px;
          z-index: 50;
          gap: 12px;
          width: min(1180px, calc(100% - 32px));
          margin: 16px auto 0;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }

        .topbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.62);
          border: 1px solid rgba(226,232,240,0.82);
          border-radius: 15px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 800;
          color: #475569;
          cursor: pointer;
          transition: background 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
          white-space: nowrap;
        }

        .back-btn:hover { background: rgba(255,255,255,0.9); border-color: rgba(191,219,254,0.9); transform: translateY(-1px); }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          min-width: 0;
        }

        .breadcrumb-seg { color: #64748b; font-weight: 700; }
        .breadcrumb-sep { color: #cbd5e1; display: flex; align-items: center; }
        .breadcrumb-current {
          color: #0f172a;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .page { max-width: 1180px; margin: 0 auto; padding: 24px 28px 32px; }

        .page-header {
          background: rgba(255,255,255,0.62);
          border: 1px solid rgba(255,255,255,0.74);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }

        .page-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .page-title { font-size: 24px; font-weight: 850; color: #0f172a; letter-spacing: -0.5px; }
        .page-meta { font-size: 13px; color: #94a3b8; margin-top: 6px; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 800;
          background: rgba(255,255,255,0.62);
          color: #475569;
          border: 1px solid rgba(226,232,240,0.82);
          white-space: nowrap;
        }

        .status-pill.published {
          background: rgba(236,253,245,0.74);
          color: #047857;
          border-color: rgba(167,243,208,0.86);
        }

        .builder-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .meta-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.58);
          border: 1px solid rgba(226,232,240,0.78);
          border-radius: 14px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }

        .builder-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: 20px;
          align-items: start;
        }

        .panel {
          background: rgba(255,255,255,0.62);
          border: 1px solid rgba(255,255,255,0.74);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(226,232,240,0.68);
          background: rgba(255,255,255,0.44);
        }

        .panel-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-icon {
          width: 36px;
          height: 36px;
          border-radius: 15px;
          background: linear-gradient(145deg, rgba(37,99,235,0.12), rgba(255,255,255,0.72));
          border: 1px solid rgba(255,255,255,0.78);
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-title { font-size: 14.5px; font-weight: 850; color: #0f172a; }
        .section-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }

        .question-list { padding: 12px; display: flex; flex-direction: column; gap: 12px; }

        .question-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(255,255,255,0.58);
          border: 1px solid rgba(255,255,255,0.72);
          border-radius: 20px;
          padding: 15px;
          transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
        }

        .question-card:hover {
          background: rgba(255,255,255,0.78);
          border-color: rgba(191,219,254,0.9);
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(15,23,42,0.07);
        }

        .q-num {
          width: 30px;
          height: 30px;
          border-radius: 12px;
          background: rgba(241,245,249,0.78);
          color: #64748b;
          font-size: 12px;
          font-weight: 850;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .q-main { flex: 1; min-width: 0; }

        .q-meta-line {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .q-chip {
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          background: rgba(241,245,249,0.78);
          border-radius: 999px;
          padding: 3px 8px;
        }

        .q-chip.blue {
          color: #2563eb;
          background: rgba(239,246,255,0.78);
        }

        .q-text {
          font-size: 14px;
          font-weight: 650;
          color: #0f172a;
          line-height: 1.5;
        }

        .q-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .q-option {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(248,250,252,0.72);
          border: 1px solid rgba(226,232,240,0.78);
          border-radius: 14px;
          padding: 8px 10px;
          font-size: 12.5px;
          color: #475569;
          min-width: 0;
        }

        .q-option-letter {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #e2e8f0;
          color: #334155;
          font-size: 11px;
          font-weight: 850;
          flex-shrink: 0;
        }

        .q-option-correct {
          border-color: rgba(187,247,208,0.86);
          background: rgba(240,253,244,0.78);
          color: #166534;
        }

        .q-option-correct .q-option-letter {
          background: #22c55e;
          color: #fff;
        }

        .q-correct-badge {
          margin-left: auto;
          background: rgba(220,252,231,0.88);
          color: #166534;
          border-radius: 999px;
          padding: 2px 7px;
          font-size: 10.5px;
          font-weight: 850;
          white-space: nowrap;
        }

        .q-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .empty-state {
          margin: 12px;
          background: rgba(255,255,255,0.52);
          border: 1px dashed rgba(148,163,184,0.58);
          border-radius: 22px;
          padding: 44px 24px;
          text-align: center;
          color: #94a3b8;
          font-size: 13.5px;
        }

        .empty-state strong {
          display: block;
          font-size: 14px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .preview-panel {
          position: sticky;
          top: 76px;
        }

        .preview-body {
          padding: 18px;
          background: rgba(248,250,252,0.5);
        }

        .paper {
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(226,232,240,0.82);
          box-shadow: 0 14px 32px rgba(15,23,42,0.10);
          border-radius: 18px;
          padding: 22px;
          min-height: 460px;
        }

        .paper-title {
          text-align: center;
          font-size: 17px;
          font-weight: 850;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .paper-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          border-top: 1px solid rgba(226,232,240,0.78);
          border-bottom: 1px solid rgba(226,232,240,0.78);
          padding: 10px 0;
          margin: 14px 0 18px;
          font-size: 11.5px;
          color: #64748b;
        }

        .paper-question {
          margin-bottom: 16px;
          page-break-inside: avoid;
        }

        .paper-q-text {
          font-size: 12.5px;
          line-height: 1.45;
          color: #0f172a;
          font-weight: 650;
          margin-bottom: 7px;
        }

        .paper-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 10px;
          font-size: 12px;
          color: #334155;
        }

        .paper-answer-line {
          height: 42px;
          border-bottom: 1px solid #cbd5e1;
          margin-top: 6px;
        }

        .btn-primary,
        .btn-secondary,
        .btn-outline,
        .btn-danger-soft,
        .btn-success {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          border-radius: 15px;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.16s ease;
          white-space: nowrap;
        }

        .btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; box-shadow: 0 12px 26px rgba(37,99,235,0.22); }
        .btn-primary:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-1px); }
        .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }

        .btn-success { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; box-shadow: 0 12px 24px rgba(22,163,74,0.16); }
        .btn-success:hover { background: linear-gradient(135deg, #16a34a, #15803d); transform: translateY(-1px); }
        .btn-success:disabled { background: #86efac; cursor: not-allowed; }

        .btn-secondary { background: rgba(255,255,255,0.62); color: #475569; border: 1px solid rgba(226,232,240,0.82); }
        .btn-secondary:hover { background: rgba(255,255,255,0.9); transform: translateY(-1px); }

        .btn-outline {
          background: rgba(255,255,255,0.62);
          color: #475569;
          border: 1px solid rgba(226,232,240,0.82);
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.9);
          border-color: rgba(191,219,254,0.9);
          color: #0f172a;
          transform: translateY(-1px);
        }

        .btn-danger-soft {
          background: rgba(255,255,255,0.52);
          color: #94a3b8;
          border: 1px solid rgba(226,232,240,0.62);
          padding: 7px 9px;
        }
        .btn-danger-soft:hover {
          background: rgba(255,241,242,0.86);
          color: #e11d48;
          border-color: #fecdd3;
        }

        .btn-danger-soft:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.34);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 16px;
          backdrop-filter: blur(10px);
        }

        .modal {
          background: rgba(255,255,255,0.86);
          border: 1px solid rgba(255,255,255,0.78);
          border-radius: 24px;
          width: 100%;
          max-width: 660px;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          box-shadow: 0 28px 76px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.86);
          padding: 28px;
          backdrop-filter: blur(22px);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 850;
          color: #0f172a;
        }

        .modal-close {
          background: rgba(248,250,252,0.76);
          border: 1px solid rgba(226,232,240,0.82);
          cursor: pointer;
          color: #94a3b8;
          padding: 6px;
          border-radius: 13px;
        }

        .modal-close:hover { color: #475569; background: rgba(255,255,255,0.92); }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
          justify-content: flex-end;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group { margin-bottom: 14px; }

        .form-label {
          display: block;
          font-size: 12.5px;
          font-weight: 800;
          color: #475569;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(226,232,240,0.86);
          border-radius: 15px;
          font-size: 13.5px;
          color: #0f172a;
          background: rgba(255,255,255,0.72);
          outline: none;
          transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }

        textarea.form-input {
          min-height: 86px;
          resize: vertical;
          line-height: 1.5;
        }

        .form-input:focus {
          border-color: #93c5fd;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 0 0 4px rgba(147,197,253,0.22);
        }

        .form-input::placeholder { color: #cbd5e1; }

        .form-select {
          width: 100%;
          padding: 10px 32px 10px 12px;
          border: 1px solid rgba(226,232,240,0.86);
          border-radius: 15px;
          font-size: 13.5px;
          color: #0f172a;
          background: rgba(255,255,255,0.72);
          outline: none;
          transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }

        .form-select:focus {
          border-color: #93c5fd;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 0 0 4px rgba(147,197,253,0.22);
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 6px;
        }

        .option-box {
          border: 1px solid rgba(226,232,240,0.78);
          border-radius: 16px;
          padding: 10px;
          background: rgba(248,250,252,0.62);
        }

        .option-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 7px;
          gap: 8px;
        }

        .option-letter {
          font-size: 12px;
          font-weight: 850;
          color: #334155;
        }

        .correct-radio {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 750;
          color: #64748b;
          cursor: pointer;
          white-space: nowrap;
        }

        .correct-radio input { accent-color: #2563eb; }

        .helper-text {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 6px;
        }

        .form-error {
          font-size: 12px;
          color: #e11d48;
          margin-top: 10px;
          background: rgba(255,241,242,0.8);
          border: 1px solid rgba(254,205,211,0.9);
          border-radius: 15px;
          padding: 9px 10px;
        }

        .no-concepts-warn {
          background: rgba(255,251,235,0.82);
          border: 1px solid rgba(253,230,138,0.92);
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 13px;
          color: #92400e;
          margin-bottom: 14px;
        }

        @media (max-width: 980px) {
          .builder-grid {
            grid-template-columns: 1fr;
          }

          .preview-panel {
            position: static;
          }
        }

        @media (max-width: 700px) {
          .page { padding: 16px; }
          .topbar { padding: 10px 16px; flex-wrap: wrap; }
          .breadcrumb { display: none; }
          .topbar-right { width: 100%; justify-content: space-between; }
          .topbar-right .btn-primary,
          .topbar-right .btn-outline {
            flex: 1;
            justify-content: center;
          }

          .page-header-top {
            flex-direction: column;
          }

          .builder-actions {
            flex-direction: column;
          }

          .builder-actions button,
          .builder-actions a {
            width: 100%;
          }

          .question-card {
            flex-direction: column;
          }

          .q-actions {
            width: 100%;
          }

          .q-actions button {
            flex: 1;
          }

          .q-options,
          .paper-options,
          .options-grid,
          .form-row {
            grid-template-columns: 1fr;
          }

          .modal { padding: 22px; }
          .modal-actions { flex-direction: column-reverse; }
          .modal-actions button { width: 100%; justify-content: center; }
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <IconBack /> Kthehu
          </button>

          <div className="breadcrumb">
            <span className="breadcrumb-seg">Testet</span>
            <span className="breadcrumb-sep"><IconChevron /></span>
            <span className="breadcrumb-current">{test?.title ?? `Testi #${id}`}</span>
          </div>
        </div>

        <div className="topbar-right">
          {test && (
            <Link to={`/tests/${id}/analytics`} className="btn-outline">
              <IconBarChart />
              <span>Analitika</span>
            </Link>
          )}

          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            <IconPlus /> Shto pyetje
          </button>
        </div>
      </header>

      <div className="page">
        <div className="page-header">
          <div className="page-header-top">
            <div>
              <div className="page-title">{test?.title ?? `Testi #${id}`}</div>
              <div className="page-meta">
                ID: {id} · Ndërtues testi për printim dhe analizë
              </div>

              <div className="meta-pills">
                <span className="meta-pill">{questions.length} pyetje</span>
                <span className="meta-pill">
                  {questions.reduce((sum, q) => sum + (q.points ?? 1), 0)} pikë
                </span>
                {concepts.length > 0 && (
                  <span className="meta-pill">{concepts.length} koncepte</span>
                )}
              </div>
            </div>

            <span className={`status-pill ${test?.status === "published" ? "published" : ""}`}>
              {getStatusLabel(test?.status)}
            </span>
          </div>

          <div className="builder-actions">
            <button
              className="btn-secondary"
              disabled={statusSaving}
              onClick={() => handleUpdateStatus("draft")}
            >
              {statusSaving ? "Duke ruajtur…" : "Ruaj si skicë"}
            </button>

            <button
              className="btn-success"
              disabled={statusSaving || questions.length === 0}
              onClick={() => handleUpdateStatus("published")}
            >
              Publiko Testin
            </button>

            <button
              className="btn-outline"
              onClick={() => setPreviewOpen((prev) => !prev)}
            >
              <IconPreview />
              {previewOpen ? "Fsheh pamjen paraprake" : "Shfaq pamjen paraprake"}
            </button>

            <button
              className="btn-outline"
              onClick={handleDownloadPdf}
            >
              Shkarko PDF
            </button>
          </div>
        </div>

        <div className={previewOpen ? "builder-grid" : ""}>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <div className="section-icon"><IconQuestion /></div>
                <div>
                  <div className="section-title">Pyetjet e testit</div>
                  <div className="section-sub">
                    Shto, edito dhe përgatit pyetjet për PDF
                  </div>
                </div>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="empty-state">
                <strong>Ky test nuk ka pyetje ende</strong>
                Shtoni pyetjen e parë duke klikuar "Shto pyetje".
              </div>
            ) : (
              <div className="question-list">
                {orderedQuestions.map((q, index) => (
                  <div key={q.id} className="question-card">
                    <div className="q-num">{index + 1}</div>

                    <div className="q-main">
                      <div className="q-meta-line">
                        <span className="q-chip blue">{getConceptName(q.concept_id)}</span>
                        <span className="q-chip">{getQuestionTypeLabel(q.question_type)}</span>
                        <span className="q-chip">{q.points ?? 1} pikë</span>
                      </div>

                      <div className="q-text">{q.question_text}</div>
                      {renderOptions(q)}
                    </div>

                    <div className="q-actions">
                      <button
                        className="btn-outline"
                        onClick={() => handleEditQuestion(q)}
                        title="Ndrysho pyetjen"
                      >
                        <IconEdit />
                      </button>

                      <button
                        className="btn-danger-soft"
                        onClick={() => setPendingDeleteQuestionId(q.id)}
                        disabled={deletingId === q.id}
                        title="Fshi pyetjen"
                      >
                        <IconTrash />
                        {deletingId === q.id ? "…" : ""}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {previewOpen && (
            <div className="panel preview-panel">
              <div className="panel-header">
                <div>
                  <div className="section-title">Pamja paraprake e testit</div>
                  <div className="section-sub">Pamja afërsisht si në PDF</div>
                </div>
              </div>

              <div className="preview-body">
                <div className="paper">
                  <div className="paper-title">{test?.title ?? `Testi #${id}`}</div>

                  <div className="paper-info">
                    <div>Emri: __________________</div>
                    <div>Klasa: __________________</div>
                    <div>Data: __________________</div>
                    <div>Pikët: {questions.reduce((sum, q) => sum + (q.points ?? 1), 0)}</div>
                  </div>

                  {orderedQuestions.length === 0 ? (
                    <div className="empty-state" style={{ margin: 0 }}>
                      <strong>Nuk ka pyetje për preview</strong>
                    </div>
                  ) : (
                    orderedQuestions.map((q, index) => (
                      <div key={q.id} className="paper-question">
                        <div className="paper-q-text">
                          {index + 1}. {q.question_text} ({q.points ?? 1} pikë)
                        </div>

                        {q.options && q.options.length > 0 ? (
                          <div className="paper-options">
                            {q.options.map((option, optionIndex) => (
                              <div key={option.id}>
                                {["A", "B", "C", "D"][optionIndex] ?? optionIndex + 1}) {option.option_text}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="paper-answer-line" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalOpen(false);
              resetForm();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {editingQuestionId ? "Ndrysho pyetjen" : "Shto pyetje të re"}
              </div>

              <button
                className="modal-close"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              >
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateQuestion}>
              {concepts.length === 0 && (
                <div className="no-concepts-warn">
                  Ky test nuk ka koncepte të lidhura. Shtoni koncepte në lëndën e klasës fillimisht.
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Koncepti</label>
                  <select
                    className="form-select"
                    value={selectedConceptId}
                    onChange={(e) => setSelectedConceptId(Number(e.target.value))}
                    required
                    disabled={concepts.length === 0}
                  >
                    <option value="">— Zgjidhni konceptin —</option>
                    {concepts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Lloji i pyetjes</label>
                  <select
                    className="form-select"
                    value={questionType}
                    onChange={(e) => {
                      const value = e.target.value as QuestionType;
                      setQuestionType(value);

                      if (value === "true_false") {
                        setCorrectOption("A");
                      }

                      if (value === "short_answer" || value === "essay") {
                        setOptionA("");
                        setOptionB("");
                        setOptionC("");
                        setOptionD("");
                      }
                    }}
                  >
                    <option value="multiple_choice">Me opsione</option>
                    <option value="short_answer">Përgjigje e shkurtër</option>
                    <option value="true_false">E vërtetë / E gabuar</option>
                    <option value="essay">Ese</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pikët</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pamja në PDF</label>
                  <select
                    className="form-select"
                    value={layoutPosition}
                    onChange={(e) => setLayoutPosition(e.target.value as LayoutPosition)}
                  >
                    <option value="full">Full width</option>
                    <option value="left">Majtas</option>
                    <option value="right">Djathtas</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teksti i pyetjes</label>
                <textarea
                  className="form-input"
                  placeholder="p.sh. Sa është 8 x 7?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  required
                />
              </div>

              {questionType === "multiple_choice" && (
                <div className="form-group">
                  <label className="form-label">Opsionet e përgjigjes</label>

                  <div className="options-grid">
                    <div className="option-box">
                      <div className="option-top">
                        <span className="option-letter">Opsioni A</span>
                        <label className="correct-radio">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={correctOption === "A"}
                            onChange={() => setCorrectOption("A")}
                          />
                          Saktë
                        </label>
                      </div>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="p.sh. 54"
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        required
                      />
                    </div>

                    <div className="option-box">
                      <div className="option-top">
                        <span className="option-letter">Opsioni B</span>
                        <label className="correct-radio">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={correctOption === "B"}
                            onChange={() => setCorrectOption("B")}
                          />
                          Saktë
                        </label>
                      </div>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="p.sh. 56"
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        required
                      />
                    </div>

                    <div className="option-box">
                      <div className="option-top">
                        <span className="option-letter">Opsioni C</span>
                        <label className="correct-radio">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={correctOption === "C"}
                            onChange={() => setCorrectOption("C")}
                          />
                          Saktë
                        </label>
                      </div>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="p.sh. 64"
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        required
                      />
                    </div>

                    <div className="option-box">
                      <div className="option-top">
                        <span className="option-letter">Opsioni D</span>
                        <label className="correct-radio">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={correctOption === "D"}
                            onChange={() => setCorrectOption("D")}
                          />
                          Saktë
                        </label>
                      </div>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="p.sh. 48"
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="helper-text">
                    Zgjidh vetëm një përgjigje të saktë. Kjo përdoret më vonë për analizat e nxënësve.
                  </div>
                </div>
              )}

              {questionType === "true_false" && (
                <div className="form-group">
                  <label className="form-label">Përgjigjja e saktë</label>

                  <div className="options-grid">
                    <div className="option-box">
                      <label className="correct-radio">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctOption === "A"}
                          onChange={() => setCorrectOption("A")}
                        />
                        E vërtetë
                      </label>
                    </div>

                    <div className="option-box">
                      <label className="correct-radio">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctOption === "B"}
                          onChange={() => setCorrectOption("B")}
                        />
                        E gabuar
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {(questionType === "short_answer" || questionType === "essay") && (
                <div className="helper-text">
                  Kjo pyetje nuk ka opsione. Në PDF do të shfaqet vijë/hapësirë për përgjigje.
                </div>
              )}

              {formError && <div className="form-error">{formError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || concepts.length === 0}
                >
                  {submitting
                    ? "Duke ruajtur…"
                    : editingQuestionId
                    ? "Ruaj ndryshimet"
                    : "Shto pyetjen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDeleteQuestionId !== null && (
        <ConfirmDialog
          title="Fshi pyetjen"
          message="Të fshihet kjo pyetje? Ky veprim nuk mund të kthehet."
          confirmLabel="Fshi"
          variant="danger"
          submitting={deletingId === pendingDeleteQuestionId}
          onCancel={() => setPendingDeleteQuestionId(null)}
          onConfirm={() => handleDeleteQuestion(pendingDeleteQuestionId)}
        />
      )}
    </>
  );
}

export default TestDetails;
