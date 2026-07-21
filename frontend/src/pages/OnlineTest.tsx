import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, PauseCircle, Send } from "lucide-react";
import { getErrorMessage } from "../services/errors";

import {
  getOnlineAttempt,
  joinOnlineTest,
  saveOnlineAttemptAnswer,
  submitOnlineAttempt,
} from "../services/onlineTestService";
import logoUrl from "../images/logo.png";

type PublicOption = { id: number; option_text: string };
type PublicQuestion = {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  options: PublicOption[];
};
type PublicSavedAnswer = {
  question_id: number;
  selected_option_id?: number | null;
  written_answer?: string | null;
};
type PublicAttempt = {
  attempt_id: number;
  session_code: string;
  session_status: "waiting" | "active" | "paused" | "ended";
  attempt_status: "joined" | "in_progress" | "submitted";
  test_title: string;
  questions: PublicQuestion[];
  saved_answers: PublicSavedAnswer[];
};

type AnswerState = Record<number, { selected_option_id?: number | null; written_answer?: string | null }>;

const savedAnswersToState = (savedAnswers: PublicSavedAnswer[] = []) =>
  savedAnswers.reduce<AnswerState>((acc, answer) => {
    acc[answer.question_id] = {
      selected_option_id: answer.selected_option_id ?? null,
      written_answer: answer.written_answer ?? "",
    };
    return acc;
  }, {});

