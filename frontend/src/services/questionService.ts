import api from "./api";

export const getQuestionsByTest = async (testId: number) => {
  return await api.get(`/questions/test/${testId}`);
};

export const createQuestion = async (
  questionText: string,
  testId: number,
  conceptId: number,
) => {
  return await api.post(
    "/questions/",
    {
      question_text: questionText,
      test_id: testId,
      concept_id: conceptId,
    },
  );
};

export const getQuestionsByStudent = async (studentId: number) => {
  return await api.get(`/questions/student/${studentId}`);
};

export const deleteQuestion = async (questionId: number) => {
  return await api.delete(`/questions/${questionId}`);
};
