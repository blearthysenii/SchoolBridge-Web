import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clipboard, Pause, Play, RotateCcw, Square, Users } from "lucide-react";

import api from "../services/api";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import {
  endTestSession,
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
  active: "Aktive",
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
  const [aiError, setAiError] = useState("");
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
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAiAnalysis(null);
        return;
      }
      setAiError(err.response?.data?.detail || "Dështoi ngarkimi i analizës nga AI.");
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

  const runAction = async (label: string, action: () => Promise<any>) => {
    if (!session) return;
    setActionLoading(label);
    setAlert(null);
    try {
      await action();
      await loadData(false);
      setAlert({ type: "success", text: "Seanca u përditësua me sukses." });
    } catch (err: any) {
      setAlert({ type: "error", text: err.response?.data?.detail || "Veprimi dështoi." });
    } finally {
      setActionLoading("");
    }
  };

  const copyStudentLink = async () => {
    if (!studentLink) return;
    await navigator.clipboard.writeText(studentLink);
    setAlert({ type: "success", text: "Linku i testit u kopjua." });
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
    } catch (err: any) {
      setAiError(err.response?.data?.detail || "Dështoi analiza nga AI.");
    } finally {
      setAiLoading(false);
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
    } catch (err: any) {
      setAlert({ type: "error", text: err.response?.data?.detail || "Dështoi ruajtja e vlerësimit." });
    } finally {
      setSavingAnswerId(null);
    }
  };

  if (loading) {
    return (
      <Layout title="Seanca online" backTo="/dashboard" backLabel="Paneli" user={user}>
        <LoadingSpinner text="Duke ngarkuar seancën online…" />
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout title="Seanca online" backTo="/dashboard" backLabel="Paneli" user={user}>
        <Alert type="error" message="Seanca nuk u gjet." />
      </Layout>
    );
  }

  const submittedResults = results?.results.filter((item) => item.status === "submitted") ?? [];

  return (
    <Layout
      title={session.test_title}
      subtitle={`${session.classroom_name} · Seancë online`}
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

      <div className="session-hero">
        <div>
          <div className={`session-status ${session.status}`}>{statusLabel[session.status]}</div>
          <div className="session-code-label">Kodi i seancës</div>
          <div className="session-code">{session.session_code}</div>
          <div className="session-link-row">
            <span>{studentLink}</span>
            <button className="sb-btn sb-btn-ghost" onClick={copyStudentLink}>
              <Clipboard size={14} /> Kopjo linkun
            </button>
          </div>
        </div>

        <div className="session-controls">
          <button
            className="sb-btn sb-btn-primary"
            disabled={session.status !== "waiting" || !!actionLoading}
            onClick={() => runAction("start", () => startTestSession(session.id))}
          >
            <Play size={15} /> {actionLoading === "start" ? "Duke nisur…" : "Start"}
          </button>
          <button
            className="sb-btn sb-btn-secondary"
            disabled={session.status !== "active" || !!actionLoading}
            onClick={() => runAction("pause", () => pauseTestSession(session.id))}
          >
            <Pause size={15} /> Pause
          </button>
          <button
            className="sb-btn sb-btn-secondary"
            disabled={session.status !== "paused" || !!actionLoading}
            onClick={() => runAction("resume", () => resumeTestSession(session.id))}
          >
            <RotateCcw size={15} /> Resume
          </button>
          <button
            className="sb-btn sb-btn-danger"
            disabled={session.status === "ended" || !!actionLoading}
            onClick={() => runAction("end", () => endTestSession(session.id))}
          >
            <Square size={14} /> End
          </button>
        </div>
      </div>

      <div className="session-stats">
        <div className="stat-tile">
          <span>Nxënës në klasë</span>
          <strong>{analytics?.total_students ?? 0}</strong>
        </div>
        <div className="stat-tile">
          <span>U bashkuan</span>
          <strong>{analytics?.joined_count ?? 0}</strong>
        </div>
        <div className="stat-tile">
          <span>Dorëzuan</span>
          <strong>{analytics?.submitted_count ?? 0}</strong>
        </div>
        <div className="stat-tile">
          <span>Mesatarja</span>
          <strong>{analytics?.average_score ?? 0}%</strong>
        </div>
      </div>

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
              <button className="sb-btn sb-btn-primary" onClick={() => handleAiAnalysis(false)} disabled={aiLoading}>
                {aiLoading ? "Duke analizuar..." : "Analizo me AI"}
              </button>
            )}
            {aiAnalysis && (
              <button className="sb-btn sb-btn-secondary" onClick={() => handleAiAnalysis(true)} disabled={aiLoading}>
                {aiLoading ? "Duke analizuar..." : "Regjenero Analizën"}
              </button>
            )}
          </div>
        </div>

        {aiLoading && (
          <div className="ai-loading">Duke analizuar rezultatet...</div>
        )}
        {aiError && <div className="ai-error">{aiError}</div>}
        {!aiAnalysis && !aiLoading && !aiError && (
          <div className="empty-box">
            Krijo një raport me rekomandime për këtë seancë duke përdorur rezultatet ekzistuese.
          </div>
        )}
        {aiAnalysis && (
          <div className="ai-report">
            {aiAnalysis.analysis_text}
          </div>
        )}
      </section>

      <div className="session-grid">
        <section className="session-panel">
          <div className="panel-title">
            <Users size={18} /> Nxënësit në seancë
          </div>
          {session.attempts.length === 0 ? (
            <div className="empty-box">Asnjë nxënës nuk është bashkuar ende.</div>
          ) : (
            <div className="session-table-wrap">
              <table className="session-table">
                <thead>
                  <tr>
                    <th>Nxënësi</th>
                    <th>Kodi</th>
                    <th>Statusi</th>
                    <th>Rezultati</th>
                  </tr>
                </thead>
                <tbody>
                  {session.attempts.map((attempt) => (
                    <tr key={attempt.attempt_id}>
                      <td>{attempt.student_name}</td>
                      <td className="mono">{attempt.student_code}</td>
                      <td><span className={`attempt-pill ${attempt.status}`}>{statusLabel[attempt.status]}</span></td>
                      <td>
                        {attempt.status === "submitted"
                          ? `${attempt.score ?? 0}/${attempt.max_score ?? 0}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="session-panel">
          <div className="panel-title">
            <CheckCircle2 size={18} /> Boshllëqet e seancës
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
            <div className="empty-box">Boshllëqet do të shfaqen pasi nxënësit të dorëzojnë testin.</div>
          )}
        </section>
      </div>

      <section className="session-panel results-panel">
        <div className="panel-title">Rezultatet për këtë test / seancë</div>
        {submittedResults.length === 0 ? (
          <div className="empty-box">Ende nuk ka dorëzime për këtë seancë.</div>
        ) : (
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
                    <div className="student-gaps good">Nuk ka boshllëqe nën 60% në këtë seancë.</div>
                  )}

                  {expanded && (
                    <div className="answer-list">
                      {attempt.answers.map((answer) => {
                        const answerKey = getAnswerKey(attempt.attempt_id, answer.answer_id);
                        const isEditing = editingAnswerKey === answerKey;
                        const studentAnswer = answer.selected_option_text || answer.written_answer || "—";
                        const finalFeedback = answer.feedback_for_teacher || "Nuk ka feedback.";

                        return (
                          <div key={answerKey} className="answer-row answer-row-editable">
                            <div className="answer-main">
                              <strong>{answer.question_text}</strong>
                              <span>{answer.concept_name}</span>
                              <em>Përgjigjja e nxënësit: {studentAnswer}</em>

                              <div className="ai-grade-detail">
                                <span>{answer.ai_feedback_for_teacher || answer.ai_confidence !== null ? "Vlerësimi fillestar nga AI" : "Vlerësuar nga sistemi"}</span>
                                <em>AI Score: {answer.ai_points_earned}/{answer.max_points}</em>
                                {answer.ai_feedback_for_teacher && (
                                  <em>AI Feedback: {answer.ai_feedback_for_teacher}</em>
                                )}
                                {answer.ai_confidence !== null && (
                                  <em>Besueshmëria: {Math.round(answer.ai_confidence * 100)}%</em>
                                )}
                              </div>

                              {answer.graded_by === "teacher" && (
                                <div className="teacher-grade-detail">
                                  <span>Ndryshuar nga profesori</span>
                                  <em>Feedback final: {finalFeedback}</em>
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
                                    Feedback për profesorin
                                    <textarea
                                      value={overrideDraft.feedback}
                                      onChange={(event) => setOverrideDraft((prev) => ({ ...prev, feedback: event.target.value }))}
                                    />
                                  </label>
                                  <label className="override-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={overrideDraft.isCorrect}
                                      onChange={(event) => setOverrideDraft((prev) => ({ ...prev, isCorrect: event.target.checked }))}
                                    />
                                    Shëno si përgjigje e saktë
                                  </label>
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
                                      Ndrysho feedback-un
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
        )}
      </section>
    </Layout>
  );
}

const sessionStyles = `
  .session-hero {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap;
    background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
    border-radius: 22px; padding: 22px; box-shadow: 0 16px 38px rgba(15,23,42,0.07);
    margin-bottom: 16px;
  }
  .session-status { display: inline-flex; border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 800; margin-bottom: 12px; background: #f1f5f9; color: #475569; }
  .session-status.active { background: #dcfce7; color: #15803d; }
  .session-status.paused { background: #fef3c7; color: #b45309; }
  .session-status.ended { background: #fee2e2; color: #b91c1c; }
  .session-code-label { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
  .session-code { font-size: 42px; line-height: 1; font-weight: 850; color: #0f172a; letter-spacing: 0; margin-top: 6px; }
  .session-link-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 12px; color: #64748b; font-size: 13px; }
  .session-link-row span { word-break: break-all; }
  .session-controls { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .session-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
  .stat-tile, .session-panel {
    background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.74);
    border-radius: 22px; box-shadow: 0 16px 38px rgba(15,23,42,0.07); backdrop-filter: blur(18px);
  }
  .stat-tile { padding: 16px 18px; }
  .stat-tile span { display: block; font-size: 12px; color: #64748b; font-weight: 800; margin-bottom: 5px; }
  .stat-tile strong { font-size: 24px; color: #0f172a; }
  .session-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr); gap: 16px; align-items: start; }
  .session-panel { padding: 18px; margin-bottom: 16px; }
  .panel-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 850; color: #0f172a; margin-bottom: 14px; }
  .ai-panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 12px; }
  .ai-panel-head .panel-title { margin-bottom: 4px; }
  .ai-meta { color: #64748b; font-size: 12px; font-weight: 700; }
  .ai-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .ai-loading { color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 12px 14px; font-size: 13.5px; font-weight: 800; }
  .ai-error { color: #dc2626; background: #fff5f5; border: 1px solid #fecaca; border-radius: 16px; padding: 12px 14px; font-size: 13px; }
  .ai-report {
    white-space: pre-wrap;
    line-height: 1.65;
    color: #0f172a;
    background: rgba(255,255,255,0.52);
    border: 1px solid rgba(226,232,240,0.78);
    border-radius: 18px;
    padding: 16px;
    font-size: 13.5px;
  }
  .session-table-wrap { overflow-x: auto; }
  .session-table { width: 100%; border-collapse: collapse; min-width: 540px; }
  .session-table th { text-align: left; color: #64748b; font-size: 11.5px; text-transform: uppercase; padding: 10px 8px; border-bottom: 1px solid rgba(226,232,240,0.8); }
  .session-table td { padding: 11px 8px; border-bottom: 1px solid rgba(241,245,249,0.9); font-size: 13.5px; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 800; }
  .attempt-pill { display: inline-flex; padding: 4px 9px; border-radius: 999px; font-size: 12px; font-weight: 800; background: #f1f5f9; color: #475569; }
  .attempt-pill.in_progress { background: #dbeafe; color: #1d4ed8; }
  .attempt-pill.submitted { background: #dcfce7; color: #15803d; }
  .empty-box { border: 1px dashed rgba(148,163,184,0.58); border-radius: 18px; padding: 18px; color: #64748b; text-align: center; font-size: 13.5px; }
  .gap-list, .results-list, .answer-list { display: flex; flex-direction: column; gap: 10px; }
  .gap-row, .answer-row {
    display: flex; justify-content: space-between; gap: 14px; align-items: flex-start;
    border: 1px solid rgba(226,232,240,0.78); border-radius: 16px; padding: 12px; background: rgba(255,255,255,0.48);
  }
  .answer-row-editable { gap: 16px; }
  .answer-main { flex: 1; min-width: 0; }
  .answer-side { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 148px; }
  .gap-row strong, .answer-row strong { display: block; color: #0f172a; font-size: 13.5px; }
  .gap-row span, .answer-row span, .answer-row em { display: block; color: #64748b; font-size: 12.5px; margin-top: 3px; font-style: normal; }
  .answer-score { flex-shrink: 0; text-align: right; min-width: 64px; }
  .answer-score b { display: block; font-size: 14px; }
  .answer-score span { margin-top: 2px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
  .ai-grade-detail, .teacher-grade-detail {
    margin-top: 8px;
    border-left: 3px solid #93c5fd;
    padding-left: 10px;
  }
  .ai-grade-detail span { color: #1d4ed8; font-weight: 850; }
  .teacher-grade-detail { border-left-color: #86efac; }
  .teacher-grade-detail span { color: #15803d; font-weight: 850; }
  .answer-actions { display: flex; flex-direction: column; gap: 6px; align-items: stretch; width: 100%; }
  .answer-actions .sb-btn { justify-content: center; min-height: 34px; padding: 7px 10px; font-size: 12px; }
  .override-editor {
    margin-top: 10px;
    display: grid;
    grid-template-columns: minmax(90px, 0.24fr) minmax(180px, 1fr);
    gap: 10px;
    align-items: start;
  }
  .override-editor label { display: flex; flex-direction: column; gap: 5px; color: #475569; font-size: 12px; font-weight: 850; }
  .override-editor input[type="number"], .override-editor textarea {
    width: 100%;
    border: 1px solid rgba(203,213,225,0.95);
    border-radius: 12px;
    background: rgba(255,255,255,0.86);
    color: #0f172a;
    font: inherit;
    font-size: 13px;
    padding: 9px 10px;
  }
  .override-editor textarea { min-height: 76px; resize: vertical; }
  .override-checkbox { grid-column: 1 / -1; flex-direction: row !important; align-items: center; }
  .override-checkbox input { width: 16px; height: 16px; }
  .result-card { border: 1px solid rgba(226,232,240,0.78); border-radius: 18px; background: rgba(255,255,255,0.48); overflow: hidden; }
  .result-head { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px; border: none; background: transparent; text-align: left; cursor: pointer; }
  .result-head strong { display: block; color: #0f172a; font-size: 14px; }
  .result-head small { display: block; color: #64748b; margin-top: 2px; }
  .student-gaps { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 14px 14px; }
  .student-gaps span, .student-gaps.good { font-size: 12px; font-weight: 800; color: #b91c1c; background: #fee2e2; border-radius: 999px; padding: 5px 9px; }
  .student-gaps.good { color: #15803d; background: #dcfce7; }
  .answer-list { padding: 0 14px 14px; }
  @media (max-width: 980px) {
    .session-grid { grid-template-columns: 1fr; }
    .session-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 560px) {
    .session-code { font-size: 32px; }
    .session-controls .sb-btn { flex: 1; justify-content: center; }
    .answer-row-editable { flex-direction: column; }
    .answer-side { width: 100%; align-items: stretch; }
    .answer-score { text-align: left; }
    .override-editor { grid-template-columns: 1fr; }
  }
`;

export default TestSessionControl;
