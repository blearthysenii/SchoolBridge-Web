import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const meta = document.querySelector("meta[name='viewport']");
    if (meta) {
      meta.setAttribute("content", "width=device-width, initial-scale=1");
    }
  }, []);

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
      setError(err.response?.data?.detail || "Email ose fjalekalim i pasakte.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setError(null);
      setSuccessMsg(null);
      setLoading(true);

      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userInfo = await userInfoRes.json();

        const response = await api.post("/users/google-login", {
          credential: tokenResponse.access_token,
          user_info: userInfo,
        });

        if (response.data.status === "existing_user") {
          localStorage.setItem("token", response.data.access_token);
          setSuccessMsg("Hyrja me Google u krye me sukses!");
          setTimeout(() => navigate("/dashboard"), 1000);
          return;
        }

        if (response.data.status === "new_user") {
          localStorage.setItem("google_email", response.data.email);
          localStorage.setItem("google_name", response.data.full_name || "");
          navigate("/complete-google-register");
          return;
        }

        setError("Pergjigje e papritur nga Google login.");
      } catch (err: any) {
        setError(err.response?.data?.detail || "Hyrja me Google deshtoi. Provo perseri.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Hyrja me Google deshtoi. Provo perseri.");
    },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .login-page {
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

        .login-card {
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

        .login-title {
          margin: 0 0 8px;
          text-align: center;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: -0.6px;
          color: #111827;
        }

        .login-subtitle {
          margin: 0 0 26px;
          text-align: center;
          font-size: 14.5px;
          color: #6b7280;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
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

        .login-input {
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

        .login-input::placeholder {
          color: #9ca3af;
        }

        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover,
        .login-input:-webkit-autofill:focus,
        .login-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111827 !important;
          caret-color: #111827 !important;
          transition: background-color 9999s ease-in-out 0s;
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

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -2px;
        }

        .forgot-link {
          color: #2563eb;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 600;
        }
        .forgot-link:hover { color: #1d4ed8; }

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

        .main-button:hover:not(:disabled) { background: #1d4ed8; }
        .main-button:disabled {
          background: #93c5fd;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          color: #9ca3af;
          font-size: 13px;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .google-button {
          width: 100%;
          height: 48px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          color: #374151;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .google-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .google-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .register-text {
          margin: 24px 0 0;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        .register-link {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }
        .register-link:hover { color: #1d4ed8; }

        .message {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          margin-bottom: 16px;
          text-align: center;
        }

        .message.success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .message.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 22px 24px;
          }

          .login-title {
            font-size: 23px;
          }
        }
      `}</style>

      <main className="login-page">
        <section className="login-card">
          <div className="brand">
            <div className="brand-mark">SB</div>
            <div className="brand-text">SchoolBridge</div>
          </div>

          <h1 className="login-title">Mire se erdhe perseri</h1>

          <p className="login-subtitle">Hyr per te vazhduar ne SchoolBridge</p>

          {error && <div className="message error">{error}</div>}
          {successMsg && <div className="message success">{successMsg}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                className="login-input"
                type="email"
                placeholder="Email adresa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder="Fjalekalimi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Shfaq ose fsheh fjalekalimin"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="forgot-row">
              <Link className="forgot-link" to="/forgot-password">
                Keni harruar fjalekalimin?
              </Link>
            </div>

            <button className="main-button" type="submit" disabled={loading}>
              {loading ? "Duke hyre..." : "Hyr"}
            </button>
          </form>

          <div className="divider">ose</div>

          <button
            type="button"
            className="google-button"
            onClick={() => googleLogin()}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Hyr me Google
          </button>

          <p className="register-text">
            Nuk ke llogari?{" "}
            <Link className="register-link" to="/register">
              Regjistrohu
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default Login;
