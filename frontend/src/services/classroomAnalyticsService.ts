import api from "./api";

export const getClassroomAnalytics = async (classroomId: number) => {
  return await api.get(`/analytics/classroom/${classroomId}`);
};
