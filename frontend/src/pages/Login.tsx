import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      setSuccessMsg("Hyrja u krye me sukses!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Email ose fjalëkalim i pasaktë.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!credentialResponse.credential) {
        setError("Nuk u pranua kredenciali nga Google.");
        return;
      }

      const response = await api.post("/users/google-login", {
        credential: credentialResponse.credential,
      });

      if (response.data.status === "existing_user") {
        localStorage.setItem("token", response.data.access_token);
        setSuccessMsg("Hyrja me Google u krye me sukses!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);

        return;
      }

      if (response.data.status === "new_user") {
        localStorage.setItem("google_email", response.data.email);
        localStorage.setItem("google_name", response.data.full_name || "");

        navigate("/complete-google-register");
        return;
      }

      setError("Përgjigje e papritur nga Google login.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Hyrja me Google dështoi. Provo përsëri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f5f5f7;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          background:
            radial-gradient(circle at top, rgba(255,255,255,0.95), transparent 35%),
            linear-gradient(135deg, #ffffff 0%, #f4f4f5 45%, #d9d9dd 100%);
        }

        .login-content {
          width: 100%;
          max-width: 430px;
        }

        .login-title {
          margin: 0;
          color: #111;
          font-size: 38px;
          font-weight: 800;
          letter-spacing: -1.2px;
          text-align: center;
        }

        .login-subtitle {
          margin: 10px 0 30px;
          color: #6e6e73;
          font-size: 15px;
          text-align: center;
        }

        .google-box {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 28px 0;
          color: #8e8e93;
          font-size: 14px;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #d1d1d6;
        }

        .message {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 14px;
          margin-bottom: 16px;
          text-align: center;
        }

        .message.error {
          color: #b42318;
          background: #fff1f0;
          border: 1px solid #ffd6d3;
        }

        .message.success {
          color: #067647;
          background: #ecfdf3;
          border: 1px solid #abefc6;
        }

        .form-group {
          margin-bottom: 22px;
        }

        .form-label {
          display: block;
          margin-bottom: 10px;
          color: #111;
          font-size: 15px;
          font-weight: 700;
          text-align: left;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          height: 54px;
          border: 1px solid #cfcfd4;
          border-radius: 17px;
          padding: 0 17px;
          background: rgba(255, 255, 255, 0.72);
          color: #111;
          font-size: 15px;
          outline: none;
          transition: 0.25s ease;
        }

        .form-input.password {
          padding-right: 78px;
        }

        .form-input::placeholder {
          color: #777;
        }

        .form-input:focus {
          border-color: #111;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.06);
        }

        .show-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #111;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          padding: 8px;
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin: -4px 0 26px;
        }

        .forgot-link,
        .register-link {
          color: #111;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .forgot-link:hover,
        .register-link:hover {
          text-decoration: underline;
        }

        .login-button {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 18px;
          background: linear-gradient(135deg, #111 0%, #1f1f22 45%, #525256 100%);
          color: #fff;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.25s ease;
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.25);
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 44px rgba(0, 0, 0, 0.3);
        }

        .login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .register-text {
          margin: 28px 0 0;
          text-align: center;
          color: #6e6e73;
          font-size: 15px;
        }

        @media (max-width: 600px) {
          .login-page {
            align-items: flex-start;
            padding: 48px 22px 24px;
          }

          .login-content {
            max-width: 100%;
          }

          .login-title {
            font-size: 32px;
          }

          .login-subtitle {
            font-size: 14px;
            margin-bottom: 26px;
          }

          .divider {
            margin: 24px 0;
          }

          .form-input,
          .login-button {
            height: 52px;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-content">
          <h1 className="login-title">Mirë se erdhe përsëri</h1>
          <p className="login-subtitle">Hyr për të vazhduar në SchoolBridge</p>

          <div className="google-box">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Hyrja me Google dështoi. Provo përsëri.")}
              text="signin_with"
            />
          </div>

          <div className="divider">ose</div>

          {error && <div className="message error">{error}</div>}
          {successMsg && <div className="message success">{successMsg}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="Emaili juaj"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fjalëkalimi</label>

              <div className="input-wrapper">
                <input
                  className="form-input password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Fjalëkalimi juaj"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  className="show-btn"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Fsheh" : "Shfaq"}
                </button>
              </div>
            </div>

            <div className="forgot-row">
              <Link className="forgot-link" to="/forgot-password">
                Keni harruar fjalëkalimin?
              </Link>
            </div>

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Duke hyrë..." : "Hyr"}
            </button>
          </form>

          <p className="register-text">
            Nuk ke llogari?{" "}
            <Link className="register-link" to="/register">
              Regjistrohu
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;