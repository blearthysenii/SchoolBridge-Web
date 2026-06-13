import api from "./api";

export const getTestsByClassroom = async (classroomId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/tests/classroom/${classroomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTestById = async (testId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/tests/${testId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createTest = async (
  title: string,
  classroomId: number,
  subjectId: number,
) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/tests/",
    {
      title,
      classroom_id: classroomId,
      subject_id: subjectId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const deleteTest = async (testId: number) => {
  const token = localStorage.getItem("token");

  return await api.delete(`/tests/${testId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
