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
  const token = localStorage.getItem("token");

  return await api.get("/classrooms/", {
    params: { active },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getInactiveClassrooms = async () => {
  return await getClassrooms(false);
};

export const createClassroom = async (payload: ClassroomPayload) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/classrooms/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const updateClassroom = async (
  classroomId: number,
  payload: ClassroomPayload,
) => {
  const token = localStorage.getItem("token");

  return await api.put(`/classrooms/${classroomId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deactivateClassroom = async (classroomId: number) => {
  const token = localStorage.getItem("token");

  return await api.patch(`/classrooms/${classroomId}/deactivate`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const activateClassroom = async (classroomId: number) => {
  const token = localStorage.getItem("token");

  return await api.patch(`/classrooms/${classroomId}/activate`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
