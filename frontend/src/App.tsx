import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CompleteGoogleRegister from "./pages/CompleteGoogleRegister";
import ForgotPassword from "./pages/Forgot_password";
import ResetPassword from "./pages/ResetPassword";
import ClassroomDetails from "./pages/ClassroomDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import TestDetails from "./pages/TestDetails";
import StudentResults from "./pages/StudentResults";
import SubmitResults from "./pages/SubmitResults";
import TestAnalytics from "./pages/TestAnalytics";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complete-google-register"
          element={<CompleteGoogleRegister />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route
          path="/classrooms/:id"
          element={
          <ProtectedRoute>
          <ClassroomDetails />
          </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:id"
          element={
            <ProtectedRoute>
              <TestDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id/results"
          element={
            <ProtectedRoute>
              <StudentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-results"
          element={
            <ProtectedRoute>
              <SubmitResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:id/analytics"
          element={
            <ProtectedRoute>
              <TestAnalytics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;