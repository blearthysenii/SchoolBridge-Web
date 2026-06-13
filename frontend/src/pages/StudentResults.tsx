import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
  total_results: number;
  correct: number;
  incorrect: number;
  success_rate: number;
  concepts: ConceptAnalytics[];
  learning_gaps: ConceptAnalytics[];
};

function StudentResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState<Result[]>([]);
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);

  const [selectedQuestionId, setSelectedQuestionId] = useState<number | "">("");
  const [isCorrect, setIsCorrect] = useState("true");

  const loadResults = async () => {
    if (!id) return;

    const response = await getResultsByStudent(Number(id));
    setResults(response.data);
  };

  const loadQuestions = async () => {
    if (!id) return;

    const response = await getQuestionsByStudent(Number(id));
    setQuestions(response.data);
  };

  const loadAnalytics = async () => {
    if (!id) return;

    const response = await getStudentAnalytics(Number(id));
    setAnalytics(response.data);
  };

  const refreshData = async () => {
    await loadResults();
    await loadQuestions();
    await loadAnalytics();
  };

  useEffect(() => {
    refreshData();
  }, [id]);

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!selectedQuestionId) {
      alert("Please select a question");
      return;
    }

    try {
      await createResult(
        Number(id),
        Number(selectedQuestionId),
        isCorrect === "true"
      );

      setSelectedQuestionId("");
      setIsCorrect("true");

      await refreshData();
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.detail || "Failed to save result");
    }
  };

  const handleDeleteResult = async (resultId: number) => {
    try {
      await deleteResult(resultId);
      await refreshData();
    } catch (error) {
      console.log(error);
      alert("Failed to delete result");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate(-1)}>Back</button>

      <h1>Student Results</h1>

      <p>Student ID: {id}</p>

      {analytics && <p>Student Name: {analytics.student_name}</p>}

      <hr />

      <h2>Add Answer / Result</h2>

      <form onSubmit={handleCreateResult}>
        <select
          value={selectedQuestionId}
          onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
          required
        >
          <option value="">Select question</option>

          {questions.map((question) => (
            <option key={question.id} value={question.id}>
              {question.subject_name} → {question.concept_name} →{" "}
              {question.question_text}
            </option>
          ))}
        </select>

        <br />
        <br />

        <select
          value={isCorrect}
          onChange={(e) => setIsCorrect(e.target.value)}
        >
          <option value="true">Correct</option>
          <option value="false">Incorrect</option>
        </select>

        <br />
        <br />

        <button type="submit">Save Result</button>
      </form>

      <hr />

      <h2>Analytics</h2>

      {analytics ? (
        <>
          <p>Total Results: {analytics.total_results}</p>
          <p>Correct: {analytics.correct}</p>
          <p>Incorrect: {analytics.incorrect}</p>
          <p>Success Rate: {analytics.success_rate}%</p>
        </>
      ) : (
        <p>No analytics yet.</p>
      )}

      <hr />

      <h2>Learning Gaps</h2>

      {analytics && analytics.learning_gaps.length > 0 ? (
        <ul>
          {analytics.learning_gaps.map((gap) => (
            <li key={gap.concept_id} style={{ marginBottom: "12px" }}>
              ⚠️ <strong>{gap.subject_name}</strong> → {gap.concept_name}
              <br />
              Success Rate: {gap.success_rate}%
              <br />
              Correct: {gap.correct} | Incorrect: {gap.incorrect}
            </li>
          ))}
        </ul>
      ) : (
        <p>No learning gaps detected.</p>
      )}

      <hr />

      <h2>Concept Performance</h2>

      {analytics && analytics.concepts.length > 0 ? (
        <ul>
          {analytics.concepts.map((concept) => (
            <li key={concept.concept_id} style={{ marginBottom: "12px" }}>
              <strong>{concept.subject_name}</strong> → {concept.concept_name}
              <br />
              Success Rate: {concept.success_rate}%
              <br />
              Correct: {concept.correct} | Incorrect: {concept.incorrect}
              <br />
              Status: {concept.is_gap ? "Needs improvement ⚠️" : "Good ✅"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No concept performance yet.</p>
      )}

      <hr />

      <h2>Results</h2>

      {results.length > 0 ? (
        <ul>
          {results.map((result) => (
            <li key={result.id} style={{ marginBottom: "12px" }}>
              <strong>{result.subject_name}</strong>
              {" → "}
              {result.concept_name}
              <br />
              Question: {result.question_text}
              <br />
              Status: {result.is_correct ? "Correct ✅" : "Incorrect ❌"}

              <button
                onClick={() => handleDeleteResult(result.id)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results yet.</p>
      )}
    </div>
  );
}

export default StudentResults;