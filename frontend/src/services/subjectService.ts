import api from "./api";

export const getSubjectsByClassroom = async (classroomId: string) => {
  return await api.get(`/subjects/classroom/${classroomId}`);
};


export const getInactiveSubjects = async () => {
  return await api.get("/subjects/inactive");
};



export const createSubject = async (name: string, classroomId: number) => {
  return await api.post(
    "/subjects/",
    {
      name,
      classroom_id: classroomId,
    },
  );
};

export const updateSubject = async (subjectId: number, name: string) => {
  return await api.put(`/subjects/${subjectId}`, { name });
};

export const restoreSubject = async (subjectId: number) => {
  return await api.patch(`/subjects/${subjectId}/restore`, null);
};

export const deleteSubject = async (subjectId: number) => {
  return await api.delete(`/subjects/${subjectId}`);
};
