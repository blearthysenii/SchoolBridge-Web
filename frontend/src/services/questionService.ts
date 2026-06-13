import api from "./api";

export const getQuestionsByTest = async (testId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/questions/test/${testId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createQuestion = async (
  questionText: string,
  testId: number,
  conceptId: number,
) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/questions/",
    {
      question_text: questionText,
      test_id: testId,
      concept_id: conceptId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const getQuestionsByStudent = async (studentId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/questions/student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteQuestion = async (questionId: number) => {
  const token = localStorage.getItem("token");

  return await api.delete(`/questions/${questionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
