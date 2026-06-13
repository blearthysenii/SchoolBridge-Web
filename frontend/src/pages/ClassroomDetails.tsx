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

import { getClassroomAnalytics } from "../services/classroomAnalyticsService";

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

type ClassroomAnalytics = {
  classroom_id: number;
  classroom_name: string;
  grade: number;
  total_students: number;
  total_results: number;
  correct: number;
  incorrect: number;
  success_rate: number;
  concepts: ConceptAnalytics[];
  learning_gaps: ConceptAnalytics[];
};

function ClassroomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [analytics, setAnalytics] = useState<ClassroomAnalytics | null>(null);

  const [fullName, setFullName] = useState("");
  const [personalNumber, setPersonalNumber] = useState("");
  const [dateBirth, setDateBirth] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [conceptName, setConceptName] = useState("");

  const [testTitle, setTestTitle] = useState("");
  const [selectedTestSubjectId, setSelectedTestSubjectId] =
    useState<number | "">("");

  const loadStudents = async () => {
    if (!id) return;
    const response = await getStudentsByClassroom(id);
    setStudents(response.data);
  };

  const loadSubjects = async () => {
    if (!id) return;
    const response = await getSubjectsByClassroom(id);
    setSubjects(response.data);
  };

  const loadConcepts = async (subjectId: number) => {
    const response = await getConceptsBySubject(subjectId);
    setConcepts(response.data);
  };

  const loadTests = async () => {
    if (!id) return;
    const response = await getTestsByClassroom(Number(id));
    setTests(response.data);
  };

  const loadAnalytics = async () => {
    if (!id) return;
    const response = await getClassroomAnalytics(Number(id));
    setAnalytics(response.data);
  };

  const refreshData = async () => {
    await loadStudents();
    await loadSubjects();
    await loadTests();
    await loadAnalytics();
  };

  useEffect(() => {
    refreshData();
  }, [id]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await createStudent(fullName, personalNumber, dateBirth, Number(id));
      setFullName("");
      setPersonalNumber("");
      setDateBirth("");
      await refreshData();
    } catch (error) {
      console.log(error);
      alert("Failed to create student");
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await createSubject(subjectName, Number(id));
      setSubjectName("");
      await refreshData();
    } catch (error) {
      console.log(error);
      alert("Failed to create subject");
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    const parsedSubjectId = Number(subjectId);
    setSelectedSubjectId(parsedSubjectId);

    if (parsedSubjectId) {
      await loadConcepts(parsedSubjectId);
    } else {
      setConcepts([]);
    }
  };

  const handleCreateConcept = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubjectId) {
      alert("Please select a subject");
      return;
    }

    try {
      await createConcept(conceptName, Number(selectedSubjectId));
      setConceptName("");
      await loadConcepts(Number(selectedSubjectId));
      await loadAnalytics();
    } catch (error) {
      console.log(error);
      alert("Failed to create concept");
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!selectedTestSubjectId) {
      alert("Please select a subject");
      return;
    }

    try {
      await createTest(testTitle, Number(id), Number(selectedTestSubjectId));
      setTestTitle("");
      setSelectedTestSubjectId("");
      await refreshData();
    } catch (error) {
      console.log(error);
      alert("Failed to create test");
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await deleteStudent(studentId);
      await refreshData();
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.detail || "Failed to delete student");
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    try {
      await deleteSubject(subjectId);
      await refreshData();

      if (selectedSubjectId === subjectId) {
        setSelectedSubjectId("");
        setConcepts([]);
      }
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.detail || "Failed to delete subject");
    }
  };

  const handleDeleteConcept = async (conceptId: number) => {
    try {
      await deleteConcept(conceptId);

      if (selectedSubjectId) {
        await loadConcepts(Number(selectedSubjectId));
      }

      await loadAnalytics();
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.detail || "Failed to delete concept");
    }
  };

  const handleDeleteTest = async (testId: number) => {
    try {
      await deleteTest(testId);
      await refreshData();
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.detail || "Failed to delete test");
    }
  };

