import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiLock,
  FiCalendar,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import api from "../services/api";

function CompleteGoogleRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(
    localStorage.getItem("google_name") || ""
  );

  const [dateBirth, setDateBirth] = useState("");
  const [role, setRole] = useState("teacher");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (!dateBirth) {
      alert("Please select your date of birth");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const email = localStorage.getItem("google_email");

      const response = await api.post("/users/google-complete-register", {
        full_name: fullName,
        email,
        date_birth: dateBirth,
        role,
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      localStorage.removeItem("google_email");
      localStorage.removeItem("google_name");

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert("Registration failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        html, body, #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .cgr-page {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }

        .cgr-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 36px 32px 32px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 28px rgba(15, 23, 42, 0.05);
        }

        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .brand-mark {
          width: 36px;
          height: 36px;
          background: #2563eb;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: -0.5px;
        }
        .brand-text {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.3px;
        }

        .cgr-title {
          margin: 0 0 8px;
          text-align: center;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: -0.6px;
          color: #111827;
        }

        .cgr-subtitle {
          margin: 0 0 26px;
          text-align: center;
          font-size: 14.5px;
          line-height: 1.5;
          color: #6b7280;
        }

        .cgr-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          padding-left: 2px;
        }

        .input-group {
          width: 100%;
          height: 48px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          padding: 0 14px;
          overflow: hidden;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .input-group:focus-within {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .input-icon {
          width: 18px;
          min-width: 18px;
          height: 18px;
          color: #9ca3af;
          margin-right: 11px;
        }

        .cgr-input {
          flex: 1;
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #111827;
          font-size: 15px;
          font-weight: 400;
          min-width: 0;
          font-family: inherit;
          padding: 0;
          margin: 0;
        }

        .cgr-input::placeholder {
          color: #9ca3af;
        }

        select.cgr-input {
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
        }

        input[type="date"].cgr-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.55;
        }

        .eye-button {
          width: 34px;
          min-width: 34px;
          height: 34px;
          border: none;
          background: transparent;
          color: #9ca3af;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }
        .eye-button:hover { color: #475569; }

        .main-button {
          width: 100%;
          height: 48px;
          margin-top: 6px;
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s ease;
        }

        .main-button:hover { background: #1d4ed8; }

        @media (max-width: 480px) {
          .cgr-card { padding: 28px 22px 24px; }
          .cgr-title { font-size: 23px; }
        }
      `}</style>

      <main className="cgr-page">
        <section className="cgr-card">
          <div className="brand">
            <div className="brand-mark">SB</div>
            <div className="brand-text">SchoolBridge</div>
          </div>

          <h1 className="cgr-title">Complete your account</h1>
          <p className="cgr-subtitle">
            Add a few details to finish setting up your SchoolBridge account.
          </p>

          <form onSubmit={handleCompleteRegister} className="cgr-form">
            <div className="field">
              <label className="field-label">Full Name</label>
              <div className="input-group">
                <FiUser className="input-icon" />
                <input
                  className="cgr-input"
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Role</label>
              <div className="input-group">
                {role === "teacher" ? (
                  <FaChalkboardTeacher className="input-icon" />
                ) : (
                  <FaUserGraduate className="input-icon" />
                )}
                <select
                  className="cgr-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Date of Birth</label>
              <div className="input-group">
                <FiCalendar className="input-icon" />
                <input
                  className="cgr-input"
                  type="date"
                  value={dateBirth}
                  onChange={(e) => setDateBirth(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  className="cgr-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Show or hide password"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Confirm Password</label>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  className="cgr-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Show or hide password"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="main-button">
              Complete Registration
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

export default CompleteGoogleRegister;
