import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashScreen from "./pages/SplashScreen";
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
import InactiveStudents from "./pages/InactiveStudents";
import InactiveSubjects from "./pages/InactiveSubjects";
import InactiveConcepts from "./pages/InactiveConcepts";
import ArchivedTests from "./pages/ArchivedTests";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />

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
        <Route
          path="/inactive-students"
          element={
            <ProtectedRoute>
              <InactiveStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inactive-subjects"
          element={
            <ProtectedRoute>
              <InactiveSubjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inactive-concepts"
          element={
            <ProtectedRoute>
              <InactiveConcepts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/archived-tests"
          element={
            <ProtectedRoute>
              <ArchivedTests />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;