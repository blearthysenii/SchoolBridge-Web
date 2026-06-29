import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/PageLoader";

const SplashScreen = lazy(() => import("./pages/SplashScreen"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CompleteGoogleRegister = lazy(() => import("./pages/CompleteGoogleRegister"));
const ForgotPassword = lazy(() => import("./pages/Forgot_password"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ClassroomDetails = lazy(() => import("./pages/ClassroomDetails"));
const TestDetails = lazy(() => import("./pages/TestDetails"));
const StudentResults = lazy(() => import("./pages/StudentResults"));
const SubmitResults = lazy(() => import("./pages/SubmitResults"));
const TestAnalytics = lazy(() => import("./pages/TestAnalytics"));
const InactiveClassrooms = lazy(() => import("./pages/InactiveClassrooms"));
const InactiveStudents = lazy(() => import("./pages/InactiveStudents"));
const InactiveSubjects = lazy(() => import("./pages/InactiveSubjects"));
const InactiveConcepts = lazy(() => import("./pages/InactiveConcepts"));
const ArchivedTests = lazy(() => import("./pages/ArchivedTests"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  useEffect(() => {
    document.getElementById("sb-boot-loader")?.remove();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
            path="/inactive-classrooms"
            element={
              <ProtectedRoute>
                <InactiveClassrooms />
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
