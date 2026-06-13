import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getClassrooms } from "../services/classroomService";
import { getStudentsByClassroom } from "../services/studentService";
import { getTestsByClassroom } from "../services/testService";
import { getQuestionsByTest } from "../services/questionService";
import { submitBatchResults } from "../services/resultService";

type Classroom = {
  id: number;
  name: string;
  grade: number;
};

type Student = {
  id: number;
  full_name: string;
};

type Test = {
  id: number;
  title: string;
};

type Question = {
  id: number;
  question_text: string;
  concept_id: number;
};

type BatchResultResponse = {
  submitted: number;
  correct: number;
  incorrect: number;
  score: number;
};

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

  const [result, setResult] = useState<BatchResultResponse | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    getClassrooms().then((res) => setClassrooms(res.data));
  }, []);

  const handleClassroomChange = async (value: string) => {
    const classroomId = value ? Number(value) : "";
    setSelectedClassroomId(classroomId);
    setSelectedStudentId("");
    setSelectedTestId("");
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setError("");

    if (!classroomId) {
      setStudents([]);
      setTests([]);
      return;
    }

    try {
      const [studentsRes, testsRes] = await Promise.all([
        getStudentsByClassroom(String(classroomId)),
        getTestsByClassroom(classroomId),
      ]);
      setStudents(studentsRes.data);
      setTests(testsRes.data);
    } catch {
      setError("Failed to load classroom data. Please try again.");
    }
  };

  const handleTestChange = async (value: string) => {
    const testId = value ? Number(value) : "";
    setSelectedTestId(testId);
    setAnswers({});
    setResult(null);
    setError("");

    if (!testId) {
      setQuestions([]);
      return;
    }

    setLoadingQuestions(true);
    try {
      const res = await getQuestionsByTest(testId);
      setQuestions(res.data);
    } catch {
      setError("Failed to load questions. Please try again.");
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswer = (questionId: number, isCorrect: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: isCorrect }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedStudentId || !selectedTestId) {
      setError("Please select a student and a test.");
      return;
    }

    setSubmitting(true);

    try {
      const answersPayload = questions.map((q) => ({
        question_id: q.id,
        is_correct: answers[q.id],
      }));

      const res = await submitBatchResults(
        selectedStudentId,
        selectedTestId,
        answersPayload
      );

      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit results");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnother = () => {
    setResult(null);
    setAnswers({});
    setSelectedStudentId("");
    setSelectedTestId("");
    setQuestions([]);
    setError("");
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/dashboard")}>Back</button>

      <h1>Submit Test Results</h1>

      {result ? (
        <>
          <h2>Results Submitted</h2>

          <p>Total Questions: {result.submitted}</p>
          <p>Correct: {result.correct}</p>
          <p>Incorrect: {result.incorrect}</p>
          <p>Score: {result.score}%</p>

          <br />

          <button onClick={handleSubmitAnother}>Submit Another</button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Select Classroom</h2>

          <select
            value={selectedClassroomId}
            onChange={(e) => handleClassroomChange(e.target.value)}
            required
          >
            <option value="">Select classroom</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - Grade {c.grade}
              </option>
            ))}
          </select>

          {selectedClassroomId !== "" && (
            <>
              <br />
              <br />

              <h2>Select Student</h2>

              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value ? Number(e.target.value) : "");
                  setResult(null);
                  setError("");
                }}
                required
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>

              <br />
              <br />

              <h2>Select Test</h2>

              <select
                value={selectedTestId}
                onChange={(e) => handleTestChange(e.target.value)}
                required
              >
                <option value="">Select test</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </>
          )}

          {loadingQuestions && <p>Loading questions...</p>}

          {selectedTestId !== "" && !loadingQuestions && questions.length === 0 && (
            <p>No questions found for this test.</p>
          )}

          {questions.length > 0 && (
            <>
              <hr />

              <h2>Questions ({questions.length})</h2>

              {questions.map((question, index) => (
                <div key={question.id} style={{ marginBottom: "20px" }}>
                  <p>
                    <strong>{index + 1}.</strong> {question.question_text}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleAnswer(question.id, true)}
                    style={{
                      marginRight: "10px",
                      backgroundColor: answers[question.id] === true ? "#4CAF50" : "",
                      color: answers[question.id] === true ? "white" : "",
                    }}
                  >
                    Correct
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswer(question.id, false)}
                    style={{
                      backgroundColor: answers[question.id] === false ? "#f44336" : "",
                      color: answers[question.id] === false ? "white" : "",
                    }}
                  >
                    Incorrect
                  </button>
                </div>
              ))}

              <hr />

              <p>
                Answered: {answeredCount} / {questions.length}
              </p>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <button type="submit" disabled={!allAnswered || submitting}>
                {submitting ? "Submitting..." : "Submit Results"}
              </button>
            </>
          )}

          {error && questions.length === 0 && (
            <p style={{ color: "red" }}>{error}</p>
          )}
        </form>
      )}
    </div>
  );
}

export default SubmitResults;
