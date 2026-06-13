import api from "./api";

export const getDashboardStats = async () => {
  const token = localStorage.getItem("token");

  return await api.get("/dashboard/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};