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


export const getInactiveConcepts = async () => {
  const token = localStorage.getItem("token");

  return await api.get("/concepts/inactive", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const updateConcept = async (conceptId: number, name: string) => {
  const token = localStorage.getItem("token");

  return await api.put(
    `/concepts/${conceptId}`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};


export const restoreConcept = async (conceptId: number) => {
  const token = localStorage.getItem("token");

  return await api.patch(`/concepts/${conceptId}/restore`, null, {
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
