import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div>
      <h1>Complete Google Register</h1>

      <form onSubmit={handleCompleteRegister}>
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

        <button type="submit">Complete Registration</button>
      </form>
    </div>
  );
}

export default CompleteGoogleRegister;