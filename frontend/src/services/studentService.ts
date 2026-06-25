import api from "./api";

export const getStudentsByClassroom = async (classroomId: string) => {
  const token = localStorage.getItem("token");

  return await api.get(`/students/classroom/${classroomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const getInactiveStudents = async () => {
  const token = localStorage.getItem("token");

  return await api.get("/students/inactive", {
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


export const updateStudent = async (
  studentId: number,
  data: { full_name?: string; personal_number?: string; date_birth?: string | null }
) => {
  const token = localStorage.getItem("token");

  return await api.put(
    `/students/${studentId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


export const deactivateStudent = async (studentId: number) => {
  const token = localStorage.getItem("token");

  return await api.patch(`/students/${studentId}/deactivate`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const activateStudent = async (studentId: number) => {
  const token = localStorage.getItem("token");

  return await api.patch(`/students/${studentId}/activate`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
