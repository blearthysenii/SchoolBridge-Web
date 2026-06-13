import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("teacher");
  const [dateBirth, setDateBirth] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/register", {
        full_name: fullName,
        role: role,
        date_birth: dateBirth,
        email,
        password,
      });

      setMessage("Verification code sent to your email.");
      setShowCodeInput(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/users/verify-email", {
        email,
        code,
      });

      setMessage("Account verified successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!showCodeInput ? (
        <form onSubmit={handleRegister}>
          <div>
            <label>Full Name</label>
            <br />

            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label>Role</label>
            <br />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>

          <br />

          <div>
            <label>Date of Birth</label>
            <br />

            <input
              type="date"
              value={dateBirth}
              onChange={(e) => setDateBirth(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label>Email</label>
            <br />

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label>Password</label>
            <br />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label>Confirm Password</label>
            <br />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <br />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide Passwords" : "Show Passwords"}
          </button>

          <br />
          <br />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <div>
            <label>Verification Code</label>

            <br />

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              maxLength={6}
              required
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <br />
          <br />

          <button
            type="button"
            onClick={() => {
              setShowCodeInput(false);
              setCode("");
            }}
          >
            Use different email
          </button>
        </form>
      )}

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Register;