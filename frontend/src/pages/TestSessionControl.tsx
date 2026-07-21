import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BarChart3, CheckCircle2, Clipboard, Download, ExternalLink, FileCheck2, Pause, Play, RotateCcw, Square, UserCheck, Users } from "lucide-react";
import { getErrorMessage, hasApiStatus } from "../services/errors";

import api from "../services/api";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import {
  endTestSession,
  downloadSessionAiAnalysisPdf,
  generateSessionAiAnalysis,
  getSessionAiAnalysis,
  getTestSessionAnalytics,
  getTestSessionByCode,
  getTestSessionResults,
  pauseTestSession,
  resumeTestSession,
  startTestSession,
  updateStudentAnswerOverride,
} from "../services/onlineTestService";

type User = { full_name: string; email: string; role: string };

type AttemptSummary = {
  attempt_id: number;
  student_id: number;
  student_name: string;
  student_code: string;
  status: "joined" | "in_progress" | "submitted";
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  created_at: string;
  started_at?: string | null;
  submitted_at?: string | null;
};

type SessionDetail = {
  id: number;
  test_id: number;
  classroom_id: number;
  session_code: string;
  status: "waiting" | "active" | "paused" | "ended";
  test_title: string;
  classroom_name: string;
  attempts: AttemptSummary[];
};

type AnswerResult = {
  answer_id: number;
  question_id: number;
  question_text: string;
  concept_name: string;
  selected_option_text: string | null;
  written_answer: string | null;
  is_correct: boolean | null;
  ai_points_earned: number;
  points_earned: number;
  max_points: number;
  expected_answer: string | null;
  ai_feedback_for_teacher: string | null;
  ai_confidence: number | null;
  needs_teacher_review: boolean;
  teacher_points_override: number | null;
  teacher_feedback_override: string | null;
  feedback_for_teacher: string | null;
  graded_by: "system" | "ai" | "teacher";
};

type AttemptResult = AttemptSummary & { answers: AnswerResult[] };

type ResultsData = SessionDetail & { results: AttemptResult[] };

type ConceptStat = {
  concept_id: number;
  concept_name: string;
  correct: number;
  total: number;
  points_earned: number;
  max_points: number;
  success_rate: number;
  is_gap: boolean;
  students_struggled?: number;
  students_total?: number;
  struggled_percentage?: number;
};

type StudentConceptStats = {
  student_id: number;
  student_name: string;
  student_code: string;
  status: string;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  concepts: ConceptStat[];
  learning_gaps: ConceptStat[];
};

type AnalyticsData = {
  total_students: number;
  joined_count: number;
  submitted_count: number;
  average_score: number;
  student_results: AttemptSummary[];
  student_concept_stats: StudentConceptStats[];
  concept_stats: ConceptStat[];
  classroom_gaps: ConceptStat[];
};

type AiAnalysis = {
  id: number;
  session_id: number;
  teacher_id: number;
  analysis_text: string;
  model_name: string;
  created_at: string;
  updated_at: string;
};

const statusLabel: Record<string, string> = {
  waiting: "Në pritje",
  active: "Aktiv",
  paused: "Pauzuar",
  ended: "Përfunduar",
  joined: "U bashkua",
  in_progress: "Në test",
  submitted: "Dorëzuar",
};

const rateColor = (rate: number | null | undefined) => {
  const value = rate ?? 0;
  if (value >= 80) return "#16a34a";
  if (value >= 60) return "#d97706";
  return "#dc2626";
};

