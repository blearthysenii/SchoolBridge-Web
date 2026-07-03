import api from "./api";

export const getTestSessionByCode = async (sessionCode: string) => {
  const token = localStorage.getItem("token");

  return await api.get(`/test-sessions/${sessionCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const startTestSession = async (sessionId: number) => {
  const token = localStorage.getItem("token");

  return await api.post(`/test-sessions/${sessionId}/start`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const pauseTestSession = async (sessionId: number) => {
  const token = localStorage.getItem("token");

  return await api.post(`/test-sessions/${sessionId}/pause`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const resumeTestSession = async (sessionId: number) => {
  const token = localStorage.getItem("token");

  return await api.post(`/test-sessions/${sessionId}/resume`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const endTestSession = async (sessionId: number) => {
  const token = localStorage.getItem("token");

  return await api.post(`/test-sessions/${sessionId}/end`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTestSessionResults = async (sessionId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/test-sessions/${sessionId}/results`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTestSessionAnalytics = async (sessionId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/test-sessions/${sessionId}/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
  const token = localStorage.getItem("token");

  return await api.put(`/test-sessions/${sessionId}/answers/${answerId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSessionAiAnalysis = async (sessionId: number) => {
  const token = localStorage.getItem("token");

  return await api.get(`/test-sessions/${sessionId}/ai-analysis`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const generateSessionAiAnalysis = async (sessionId: number, force = false) => {
  const token = localStorage.getItem("token");

  return await api.post(`/test-sessions/${sessionId}/ai-analysis`, null, {
    params: { force },
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteSessionAiAnalysis = async (sessionId: number) => {
  const token = localStorage.getItem("token");

  return await api.delete(`/test-sessions/${sessionId}/ai-analysis`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