function OnlineTest() {
  const { sessionCode } = useParams();
  const [searchParams] = useSearchParams();

  const initialCode = sessionCode || searchParams.get("code") || "";
  const [sessionInput, setSessionInput] = useState(initialCode.toUpperCase());
  const [studentCode, setStudentCode] = useState("");
  const [attempt, setAttempt] = useState<PublicAttempt | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const autosaveTimers = useRef<Record<number, number>>({});

  const answeredCount = useMemo(() => {
    if (!attempt) return 0;
    return attempt.questions.filter((question) => {
      const answer = answers[question.id];
      if (question.options.length > 0) return !!answer?.selected_option_id;
      return !!answer?.written_answer?.trim();
    }).length;
  }, [answers, attempt]);

  useEffect(() => {
    if (!attempt || success || attempt.attempt_status === "submitted") return;
    const interval = window.setInterval(async () => {
      try {
        const response = await getOnlineAttempt(attempt.attempt_id);
        setAttempt(response.data);
        if (response.data.attempt_status === "submitted") {
          setSuccess(true);
        }
      } catch {
        setError("Dështoi rifreskimi i statusit të testit.");
      }
    }, 3000);
    return () => window.clearInterval(interval);
  }, [attempt, success]);

  useEffect(() => {
    const timers = autosaveTimers.current;
    return () => {
      Object.values(timers).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const saveDraftAnswer = useCallback((
    questionId: number,
    answer: { selected_option_id?: number | null; written_answer?: string | null },
    delay = 0,
  ) => {
    if (!attempt || success || attempt.attempt_status === "submitted") return;

    if (autosaveTimers.current[questionId]) {
      window.clearTimeout(autosaveTimers.current[questionId]);
    }

    const persist = async () => {
      try {
        await saveOnlineAttemptAnswer(attempt.attempt_id, {
          question_id: questionId,
          selected_option_id: answer.selected_option_id ?? null,
          written_answer: answer.written_answer ?? null,
        });
      } catch {
        setError("Dështoi ruajtja automatike e përgjigjes.");
      }
    };

    autosaveTimers.current[questionId] = window.setTimeout(persist, delay);
  }, [attempt, success]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await joinOnlineTest(sessionInput.trim().toUpperCase(), studentCode.trim());
      setAttempt(response.data);
      setAnswers(savedAnswersToState(response.data.saved_answers));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Kodi i testimit ose kodi i nxënësit nuk është i saktë."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    setError("");

    if (answeredCount !== attempt.questions.length) {
      setError("Plotësoni të gjitha pyetjet para dorëzimit.");
      return;
    }

    setSubmitting(true);
    try {
      Object.values(autosaveTimers.current).forEach((timer) => window.clearTimeout(timer));
      const payload = attempt.questions.map((question) => ({
        question_id: question.id,
        selected_option_id: answers[question.id]?.selected_option_id ?? null,
        written_answer: answers[question.id]?.written_answer?.trim() || null,
      }));
      await submitOnlineAttempt(attempt.attempt_id, payload);
      setSuccess(true);
      setAttempt({ ...attempt, attempt_status: "submitted", questions: [] });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Dështoi dorëzimi i testit."));
    } finally {
      setSubmitting(false);
    }
  };

  const setOptionAnswer = (questionId: number, optionId: number) => {
    const answer = { selected_option_id: optionId, written_answer: null };
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    saveDraftAnswer(questionId, answer);
  };

  const setWrittenAnswer = (questionId: number, value: string) => {
    const answer = { selected_option_id: null, written_answer: value };
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    saveDraftAnswer(questionId, answer, 650);
  };

  const renderStatusScreen = () => {
    if (!attempt) return null;

    if (success || attempt.attempt_status === "submitted") {
      return (
        <div className="public-card center">
          <div className="status-icon success"><CheckCircle2 size={34} /></div>
          <h1>{"Testi u dor\u00ebzua me sukses."}</h1>
        </div>
      );
    }

    if (attempt.session_status === "waiting") {
      return (
        <div className="public-card center">
          <div className="status-icon"><Clock size={34} /></div>
          <h1>Në pritje</h1>
          <p>Testi do të hapet kur mësuesi të fillojë testimin.</p>
        </div>
      );
    }

    if (attempt.session_status === "paused") {
      return (
        <div className="public-card center">
          <div className="status-icon paused"><PauseCircle size={34} /></div>
          <h1>Testi është pauzuar</h1>
          <p>Prisni derisa mësuesi ta vazhdojë testin.</p>
        </div>
      );
    }

    if (attempt.session_status === "ended") {
      return (
        <div className="public-card center">
          <div className="status-icon ended"><PauseCircle size={34} /></div>
          <h1>Testi është mbyllur</h1>
          <p>Nuk mund të vazhdoni këtë test.</p>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <style>{publicStyles}</style>
      <div className="public-shell">
        <div className="public-top">
          <img src={logoUrl} alt="SchoolBridge" />
          <span>SchoolBridge</span>
        </div>

        {!attempt ? (
          <form className="public-card join-card" onSubmit={handleJoin}>
            <h1>Hyr në testin në internet</h1>
            <div className="public-field">
              <label>Kodi i testimit</label>
              <input
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value.toUpperCase())}
                placeholder="p.sh. A7K2Q9"
                required
              />
            </div>
            <div className="public-field">
              <label>Kodi i nxënësit</label>
              <input
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="p.sh. 287339"
                inputMode="numeric"
                required
              />
            </div>
            {error && <div className="public-error">{error}</div>}
            <button className="public-btn" disabled={loading}>
              {loading ? "Duke kontrolluar…" : "Hyr në testim"}
            </button>
          </form>
        ) : attempt.session_status !== "active" || success || attempt.attempt_status === "submitted" ? (
          <>
            {renderStatusScreen()}
            {error && <div className="public-error outside">{error}</div>}
          </>
        ) : (
          <div className="test-wrap">
            <div className="test-head">
              <div>
                <span className="test-code">{attempt.session_code}</span>
                <h1>{attempt.test_title}</h1>
              </div>
              <div className="progress-pill">{answeredCount}/{attempt.questions.length}</div>
            </div>

            <div className="question-stack">
              {attempt.questions.map((question, index) => (
                <div key={question.id} className="question-box">
                  <div className="question-top">
                    <span>{index + 1}</span>
                    <strong>{question.points} pikë</strong>
                  </div>
                  <div className="question-text">{question.question_text}</div>
                  {question.options.length > 0 ? (
                    <div className="option-list">
                      {question.options.map((option, optionIndex) => (
                        <button
                          type="button"
                          key={option.id}
                          className={`option-btn${answers[question.id]?.selected_option_id === option.id ? " selected" : ""}`}
                          onClick={() => setOptionAnswer(question.id, option.id)}
                        >
                          <span>{String.fromCharCode(65 + optionIndex)}</span>
                          {option.option_text}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="written-answer"
                      value={answers[question.id]?.written_answer ?? ""}
                      onChange={(e) => setWrittenAnswer(question.id, e.target.value)}
                      placeholder="Shkruani përgjigjen këtu"
                    />
                  )}
                </div>
              ))}
            </div>

            {error && <div className="public-error">{error}</div>}
            <div className="submit-bar-public">
              <span>{attempt.questions.length - answeredCount} pyetje të paplotësuara</span>
              <button className="public-btn" onClick={handleSubmit} disabled={submitting}>
                <Send size={15} /> {submitting ? "Duke dorëzuar…" : "Dorëzo testin"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const publicStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    background:
      radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 30rem),
      radial-gradient(circle at top right, rgba(219,234,254,0.56), transparent 34rem),
      #f3f4f6;
  }
  .public-shell { min-height: 100svh; width: min(860px, 100%); margin: 0 auto; padding: 24px; color: #0f172a; font-family: Inter, system-ui, sans-serif; }
  .public-top { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; font-weight: 850; }
  .public-top img { width: 36px; height: 36px; object-fit: contain; border-radius: 12px; background: rgba(255,255,255,0.7); padding: 6px; border: 1px solid rgba(255,255,255,0.72); }
  .public-card {
    background: rgba(255,255,255,0.68); border: 1px solid rgba(255,255,255,0.76); border-radius: 22px;
    box-shadow: 0 18px 44px rgba(15,23,42,0.08); backdrop-filter: blur(18px); padding: 24px;
  }
  .join-card { max-width: 420px; margin: 8vh auto 0; }
  .public-card h1, .test-head h1 { font-size: 22px; margin: 0 0 18px; letter-spacing: 0; color: #0f172a; }
  .public-field { margin-bottom: 14px; }
  .public-field label { display: block; font-size: 12.5px; font-weight: 850; color: #475569; margin-bottom: 6px; }
  .public-field input, .written-answer {
    width: 100%; border: 1px solid rgba(226,232,240,0.9); border-radius: 15px; background: rgba(255,255,255,0.76);
    padding: 11px 12px; font-size: 14px; outline: none; color: #0f172a;
  }
  .public-field input:focus, .written-answer:focus { border-color: #93c5fd; box-shadow: 0 0 0 4px rgba(147,197,253,0.22); }
  .public-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px; width: 100%;
    border: none; border-radius: 15px; background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff; padding: 11px 16px; font-size: 13.5px; font-weight: 850; cursor: pointer;
    box-shadow: 0 12px 26px rgba(37,99,235,0.22);
  }
  .public-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .public-error { background: #fff5f5; border: 1px solid #fecaca; color: #dc2626; border-radius: 15px; padding: 10px 12px; font-size: 13px; margin: 12px 0; }
  .public-error.outside { max-width: 420px; margin: 12px auto; }
  .center { text-align: center; max-width: 480px; margin: 10vh auto 0; }
  .center h1 { margin-bottom: 8px; }
  .center p { color: #64748b; margin: 0; }
  .status-icon { width: 64px; height: 64px; border-radius: 22px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; background: #dbeafe; color: #2563eb; }
  .status-icon.success { background: #dcfce7; color: #15803d; }
  .status-icon.paused { background: #fef3c7; color: #b45309; }
  .status-icon.ended { background: #fee2e2; color: #b91c1c; }
  .test-wrap { display: flex; flex-direction: column; gap: 14px; }
  .test-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; background: rgba(255,255,255,0.68); border: 1px solid rgba(255,255,255,0.76); border-radius: 22px; padding: 20px; box-shadow: 0 18px 44px rgba(15,23,42,0.08); }
  .test-head h1 { margin: 5px 0 0; }
  .test-code { font-size: 12px; font-weight: 850; color: #2563eb; background: #eff6ff; border-radius: 999px; padding: 5px 9px; }
  .progress-pill { border-radius: 999px; background: #f1f5f9; color: #475569; font-weight: 850; padding: 7px 12px; }
  .question-stack { display: flex; flex-direction: column; gap: 12px; }
  .question-box { background: rgba(255,255,255,0.68); border: 1px solid rgba(255,255,255,0.76); border-radius: 22px; padding: 18px; box-shadow: 0 12px 30px rgba(15,23,42,0.06); }
  .question-top { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
  .question-top span { width: 28px; height: 28px; border-radius: 10px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 850; }
  .question-top strong { font-size: 12.5px; color: #64748b; }
  .question-text { font-size: 15px; line-height: 1.55; margin-bottom: 14px; }
  .option-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .option-btn { display: flex; align-items: center; gap: 9px; text-align: left; border: 1px solid rgba(226,232,240,0.9); border-radius: 15px; padding: 11px; background: rgba(255,255,255,0.62); color: #0f172a; font-weight: 750; cursor: pointer; }
  .option-btn span { width: 24px; height: 24px; border-radius: 8px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 850; flex-shrink: 0; }
  .option-btn.selected { border-color: #93c5fd; background: #eff6ff; }
  .option-btn.selected span { background: #2563eb; color: #fff; }
  .written-answer { min-height: 120px; resize: vertical; }
  .submit-bar-public { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(255,255,255,0.68); border: 1px solid rgba(255,255,255,0.76); border-radius: 20px; padding: 14px; position: sticky; bottom: 12px; box-shadow: 0 18px 44px rgba(15,23,42,0.1); }
  .submit-bar-public span { color: #64748b; font-size: 13px; font-weight: 750; }
  .submit-bar-public .public-btn { width: auto; }
  @media (max-width: 640px) {
    .public-shell { padding: 16px; }
    .option-list { grid-template-columns: 1fr; }
    .test-head, .submit-bar-public { flex-direction: column; align-items: stretch; }
    .submit-bar-public .public-btn { width: 100%; }
  }
`;

export default OnlineTest;
