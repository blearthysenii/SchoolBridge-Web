import api from "./api";

export const getStudentsByClassroom = async (classroomId: string) => {
  const token = localStorage.getItem("token");

  return await api.get(`/students/classroom/${classroomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const createStudent = async (
  fullName: string,
  personalNumber: string,
  dateBirth: string,
  classroomId: number
) => {
  const token = localStorage.getItem("token");

  return await api.post(
    "/students/",
    {
      full_name: fullName,
      personal_number: personalNumber,
      date_birth: dateBirth || null,
      classroom_id: classroomId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


export const deleteStudent = async (studentId: number) => {
  const token = localStorage.getItem("token");

  return await api.delete(`/students/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};