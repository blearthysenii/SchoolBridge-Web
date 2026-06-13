import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/reset-password", {
        email,
        code,
        new_password: newPassword,
      });

      setMessage("Password reset successfully.");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Reset password failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>

      <p>Enter your code and create a new password.</p>

      {message && <p style={{ color: "green" }}>{message}</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleResetPassword}>
        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <br />

        <div>
          <label>Reset Code</label>
          <br />

          <input
            type="text"
            placeholder="Enter reset code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>New Password</label>
          <br />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Confirm Password</label>
          <br />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
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
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p>
        <Link to="/">Back to login</Link>
      </p>
    </div>
  );
}

export default ResetPassword;