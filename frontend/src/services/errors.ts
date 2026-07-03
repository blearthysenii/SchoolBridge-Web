import axios from "axios";

type ApiErrorResponse = {
  detail?: unknown;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }

  return fallback;
}

export function hasApiStatus(error: unknown, status: number) {
  return axios.isAxiosError(error) && error.response?.status === status;
}
