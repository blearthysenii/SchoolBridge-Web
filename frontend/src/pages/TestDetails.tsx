import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  createQuestion,
  getQuestionsByTest,
  deleteQuestion,
} from "../services/questionService";

import { getTestById } from "../services/testService";
import { getConceptsBySubject } from "../services/conceptService";

type Question = {
  id: number;
  question_text: string;
  test_id: number;
  concept_id: number;
};

type Test = {
  id: number;
  title: string;
  classroom_id: number;
  subject_id: number;
};

type Concept = {
  id: number;
  name: string;
  subject_id: number;
};

function TestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);

  const [questionText, setQuestionText] = useState("");
  const [selectedConceptId, setSelectedConceptId] = useState<number | "">("");

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
    const concept = concepts.find((item) => item.id === conceptId);
    return concept ? concept.name : `Concept ID: ${conceptId}`;
  };

  useEffect(() => {
    loadTest();
    loadQuestions();
  }, [id]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!selectedConceptId) {
      alert("Please select a concept");
      return;
    }

    try {
      await createQuestion(
        questionText,
        Number(id),
        Number(selectedConceptId)
      );

      setQuestionText("");
      setSelectedConceptId("");

      await loadQuestions();
    } catch (error) {
      console.log(error);
      alert("Failed to create question");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
  try {
    await deleteQuestion(questionId);
    await loadQuestions();
  } catch (error: any) {
    console.log(error);
    alert(error.response?.data?.detail || "Failed to delete question");
  }
};

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate(-1)}>Back</button>

      <h1>Test Details</h1>

      <p>Test ID: {id}</p>

      {test && <p>Test Title: {test.title}</p>}

      {test && <Link to={`/tests/${id}/analytics`}>View Analytics</Link>}

      <hr />

      <h2>Add Question</h2>

      <form onSubmit={handleCreateQuestion}>
        <select
          value={selectedConceptId}
          onChange={(e) => setSelectedConceptId(Number(e.target.value))}
          required
        >
          <option value="">Select concept</option>

          {concepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.name}
            </option>
          ))}
        </select>

        <br />
        <br />

        <input
          type="text"
          placeholder="Question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">Add Question</button>
      </form>

      <hr />

      <h2>Questions</h2>

      {questions.length > 0 ? (
        <ul>
          {questions.map((question) => (
            <li key={question.id}>
              {question.question_text}
              {" | "}
              Concept: {getConceptName(question.concept_id)}

              <button
                onClick={() => handleDeleteQuestion(question.id)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No questions yet.</p>
      )}
    </div>
  );
}

export default TestDetails;