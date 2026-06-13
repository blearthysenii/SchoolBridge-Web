import api from "./api";

export const getSubjectsByClassroom = async (classroomId: string) => {
  const token = localStorage.getItem("token");

  return await api.get(`/subjects/classroom/${classroomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};



export const createSubject = async (name: string, classroomId: number) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/subjects/",
    {
      name,
      classroom_id: classroomId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteSubject = async (subjectId: number) => {
  const token = localStorage.getItem("token");

  return await api.delete(`/subjects/${subjectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};