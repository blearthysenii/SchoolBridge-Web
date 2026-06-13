import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import { createClassroom, getClassrooms } from "../services/classroomService";
import { getDashboardStats } from "../services/dashboardService";


type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
};

type Classroom = {
  id: number;
  name: string;
  grade: number;
  description?: string;
  created_at: string;
};

type DashboardStats = {
  classrooms: number;
  students: number;
  subjects: number;
  concepts: number;
  tests: number;
  questions: number;
  results: number;
};

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState(1);
  const [description, setDescription] = useState("");

  const loadClassrooms = async () => {
    const response = await getClassrooms();
    setClassrooms(response.data);
  };

  const loadStats = async () => {
    const response = await getDashboardStats();
    setStats(response.data);
  };

  const refreshDashboard = async () => {
    await loadClassrooms();
    await loadStats();
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);

        await refreshDashboard();
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    getUser();
  }, [navigate]);

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createClassroom(name, grade, description);

      setName("");
      setGrade(1);
      setDescription("");

      await refreshDashboard();
    } catch (error) {
      console.log(error);
      alert("Failed to create classroom");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>SchoolBridge Dashboard</h1>

      {user ? (
        <>
          <p>Mirë se erdhe, {user.full_name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>

          <hr />

          <h2>Dashboard Statistics</h2>

          {stats ? (
            <div>
              <p>Classrooms: {stats.classrooms}</p>
              <p>Students: {stats.students}</p>
              <p>Subjects: {stats.subjects}</p>
              <p>Concepts: {stats.concepts}</p>
              <p>Tests: {stats.tests}</p>
              <p>Questions: {stats.questions}</p>
              <p>Results: {stats.results}</p>
            </div>
          ) : (
            <p>Loading statistics...</p>
          )}

          <hr />

          <h2>Create Classroom</h2>

          <form onSubmit={handleCreateClassroom}>
            <input
              type="text"
              placeholder="Class name e.g. 5A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <br />
            <br />

            <input
              type="number"
              min={1}
              max={5}
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              required
            />

            <br />
            <br />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <br />
            <br />

            <button type="submit">Create Classroom</button>
          </form>

          <hr />

          <h2>My Classrooms</h2>

          {classrooms.length > 0 ? (
            <ul>
              {classrooms.map((classroom) => (
                <li key={classroom.id}>
                  <Link to={`/classrooms/${classroom.id}`}>
                    {classroom.name} - Grade {classroom.grade}
                    {classroom.description && ` (${classroom.description})`}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No classrooms yet.</p>
          )}

          <hr />

          <Link to="/submit-results">Submit Test Results</Link>

          <br />
          <br />

          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Dashboard;