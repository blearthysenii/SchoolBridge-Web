import api from "./api";

export const getStudentAnalytics = async (studentId: number) => {
  return await api.get(`/analytics/student/${studentId}`);
};

export const getTestAnalytics = async (testId: number) => {
  return await api.get(`/analytics/test/${testId}`);
};
