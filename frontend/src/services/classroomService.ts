import api from "./api";

export type ClassroomPayload = {
  name: string;
  grade: number;
  description: string;
  start_month: string;
  start_year: number;
  end_month: string;
  end_year: number;
};

export const getClassrooms = async (active = true) => {
  return await api.get("/classrooms/", {
    params: { active },
  });
};

export const getInactiveClassrooms = async () => {
  return await getClassrooms(false);
};

export const createClassroom = async (payload: ClassroomPayload) => {
  return await api.post("/classrooms/", payload);
};

export const updateClassroom = async (
  classroomId: number,
  payload: ClassroomPayload,
) => {
  return await api.put(`/classrooms/${classroomId}`, payload);
};

export const deactivateClassroom = async (classroomId: number) => {
  return await api.patch(`/classrooms/${classroomId}/deactivate`, null);
};

export const activateClassroom = async (classroomId: number) => {
  return await api.patch(`/classrooms/${classroomId}/activate`, null);
};
