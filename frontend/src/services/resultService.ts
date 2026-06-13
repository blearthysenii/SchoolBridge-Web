import api from "./api";

export const getResultsByStudent = async (studentId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/results/student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createResult = async (
  studentId: number,
  questionId: number,
  isCorrect: boolean
) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/results/",
    {
      student_id: studentId,
      question_id: questionId,
      is_correct: isCorrect,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteResult = async (resultId: number) => {
  const token = localStorage.getItem("token");

  return await api.delete(`/results/${resultId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const submitBatchResults = async (
  studentId: number,
  testId: number,
  answers: { question_id: number; is_correct: boolean }[]
) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/results/batch",
    {
      student_id: studentId,
      test_id: testId,
      answers,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};