import api from "./api";

export const getStudentAnalytics = async (studentId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/analytics/student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTestAnalytics = async (testId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/analytics/test/${testId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
