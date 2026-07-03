import api from "./api";

export const getTestsByClassroom = async (classroomId: number) => {
  return await api.get(`/tests/classroom/${classroomId}`);
};

export const getTestById = async (testId: number) => {
  return await api.get(`/tests/${testId}`);
};

export const getArchivedTests = async () => {
  return await api.get("/tests/archived");
};

export const updateTestStatus = async (testId: number, status: "draft" | "published" | "archived") => {
  return await api.put(`/tests/${testId}/status`, { status });
};

export const createTest = async (
  title: string,
  classroomId: number,
  subjectId: number,
) => {
  return await api.post(
    "/tests/",
    {
      title,
      classroom_id: classroomId,
      subject_id: subjectId,
    },
  );
};

export const deleteTest = async (testId: number) => {
  return await api.delete(`/tests/${testId}`);
};

export const createTestSession = async (testId: number) => {
  return await api.post("/test-sessions/", { test_id: testId });
};

export const getSessionsByTest = async (testId: number) => {
  return await api.get(`/test-sessions/test/${testId}`);
};