return (
  <div style={{ padding: "40px" }}>
    <button onClick={() => navigate("/dashboard")}>Back</button>

    <h1>Classroom Details</h1>

    {analytics ? (
      <>
        <p>
          Classroom: {analytics.classroom_name} - Grade {analytics.grade}
        </p>

        <hr />

        <h2>Classroom Analytics</h2>

        <p>Total Students: {analytics.total_students}</p>
        <p>Total Results: {analytics.total_results}</p>
        <p>Correct: {analytics.correct}</p>
        <p>Incorrect: {analytics.incorrect}</p>
        <p>Success Rate: {analytics.success_rate}%</p>

        <h3>Classroom Learning Gaps</h3>

        {analytics.learning_gaps.length > 0 ? (
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
          <p>No classroom learning gaps detected.</p>
        )}

        <h3>Classroom Concept Performance</h3>

        {analytics.concepts.length > 0 ? (
          <ul>
            {analytics.concepts.map((concept) => (
              <li key={concept.concept_id} style={{ marginBottom: "12px" }}>
                <strong>{concept.subject_name}</strong> → {concept.concept_name}
                <br />
                Total Results: {concept.total}
                <br />
                Correct: {concept.correct} | Incorrect: {concept.incorrect}
                <br />
                Success Rate: {concept.success_rate}%
                <br />
                Status: {concept.is_gap ? "Needs improvement ⚠️" : "Good ✅"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No concept performance yet.</p>
        )}
      </>
    ) : (
      <p>Loading classroom analytics...</p>
    )}

    <hr />

    <h2>Add Student</h2>

    <form onSubmit={handleCreateStudent}>
      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Personal number"
        value={personalNumber}
        onChange={(e) => setPersonalNumber(e.target.value)}
        required
      />

      <br />
      <br />

      <input
        type="date"
        value={dateBirth}
        onChange={(e) => setDateBirth(e.target.value)}
      />

      <br />
      <br />

      <button type="submit">Add Student</button>
    </form>

    <hr />

    <h2>Students</h2>

    {students.length > 0 ? (
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            <Link to={`/students/${student.id}/results`}>
              {student.full_name}
            </Link>
            {" - "}
            {student.personal_number}
            {student.date_birth && ` - ${student.date_birth}`}

            <button
              onClick={() => handleDeleteStudent(student.id)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>No students yet.</p>
    )}

    <hr />

    <h2>Add Subject</h2>

    <form onSubmit={handleCreateSubject}>
      <input
        type="text"
        placeholder="Subject name e.g. Matematikë"
        value={subjectName}
        onChange={(e) => setSubjectName(e.target.value)}
        required
      />

      <br />
      <br />

      <button type="submit">Add Subject</button>
    </form>

    <h2>Subjects</h2>

    {subjects.length > 0 ? (
      <ul>
        {subjects.map((subject) => (
          <li key={subject.id}>
            {subject.name}

            <button
              onClick={() => handleDeleteSubject(subject.id)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>No subjects yet.</p>
    )}

    <hr />

    <h2>Add Concept</h2>

    <form onSubmit={handleCreateConcept}>
      <select
        value={selectedSubjectId}
        onChange={(e) => handleSubjectChange(e.target.value)}
        required
      >
        <option value="">Select subject</option>

        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        type="text"
        placeholder="Concept name e.g. Thyesat"
        value={conceptName}
        onChange={(e) => setConceptName(e.target.value)}
        required
      />

      <br />
      <br />

      <button type="submit">Add Concept</button>
    </form>

    <h2>Concepts</h2>

    {concepts.length > 0 ? (
      <ul>
        {concepts.map((concept) => (
          <li key={concept.id}>
            {concept.name}

            <button
              onClick={() => handleDeleteConcept(concept.id)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>No concepts selected or created yet.</p>
    )}

    <hr />

    <h2>Add Test</h2>

    <form onSubmit={handleCreateTest}>
      <select
        value={selectedTestSubjectId}
        onChange={(e) => setSelectedTestSubjectId(Number(e.target.value))}
        required
      >
        <option value="">Select subject</option>

        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        type="text"
        placeholder="Test title e.g. Matematikë Testi 1"
        value={testTitle}
        onChange={(e) => setTestTitle(e.target.value)}
        required
      />

      <br />
      <br />

      <button type="submit">Add Test</button>
    </form>

    <h2>Tests</h2>

    {tests.length > 0 ? (
      <ul>
        {tests.map((test) => (
          <li key={test.id}>
            <Link to={`/tests/${test.id}`}>{test.title}</Link>

            <button
              onClick={() => handleDeleteTest(test.id)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>No tests yet.</p>
    )}
  </div>
);
}

export default ClassroomDetails;