function TestSessionControl() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPdfLoading, setAiPdfLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [copiedTarget, setCopiedTarget] = useState<"code" | "link" | null>(null);
  const [editingAnswerKey, setEditingAnswerKey] = useState<string | null>(null);
  const [overrideDraft, setOverrideDraft] = useState({
    points: "",
    feedback: "",
    isCorrect: true,
  });
  const [savingAnswerId, setSavingAnswerId] = useState<number | null>(null);

  const studentLink = useMemo(() => {
    if (!session) return "";
    return `${window.location.origin}/online-test?code=${session.session_code}`;
  }, [session]);

  const loadAiAnalysis = useCallback(async (sessionId: number) => {
    try {
      const response = await getSessionAiAnalysis(sessionId);
      setAiAnalysis(response.data);
      setAiError("");
    } catch (err: unknown) {
      if (hasApiStatus(err, 404)) {
        setAiAnalysis(null);
        return;
      }
      setAiError(getErrorMessage(err, "Dështoi ngarkimi i analizës nga AI."));
    }
  }, []);

  const loadData = useCallback(async (showLoader = false, includeAi = false) => {
    if (!code) return;
    if (showLoader) setLoading(true);

    const sessionRes = await getTestSessionByCode(code);
    const detail: SessionDetail = sessionRes.data;
    setSession(detail);

    const [resultsRes, analyticsRes] = await Promise.all([
      getTestSessionResults(detail.id),
      getTestSessionAnalytics(detail.id),
    ]);
    setResults(resultsRes.data);
    setAnalytics(analyticsRes.data);
    if (includeAi) {
      await loadAiAnalysis(detail.id);
    }
    setLoading(false);
  }, [code, loadAiAnalysis]);

  useEffect(() => {
    const init = async () => {
      try {
        const [meRes] = await Promise.all([
          api.get("/users/me"),
          loadData(true, true),
        ]);
        setUser(meRes.data);
      } catch {
        navigate("/login");
      }
    };
    init();
  }, [loadData, navigate]);

  useEffect(() => {
    if (!code) return;
    const interval = window.setInterval(() => {
      loadData(false).catch(() => undefined);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [code, loadData]);

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    if (!session) return;
    setActionLoading(label);
    setAlert(null);
    try {
      await action();
      await loadData(false);
      setAlert({ type: "success", text: "Testimi online u përditësua me sukses." });
    } catch (err: unknown) {
      setAlert({ type: "error", text: getErrorMessage(err, "Veprimi dështoi.") });
    } finally {
      setActionLoading("");
    }
  };

  const copyValue = async (value: string, target: "code" | "link") => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedTarget(target);
    window.setTimeout(() => {
      setCopiedTarget((current) => (current === target ? null : current));
    }, 1800);
  };

  const copySessionCode = async () => {
    if (!session?.session_code) return;
    await copyValue(session.session_code, "code");
  };

  const copyStudentLink = async () => {
    if (!studentLink) return;
    await copyValue(studentLink, "link");
  };

  const handleAiAnalysis = async (force = false) => {
    if (!session) return;

    setAiLoading(true);
    setAiError("");
    try {
      const response = await generateSessionAiAnalysis(session.id, force);
      setAiAnalysis(response.data);
      setAlert({
        type: "success",
        text: force ? "Analiza nga AI u rigjenerua me sukses." : "Analiza nga AI u krijua me sukses.",
      });
    } catch (err: unknown) {
      setAiError(getErrorMessage(err, "Dështoi analiza nga AI."));
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiPdfDownload = async () => {
    if (!session) return;

    setAiPdfLoading(true);
    setAiError("");
    try {
      const response = await downloadSessionAiAnalysisPdf(session.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `schoolbridge-ai-analysis-${session.session_code}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setAiError(getErrorMessage(err, "Dështoi shkarkimi i raportit PDF."));
    } finally {
      setAiPdfLoading(false);
    }
  };

  const getAnswerKey = (attemptId: number, answerId: number) => `${attemptId}-${answerId}`;

  const startAnswerEdit = (attemptId: number, answer: AnswerResult) => {
    setEditingAnswerKey(getAnswerKey(attemptId, answer.answer_id));
    setOverrideDraft({
      points: String(answer.points_earned),
      feedback: answer.feedback_for_teacher ?? answer.ai_feedback_for_teacher ?? "",
      isCorrect: answer.is_correct ?? answer.points_earned > 0,
    });
  };

  const startAnswerMark = (attemptId: number, answer: AnswerResult, isCorrect: boolean) => {
    setEditingAnswerKey(getAnswerKey(attemptId, answer.answer_id));
    setOverrideDraft({
      points: isCorrect ? String(answer.max_points) : "0",
      feedback: answer.feedback_for_teacher ?? answer.ai_feedback_for_teacher ?? "",
      isCorrect,
    });
  };

  const saveAnswerOverride = async (attemptId: number, answer: AnswerResult) => {
    if (!session) return;

    const points = Number(overrideDraft.points);
    if (!Number.isFinite(points) || points < 0 || points > answer.max_points) {
      setAlert({ type: "error", text: `Pikët duhet të jenë midis 0 dhe ${answer.max_points}.` });
      return;
    }

    setSavingAnswerId(answer.answer_id);
    setAlert(null);
    try {
      await updateStudentAnswerOverride(session.id, answer.answer_id, {
        points_earned: Math.round(points),
        feedback: overrideDraft.feedback.trim() || null,
        is_correct: overrideDraft.isCorrect,
      });
      setEditingAnswerKey(null);
      await loadData(false);
      setExpandedAttemptId(attemptId);
      setAlert({ type: "success", text: "Vlerësimi u ruajt nga profesori." });
    } catch (err: unknown) {
      setAlert({ type: "error", text: getErrorMessage(err, "Dështoi ruajtja e vlerësimit.") });
    } finally {
      setSavingAnswerId(null);
    }
  };

  if (loading) {
    return (
      <Layout title="Testim online" backTo="/dashboard" backLabel="Paneli" user={user}>
        <LoadingSpinner text="Duke ngarkuar testimin online…" />
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout title="Testim online" backTo="/dashboard" backLabel="Paneli" user={user}>
        <Alert type="error" message="Testimi online nuk u gjet." />
      </Layout>
    );
  }

  const submittedResults = results?.results.filter((item) => item.status === "submitted") ?? [];
  const totalStudents = analytics?.total_students ?? 0;
  const joinedStudents = Math.max(analytics?.joined_count ?? 0, session.attempts.length);
  const submittedStudents = Math.max(
    analytics?.submitted_count ?? 0,
    submittedResults.length,
    session.attempts.filter((attempt) => attempt.status === "submitted").length,
  );
  const hasJoinedStudents = joinedStudents > 0;
  const hasSubmittedStudents = submittedStudents > 0;
  const averageScore = hasSubmittedStudents ? `${analytics?.average_score ?? 0}%` : "—";

  const progressLabel = (attempt: AttemptSummary) => {
    if (attempt.status === "submitted") return "100%";
    if (attempt.status === "in_progress") return "Në zhvillim";
    return "Në pritje";
  };

  const renderSessionControls = () => {
    if (session.status === "waiting") {
      return (
        <button
          className="sb-btn sb-btn-primary"
          disabled={!!actionLoading}
          onClick={() => runAction("start", () => startTestSession(session.id))}
        >
          <Play size={15} /> {actionLoading === "start" ? "Duke nisur…" : "Fillo testimin"}
        </button>
      );
    }

    if (session.status === "active") {
      return (
        <>
          <button
            className="sb-btn sb-btn-secondary"
            disabled={!!actionLoading}
            onClick={() => runAction("pause", () => pauseTestSession(session.id))}
          >
            <Pause size={15} /> Ndalo përkohësisht
          </button>
          <button
            className="sb-btn sb-btn-danger"
            disabled={!!actionLoading}
            onClick={() => runAction("end", () => endTestSession(session.id))}
          >
            <Square size={14} /> Përfundo testimin
          </button>
        </>
      );
    }

    if (session.status === "paused") {
      return (
        <>
          <button
            className="sb-btn sb-btn-primary"
            disabled={!!actionLoading}
            onClick={() => runAction("resume", () => resumeTestSession(session.id))}
          >
            <RotateCcw size={15} /> Vazhdo testimin
          </button>
          <button
            className="sb-btn sb-btn-danger"
            disabled={!!actionLoading}
            onClick={() => runAction("end", () => endTestSession(session.id))}
          >
            <Square size={14} /> Përfundo testimin
          </button>
        </>
      );
    }

    return <div className="session-ended-note">Ky testim ka përfunduar</div>;
  };

  return (
    <Layout
      title={session.test_title}
      subtitle={`${session.classroom_name} · Testim online`}
      backTo={`/tests/${session.test_id}`}
      backLabel="Testi"
      user={user}
      actions={
        <Link to={`/tests/${session.test_id}`} className="sb-btn sb-btn-secondary">
          Kthehu te testi
        </Link>
      }
    >
      <style>{sessionStyles}</style>
      {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} />}

      <section className="session-hero">
        <div className="session-code-area">
          <div className={`session-status ${session.status}`}>{statusLabel[session.status]}</div>
          <div className="session-code-label">Kodi i testimit</div>
          <div className="session-code-row">
            <div className="session-code">{session.session_code}</div>
            <button className="copy-code-btn" onClick={copySessionCode} title="Kopjo kodin">
              <Clipboard size={16} />
              {copiedTarget === "code" ? "U kopjua ✓" : "Kopjo"}
            </button>
          </div>
          <div className="session-link-row">
            <button className="sb-btn sb-btn-ghost" onClick={copyStudentLink}>
              <Clipboard size={14} /> {copiedTarget === "link" ? "U kopjua ✓" : "Kopjo linkun"}
            </button>
            <a className="sb-btn sb-btn-secondary" href={studentLink} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Hap si nxënës
            </a>
          </div>
        </div>

        <div className="session-controls">
          {renderSessionControls()}
        </div>
      </section>

      <div className="session-stats">
        <div className="stat-tile">
          <span><Users size={15} /> Nxënësit në klasë</span>
          <strong>{totalStudents}</strong>
        </div>
        <div className="stat-tile">
          <span><UserCheck size={15} /> U bashkuan</span>
          <strong>{joinedStudents} nga {totalStudents}</strong>
        </div>
        <div className="stat-tile">
          <span><FileCheck2 size={15} /> Dorëzuan</span>
          <strong>{submittedStudents} nga {joinedStudents}</strong>
        </div>
        <div className="stat-tile">
          <span><BarChart3 size={15} /> Mesatarja</span>
          <strong>{averageScore}</strong>
        </div>
      </div>

      {!hasJoinedStudents ? (
        <section className="waiting-empty">
          <div className="waiting-icon"><Users size={30} /></div>
          <h2>Në pritje të nxënësve</h2>
          <p>
            Ndaje kodin ose linkun e testimit me nxënësit. Të dhënat, rezultatet dhe analiza do të shfaqen këtu pasi ata të bashkohen dhe ta dorëzojnë testin.
          </p>
          <div className="waiting-actions">
            <button className="sb-btn sb-btn-primary" onClick={copySessionCode}>
              <Clipboard size={14} /> {copiedTarget === "code" ? "U kopjua ✓" : "Kopjo kodin"}
            </button>
            <button className="sb-btn sb-btn-secondary" onClick={copyStudentLink}>
              <Clipboard size={14} /> {copiedTarget === "link" ? "U kopjua ✓" : "Kopjo linkun"}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="session-panel students-panel">
            <div className="panel-title">
              <Users size={18} /> Nxënësit në testim
            </div>
            <div className="session-table-wrap">
              <table className="session-table">
                <thead>
                  <tr>
                    <th>Nxënësi</th>
                    <th>Kodi</th>
                    <th>Statusi</th>
                    <th>Progresi</th>
                    <th>Rezultati</th>
                    <th>Veprimet</th>
                  </tr>
                </thead>
                <tbody>
                  {session.attempts.map((attempt) => (
                    <tr key={attempt.attempt_id}>
                      <td data-label="Nxënësi">{attempt.student_name}</td>
                      <td data-label="Kodi" className="mono">{attempt.student_code}</td>
                      <td data-label="Statusi">
                        <span className={`attempt-pill ${attempt.status}`}>{statusLabel[attempt.status]}</span>
                      </td>
                      <td data-label="Progresi">{progressLabel(attempt)}</td>
                      <td data-label="Rezultati">
                        {attempt.status === "submitted"
                          ? `${attempt.score ?? 0}/${attempt.max_score ?? 0}`
                          : "—"}
                      </td>
                      <td data-label="Veprimet">
                        {attempt.status === "submitted" ? (
                          <button
                            type="button"
                            className="sb-btn sb-btn-secondary"
                            onClick={() => setExpandedAttemptId(
                              expandedAttemptId === attempt.attempt_id ? null : attempt.attempt_id
                            )}
                          >
                            Shiko përgjigjet
                          </button>
                        ) : (
                          <span className="muted-action">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!hasSubmittedStudents && (
              <div className="pending-results-note">
                Rezultatet do të shfaqen pasi të dorëzohet testi i parë.
              </div>
            )}
          </section>

          {hasSubmittedStudents && (
            <>
              <section className="session-panel results-panel">
                <div className="panel-title">Rezultatet e këtij testimi</div>
                <div className="results-list">
                  {submittedResults.map((attempt) => {
                    const studentAnalytics = analytics?.student_concept_stats.find((item) => item.student_id === attempt.student_id);
                    const expanded = expandedAttemptId === attempt.attempt_id;
                    return (
                      <div key={attempt.attempt_id} className="result-card">
                        <button
                          className="result-head"
                          onClick={() => setExpandedAttemptId(expanded ? null : attempt.attempt_id)}
                        >
                          <span>
                            <strong>{attempt.student_name}</strong>
                            <small>{session.test_title}: {attempt.score ?? 0}/{attempt.max_score ?? 0}</small>
                          </span>
                          <b style={{ color: rateColor(attempt.percentage) }}>{Math.round(attempt.percentage ?? 0)}%</b>
                        </button>

                        {studentAnalytics?.learning_gaps.length ? (
                          <div className="student-gaps">
                            {studentAnalytics.learning_gaps.map((gap) => (
                              <span key={gap.concept_id}>{gap.concept_name}: {gap.success_rate}%</span>
                            ))}
                          </div>
                        ) : (
                          <div className="student-gaps good">Nuk ka boshllëqe nën 60% në këtë testim.</div>
                        )}

                        {expanded && (
                          <div className="answer-list">
                            {attempt.answers.map((answer) => {
                              const answerKey = getAnswerKey(attempt.attempt_id, answer.answer_id);
                              const isEditing = editingAnswerKey === answerKey;
                              const studentAnswer = answer.selected_option_text || answer.written_answer || "—";
                              const finalFeedback = answer.feedback_for_teacher || "Nuk ka komente.";

                              return (
                                <div key={answerKey} className="answer-row answer-row-editable">
                                  <div className="answer-main">
                                    <strong>{answer.question_text}</strong>
                                    <span>{answer.concept_name}</span>
                                    <em>Përgjigjja e nxënësit: {studentAnswer}</em>

                                    <div className="ai-grade-detail">
                                      <span>
                                        {answer.needs_teacher_review
                                          ? "Kërkon rishikim nga mësimdhënësi"
                                          : answer.ai_feedback_for_teacher || answer.ai_confidence !== null
                                            ? "Vlerësimi fillestar nga AI"
                                            : "Vlerësuar nga sistemi"}
                                      </span>
                                      <em>Pikët nga AI: {answer.ai_points_earned}/{answer.max_points}</em>
                                      {answer.ai_feedback_for_teacher && (
                                        <em>Komenti i AI-së: {answer.ai_feedback_for_teacher}</em>
                                      )}
                                      {answer.ai_confidence !== null && (
                                        <em>Besueshmëria: {Math.round(answer.ai_confidence * 100)}%</em>
                                      )}
                                    </div>

                                    {answer.graded_by === "teacher" && (
                                      <div className="teacher-grade-detail">
                                        <span>Ndryshuar nga mësimdhënësi</span>
                                        <em>Komenti final: {finalFeedback}</em>
                                      </div>
                                    )}

                                    {isEditing && (
                                      <div className="override-editor">
                                        <label>
                                          Pikët
                                          <input
                                            type="number"
                                            min={0}
                                            max={answer.max_points}
                                            value={overrideDraft.points}
                                            onChange={(event) => setOverrideDraft((prev) => ({ ...prev, points: event.target.value }))}
                                          />
                                        </label>
                                        <label>
                                          Komenti për mësimdhënësin
                                          <textarea
                                            value={overrideDraft.feedback}
                                            onChange={(event) => setOverrideDraft((prev) => ({ ...prev, feedback: event.target.value }))}
                                          />
                                        </label>
                                        <div className="override-mark-row">
                                          <button
                                            type="button"
                                            className={`sb-btn ${overrideDraft.isCorrect ? "sb-btn-primary" : "sb-btn-secondary"}`}
                                            onClick={() => setOverrideDraft((prev) => ({
                                              ...prev,
                                              points: String(answer.max_points),
                                              isCorrect: true,
                                            }))}
                                          >
                                            Shëno saktë
                                          </button>
                                          <button
                                            type="button"
                                            className={`sb-btn ${!overrideDraft.isCorrect ? "sb-btn-primary" : "sb-btn-secondary"}`}
                                            onClick={() => setOverrideDraft((prev) => ({
                                              ...prev,
                                              points: "0",
                                              isCorrect: false,
                                            }))}
                                          >
                                            Shëno gabim
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="answer-side">
                                    <div className="answer-score">
                                      <b style={{ color: answer.is_correct ? "#16a34a" : "#dc2626" }}>
                                        {answer.points_earned}/{answer.max_points}
                                      </b>
                                      <span>Pikë finale</span>
                                    </div>
                                    <div className="answer-actions">
                                      {!isEditing ? (
                                        <>
                                          <button className="sb-btn sb-btn-secondary" onClick={() => startAnswerEdit(attempt.attempt_id, answer)}>
                                            Ndrysho pikët
                                          </button>
                                          <button className="sb-btn sb-btn-secondary" onClick={() => startAnswerEdit(attempt.attempt_id, answer)}>
                                            Ndrysho komentin
                                          </button>
                                          <button className="sb-btn sb-btn-secondary" onClick={() => startAnswerMark(attempt.attempt_id, answer, true)}>
                                            Shëno saktë
                                          </button>
                                          <button className="sb-btn sb-btn-secondary" onClick={() => startAnswerMark(attempt.attempt_id, answer, false)}>
                                            Shëno gabim
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            className="sb-btn sb-btn-primary"
                                            disabled={savingAnswerId === answer.answer_id}
                                            onClick={() => saveAnswerOverride(attempt.attempt_id, answer)}
                                          >
                                            {savingAnswerId === answer.answer_id ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                                          </button>
                                          <button className="sb-btn sb-btn-ghost" onClick={() => setEditingAnswerKey(null)}>
                                            Anulo
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="analysis-grid">
                <section className="session-panel ai-panel">
                  <div className="ai-panel-head">
                    <div>
                      <div className="panel-title">Analiza nga AI</div>
                      {aiAnalysis && (
                        <div className="ai-meta">
                          Modeli: {aiAnalysis.model_name} · Përditësuar: {new Date(aiAnalysis.updated_at).toLocaleString("sq-AL")}
                        </div>
                      )}
                    </div>
                    <div className="ai-actions">
                      {!aiAnalysis && (
                        <button className="sb-btn sb-btn-primary" onClick={() => handleAiAnalysis(false)} disabled={aiLoading || !hasSubmittedStudents}>
                          {aiLoading ? "Duke analizuar..." : "Analizo me AI"}
                        </button>
                      )}
                      {aiAnalysis && (
                        <button className="sb-btn sb-btn-secondary" onClick={() => handleAiAnalysis(true)} disabled={aiLoading || !hasSubmittedStudents}>
                          {aiLoading ? "Duke analizuar..." : "Regjenero analizën"}
                        </button>
                      )}
                      {aiAnalysis && (
                        <button className="sb-btn sb-btn-secondary" onClick={handleAiPdfDownload} disabled={aiPdfLoading}>
                          <Download size={14} /> {aiPdfLoading ? "Duke shkarkuar..." : "Shkarko PDF"}
                        </button>
                      )}
                    </div>
                  </div>

                  {aiLoading && (
                    <div className="ai-loading">Duke analizuar rezultatet...</div>
                  )}
                  {aiError && <div className="ai-error">{aiError}</div>}
                  {!aiAnalysis && !aiLoading && !aiError && (
                    <div className="compact-empty">
                      Analiza do të shfaqet këtu pasi të gjenerohet raporti nga AI.
                    </div>
                  )}
                  {aiAnalysis && (
                    <div className="ai-report">
                      {aiAnalysis.analysis_text}
                    </div>
                  )}
                </section>

                <section className="session-panel gaps-panel">
                  <div className="panel-title">
                    <CheckCircle2 size={18} /> Boshllëqet e identifikuara
                  </div>
                  {analytics?.classroom_gaps?.length ? (
                    <div className="gap-list">
                      {analytics.classroom_gaps.map((gap) => (
                        <div key={gap.concept_id} className="gap-row">
                          <div>
                            <strong>{gap.concept_name}</strong>
                            <span>{gap.points_earned}/{gap.max_points} pikë · {gap.students_struggled ?? 0}/{gap.students_total ?? 0} nxënës patën vështirësi</span>
                          </div>
                          <b style={{ color: rateColor(gap.success_rate) }}>{gap.success_rate}%</b>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="compact-empty">Nuk janë identifikuar boshllëqe të theksuara për këtë testim.</div>
                  )}
                </section>
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}

const sessionStyles = `
  .session-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 18px;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 18px 20px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    margin-bottom: 14px;
  }
  .session-code-area { min-width: 0; }
  .session-status {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 850;
    background: #f8fafc;
    color: #475569;
    margin-bottom: 12px;
  }
  .session-status.waiting { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
  .session-status.active { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  .session-status.paused { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
  .session-status.ended { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
  .session-code-label {
    color: #64748b;
    font-size: 12px;
    font-weight: 850;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .session-code-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 5px;
  }
  .session-code {
    color: #0f172a;
    font-size: 38px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0;
  }
  .copy-code-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid #dbe4ef;
    border-radius: 999px;
    background: #f8fafc;
    color: #334155;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 850;
    min-height: 34px;
    padding: 7px 11px;
  }
  .copy-code-btn:hover { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
  .session-link-row {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .session-link-row .sb-btn { min-height: 36px; }
  .session-controls {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
  }
  .session-controls .sb-btn { min-height: 38px; }
  .session-ended-note {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    border-radius: 999px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    font-size: 13px;
    font-weight: 850;
    padding: 8px 13px;
  }
  .session-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }
  .stat-tile,
  .session-panel,
  .waiting-empty {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.045);
  }
  .stat-tile { padding: 14px 15px; }
  .stat-tile span {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #64748b;
    font-size: 12px;
    font-weight: 850;
    margin-bottom: 6px;
  }
  .stat-tile span svg { color: #2563eb; }
  .stat-tile strong {
    display: block;
    color: #0f172a;
    font-size: 21px;
    font-weight: 900;
    line-height: 1.15;
  }
  .waiting-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 34px 24px;
  }
  .waiting-icon {
    display: grid;
    place-items: center;
    width: 58px;
    height: 58px;
    border-radius: 18px;
    background: #eff6ff;
    color: #2563eb;
    margin-bottom: 14px;
  }
  .waiting-empty h2 {
    color: #0f172a;
    font-size: 21px;
    font-weight: 900;
    margin: 0 0 8px;
  }
  .waiting-empty p {
    color: #64748b;
    font-size: 14px;
    line-height: 1.6;
    max-width: 660px;
    margin: 0;
  }
  .waiting-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 18px;
  }
  .session-panel {
    padding: 18px;
    margin-bottom: 14px;
  }
  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #0f172a;
    font-size: 14px;
    font-weight: 900;
    margin-bottom: 13px;
  }
  .session-table-wrap {
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    border-radius: 15px;
    background: #ffffff;
  }
  .session-table {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;
  }
  .session-table th {
    text-align: left;
    color: #64748b;
    background: #f8fafc;
    font-size: 11.5px;
    font-weight: 900;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    padding: 11px 12px;
    border-bottom: 1px solid #e5e7eb;
  }
  .session-table td {
    color: #334155;
    padding: 12px;
    border-bottom: 1px solid #eef2f7;
    font-size: 13.5px;
    vertical-align: middle;
  }
  .session-table tr:last-child td { border-bottom: 0; }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-weight: 850;
    color: #0f172a;
  }
  .attempt-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #475569;
    font-size: 12px;
    font-weight: 850;
    padding: 4px 9px;
    white-space: nowrap;
  }
  .attempt-pill.in_progress { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  .attempt-pill.submitted { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .muted-action { color: #94a3b8; font-weight: 800; }
  .pending-results-note,
  .compact-empty,
  .ai-loading,
  .ai-error {
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 13.5px;
    line-height: 1.55;
  }
  .pending-results-note {
    margin-top: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    font-weight: 750;
  }
  .compact-empty {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
  }
  .results-list,
  .gap-list,
  .answer-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .result-card {
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background: #ffffff;
  }
  .result-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    border: 0;
    background: #ffffff;
    cursor: pointer;
    padding: 14px 15px;
    text-align: left;
  }
  .result-head:hover { background: #f8fafc; }
  .result-head strong {
    display: block;
    color: #0f172a;
    font-size: 14px;
    font-weight: 900;
  }
  .result-head small {
    display: block;
    color: #64748b;
    font-size: 12.5px;
    margin-top: 3px;
  }
  .student-gaps {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 15px 13px;
  }
  .student-gaps span,
  .student-gaps.good {
    border-radius: 999px;
    background: #fef2f2;
    color: #b91c1c;
    font-size: 12px;
    font-weight: 850;
    padding: 5px 9px;
  }
  .student-gaps.good { background: #f0fdf4; color: #15803d; }
  .answer-list { padding: 0 15px 15px; }
  .answer-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 15px;
    background: #f8fafc;
    padding: 12px;
  }
  .answer-main { flex: 1; min-width: 0; }
  .answer-main strong {
    display: block;
    color: #0f172a;
    font-size: 13.5px;
    font-weight: 900;
  }
  .answer-main span,
  .answer-main em {
    display: block;
    color: #64748b;
    font-size: 12.5px;
    font-style: normal;
    margin-top: 4px;
  }
  .ai-grade-detail,
  .teacher-grade-detail {
    margin-top: 10px;
    border-left: 3px solid #8b5cf6;
    padding-left: 10px;
  }
  .ai-grade-detail span { color: #6d28d9; font-weight: 900; }
  .teacher-grade-detail { border-left-color: #22c55e; }
  .teacher-grade-detail span { color: #15803d; font-weight: 900; }
  .answer-side {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 9px;
    width: 158px;
    flex-shrink: 0;
  }
  .answer-score {
    border-radius: 13px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 9px 10px;
    text-align: center;
  }
  .answer-score b {
    display: block;
    font-size: 15px;
    font-weight: 900;
  }
  .answer-score span {
    display: block;
    color: #94a3b8;
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .answer-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .answer-actions .sb-btn {
    justify-content: center;
    min-height: 34px;
    padding: 7px 9px;
    font-size: 12px;
  }
  .override-editor {
    display: grid;
    grid-template-columns: minmax(90px, 0.24fr) minmax(180px, 1fr);
    align-items: start;
    gap: 10px;
    margin-top: 10px;
  }
  .override-editor label {
    display: flex;
    flex-direction: column;
    gap: 5px;
    color: #475569;
    font-size: 12px;
    font-weight: 850;
  }
  .override-editor input[type="number"],
  .override-editor textarea {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    background: #ffffff;
    color: #0f172a;
    font: inherit;
    font-size: 13px;
    padding: 9px 10px;
  }
  .override-editor textarea {
    min-height: 76px;
    resize: vertical;
  }
  .override-mark-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    grid-column: 1 / -1;
  }
  .override-mark-row .sb-btn {
    min-height: 34px;
    padding: 7px 10px;
    font-size: 12px;
  }
  .analysis-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 0.82fr);
    gap: 14px;
    align-items: start;
  }
  .ai-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .ai-panel-head .panel-title { margin-bottom: 4px; }
  .ai-meta {
    color: #64748b;
    font-size: 12px;
    font-weight: 750;
  }
  .ai-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ai-loading {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
    font-weight: 850;
  }
  .ai-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }
  .ai-report {
    white-space: pre-wrap;
    color: #0f172a;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 15px;
    padding: 14px;
    font-size: 13.5px;
    line-height: 1.65;
  }
  .gap-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 15px;
    background: #f8fafc;
    padding: 12px;
  }
  .gap-row strong {
    display: block;
    color: #0f172a;
    font-size: 13.5px;
    font-weight: 900;
  }
  .gap-row span {
    display: block;
    color: #64748b;
    font-size: 12.5px;
    line-height: 1.45;
    margin-top: 3px;
  }
  @media (max-width: 980px) {
    .session-hero { grid-template-columns: 1fr; }
    .session-controls { justify-content: flex-start; }
    .session-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .analysis-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .session-table-wrap {
      overflow: visible;
      border: 0;
      background: transparent;
    }
    .session-table,
    .session-table tbody,
    .session-table tr,
    .session-table td {
      display: block;
      width: 100%;
    }
    .session-table {
      min-width: 0;
      border-collapse: separate;
      border-spacing: 0;
    }
    .session-table thead { display: none; }
    .session-table tr {
      border: 1px solid #e5e7eb;
      border-radius: 15px;
      background: #ffffff;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .session-table tr:last-child { margin-bottom: 0; }
    .session-table td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      border: 0;
      padding: 8px 0;
      text-align: right;
    }
    .session-table td::before {
      content: attr(data-label);
      color: #64748b;
      font-size: 12px;
      font-weight: 900;
      text-align: left;
      text-transform: uppercase;
    }
    .session-table td:first-child {
      color: #0f172a;
      font-weight: 900;
      text-align: left;
    }
    .session-table td:first-child::before { display: none; }
    .session-table td:last-child {
      align-items: stretch;
      flex-direction: column;
      text-align: left;
    }
    .session-table td:last-child .sb-btn {
      justify-content: center;
      width: 100%;
    }
  }
  @media (max-width: 560px) {
    .session-hero,
    .session-panel,
    .waiting-empty {
      border-radius: 16px;
      padding: 15px;
    }
    .session-code { font-size: 32px; }
    .session-controls,
    .session-controls .sb-btn,
    .session-link-row,
    .session-link-row .sb-btn,
    .waiting-actions,
    .waiting-actions .sb-btn,
    .ai-actions,
    .ai-actions .sb-btn {
      width: 100%;
    }
    .session-controls .sb-btn,
    .session-link-row .sb-btn,
    .waiting-actions .sb-btn,
    .ai-actions .sb-btn {
      justify-content: center;
    }
    .session-stats { grid-template-columns: 1fr; }
    .answer-row { flex-direction: column; }
    .answer-side { width: 100%; }
    .answer-score { text-align: left; }
    .override-editor { grid-template-columns: 1fr; }
  }
`;

export default TestSessionControl;
