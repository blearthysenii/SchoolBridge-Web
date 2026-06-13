import api from "./api";

export const getClassroomAnalytics = async (classroomId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/analytics/classroom/${classroomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};