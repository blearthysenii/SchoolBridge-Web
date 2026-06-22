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
          background: #ffffff;
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
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Arial, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 410px;
          background: transparent;
        }

        .login-title {
          margin: 0 0 10px;
          text-align: center;
          font-size: 36px;
          line-height: 1.05;
          font-weight: 600;
          letter-spacing: -1.6px;
          color: #050505;
        }

        .login-subtitle {
          margin: 0 0 24px;
          text-align: center;
          font-size: 15px;
          color: #74797a;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .input-group {
          width: 100%;
          height: 50px;
          border: 1px solid #dedede;
          border-radius: 12px;
          background: #ffffff;
          display: flex;
          align-items: center;
          padding: 0 13px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .input-group:focus-within {
          border-color: #b9b9b9;
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.035);
        }

        .input-icon {
          width: 18px;
          min-width: 18px;
          height: 18px;
          color: #6f7470;
          margin-right: 12px;
        }

        .login-input {
          flex: 1;
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #111111;
          font-size: 16px;
          font-weight: 400;
          min-width: 0;
          font-family: inherit;
          padding: 0;
          margin: 0;
        }

        .login-input::placeholder {
          color: #74797a;
        }

        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover,
        .login-input:-webkit-autofill:focus,
        .login-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111111 !important;
          caret-color: #111111 !important;
          transition: background-color 9999s ease-in-out 0s;
        }

        .eye-button {
          width: 34px;
          min-width: 34px;
          height: 34px;
          border: none;
          background: transparent;
          color: #2f3331;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -4px;
        }

        .forgot-link {
          color: #111111;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .main-button {
          width: 100%;
          height: 52px;
          margin-top: 10px;
          border: none;
          border-radius: 999px;
          background: #1f2320;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }

        .main-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          color: #8a8f8c;
          font-size: 14px;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e0e0e0;
        }

        .google-button {
          width: 100%;
          height: 50px;
          border: 1px solid #dedede;
          border-radius: 12px;
          background: #ffffff;
          color: #1a1a1a;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .google-button:hover {
          border-color: #b9b9b9;
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.035);
        }

        .google-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .register-text {
          margin: 26px 0 0;
          text-align: center;
          font-size: 15px;
          color: #1a1a1a;
        }

        .register-link {
          color: #000000;
          font-weight: 700;
          text-decoration: none;
        }

        .message {
          padding: 11px 13px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 13px;
          text-align: center;
        }

        .message.success {
          background: #edf9f1;
          color: #157c3b;
        }

        .message.error {
          background: #fff0f0;
          color: #c62828;
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 24px;
          }

          .login-title {
            font-size: 33px;
          }
        }
      `}</style>

      <main className="login-page">
        <section className="login-card">
          <h1 className="login-title">
            Mire se erdhe <br /> perseri
          </h1>

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