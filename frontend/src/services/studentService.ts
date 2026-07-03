import api from "./api";

export const getStudentsByClassroom = async (classroomId: string) => {
  return await api.get(`/students/classroom/${classroomId}`);
};


export const getInactiveStudents = async () => {
  return await api.get("/students/inactive");
};


export const createStudent = async (
  fullName: string,
  personalNumber: string,
  dateBirth: string,
  classroomId: number,
  parentPhone?: string,
  finalGrade?: string
) => {
  return await api.post(
    "/students/",
    {
      full_name: fullName,
      personal_number: personalNumber,
      parent_phone: parentPhone?.trim() || null,
      final_grade: finalGrade ? Number(finalGrade) : null,
      date_birth: dateBirth || null,
      classroom_id: classroomId,
    },
  );
};


export const updateStudent = async (
  studentId: number,
  data: {
    full_name?: string;
    personal_number?: string;
    parent_phone?: string | null;
    final_grade?: number | null;
    date_birth?: string | null;
  }
) => {
  return await api.put(`/students/${studentId}`, data);
};


export const deactivateStudent = async (studentId: number) => {
  return await api.patch(`/students/${studentId}/deactivate`, null);
};


export const activateStudent = async (studentId: number) => {
  return await api.patch(`/students/${studentId}/activate`, null);
};
