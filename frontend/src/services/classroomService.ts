import api from "./api";

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

export const createClassroom = async (
  name: string,
  grade: number,
  description: string,
) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/classrooms/",
    {
      name,
      grade,
      description,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
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
