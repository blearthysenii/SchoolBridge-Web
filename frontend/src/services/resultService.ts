import api from "./api";

export const getResultsByStudent = async (studentId: number) => {
  return await api.get(`/results/student/${studentId}`);
};

export const createResult = async (
  studentId: number,
  questionId: number,
  isCorrect: boolean
) => {
  return await api.post(
    "/results/",
    {
      student_id: studentId,
      question_id: questionId,
      is_correct: isCorrect,
    },
  );
};

export const deleteResult = async (resultId: number) => {
  return await api.delete(`/results/${resultId}`);
};

export const submitBatchResults = async (
  studentId: number,
  testId: number,
  answers: { question_id: number; is_correct: boolean }[]
) => {
  return await api.post(
    "/results/batch",
    {
      student_id: studentId,
      test_id: testId,
      answers,
    },
  );
};
