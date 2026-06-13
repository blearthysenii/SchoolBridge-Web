import api from "./api";

export const createConcept = async (name: string, subjectId: number) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/concepts/",
    {
      name,
      subject_id: subjectId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const getConceptsBySubject = async (subjectId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/concepts/subject/${subjectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const deleteConcept = async (conceptId: number) => {
  const token = localStorage.getItem("token");

  return await api.delete(`/concepts/${conceptId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};