import api from "./api";

export const getClassrooms = async () => {
  const token = localStorage.getItem("token");

  return await api.get("/classrooms/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createClassroom = async (
  name: string,
  grade: number,
  description: string,
) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/classrooms/",
    {
      name,
      grade,
      description,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};
