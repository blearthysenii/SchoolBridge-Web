import api from "./api";

export const getTestSessionByCode = async (sessionCode: string) => {
  return await api.get(`/test-sessions/${sessionCode}`);
};

export const startTestSession = async (sessionId: number) => {
  return await api.post(`/test-sessions/${sessionId}/start`, null);
};

export const pauseTestSession = async (sessionId: number) => {
  return await api.post(`/test-sessions/${sessionId}/pause`, null);
};

export const resumeTestSession = async (sessionId: number) => {
  return await api.post(`/test-sessions/${sessionId}/resume`, null);
};

export const endTestSession = async (sessionId: number) => {
  return await api.post(`/test-sessions/${sessionId}/end`, null);
};

export const getTestSessionResults = async (sessionId: number) => {
  return await api.get(`/test-sessions/${sessionId}/results`);
};

export const getTestSessionAnalytics = async (sessionId: number) => {
  return await api.get(`/test-sessions/${sessionId}/analytics`);
};

export const updateStudentAnswerOverride = async (
  sessionId: number,
  answerId: number,
  payload: {
    points_earned: number;
    feedback?: string | null;
    is_correct?: boolean | null;
  },
) => {
  return await api.put(`/test-sessions/${sessionId}/answers/${answerId}`, payload);
};

export const getSessionAiAnalysis = async (sessionId: number) => {
  return await api.get(`/test-sessions/${sessionId}/ai-analysis`);
};

export const generateSessionAiAnalysis = async (sessionId: number, force = false) => {
  return await api.post(`/test-sessions/${sessionId}/ai-analysis`, null, {
    params: { force },
  });
};

export const downloadSessionAiAnalysisPdf = async (sessionId: number) => {
  return await api.get(`/test-sessions/${sessionId}/ai-analysis/pdf`, {
    responseType: "blob",
  });
};

export const deleteSessionAiAnalysis = async (sessionId: number) => {
  return await api.delete(`/test-sessions/${sessionId}/ai-analysis`);
};

export const joinOnlineTest = async (sessionCode: string, studentCode: string) => {
  return await api.post("/online-tests/join", {
    session_code: sessionCode,
    student_code: studentCode,
  });
};

export const getOnlineAttempt = async (attemptId: number) => {
  return await api.get(`/online-tests/attempt/${attemptId}`);
};

export const submitOnlineAttempt = async (
  attemptId: number,
  answers: Array<{
    question_id: number;
    selected_option_id?: number | null;
    written_answer?: string | null;
  }>,
) => {
  return await api.post(`/online-tests/attempt/${attemptId}/submit`, { answers });
};

export const saveOnlineAttemptAnswer = async (
  attemptId: number,
  answer: {
    question_id: number;
    selected_option_id?: number | null;
    written_answer?: string | null;
  },
) => {
  return await api.patch(`/online-tests/attempt/${attemptId}/answers`, answer);
};
