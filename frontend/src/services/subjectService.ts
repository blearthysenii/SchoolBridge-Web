import api from "./api";

export const getSubjectsByClassroom = async (classroomId: string) => {
  const token = localStorage.getItem("token");

  return await api.get(`/subjects/classroom/${classroomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const getInactiveSubjects = async () => {
  const token = localStorage.getItem("token");

  return await api.get("/subjects/inactive", {
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

export const updateSubject = async (subjectId: number, name: string) => {
  const token = localStorage.getItem("token");

  return await api.put(
    `/subjects/${subjectId}`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const restoreSubject = async (subjectId: number) => {
  const token = localStorage.getItem("token");

  return await api.patch(`/subjects/${subjectId}/restore`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteSubject = async (subjectId: number) => {
  const token = localStorage.getItem("token");

  return await api.delete(`/subjects/${subjectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
