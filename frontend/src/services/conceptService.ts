import api from "./api";

export const createConcept = async (name: string, subjectId: number) => {
  return await api.post(
    "/concepts/",
    {
      name,
      subject_id: subjectId,
    },
  );
};

export const getConceptsBySubject = async (subjectId: number) => {
  return await api.get(`/concepts/subject/${subjectId}`);
};


export const getInactiveConcepts = async () => {
  return await api.get("/concepts/inactive");
};


export const updateConcept = async (conceptId: number, name: string) => {
  return await api.put(`/concepts/${conceptId}`, { name });
};


export const restoreConcept = async (conceptId: number) => {
  return await api.patch(`/concepts/${conceptId}/restore`, null);
};


export const deleteConcept = async (conceptId: number) => {
  return await api.delete(`/concepts/${conceptId}`);
};
