import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import tableImg from "../images/table.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [successMsg, setSuccessMsg]     = useState<string | null>(null);

  useEffect(() => {
    const meta = document.querySelector("meta[name='viewport']");
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const response = await api.post("/users/login", { email, password });
      localStorage.setItem("token", response.data.access_token);
      setSuccessMsg("Hyrja u krye me sukses!");
      setTimeout(() => navigate("/dashboard"), 1000);
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
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
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
    onError: () => setError("Hyrja me Google deshtoi. Provo perseri."),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Raleway:wght@200;300;400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          margin: 0;
          padding: 0;
        }

        html, body, #root {
          width: 100%;
          height: 100%;
          max-height: 100vh;
          background: #f0f0ee;
          overflow: hidden;
        }

        /* ══════════════════════════════════════════
           OUTER FRAME — wraps everything like a big card
        ══════════════════════════════════════════ */
        .sb-frame {
          height: 100vh;
          height: 100dvh;
          width: 100%;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 20px;
          background: #f0f0ee;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          /* Hard-lock: no scroll ever */
          overflow: hidden;
        }

        .sb-frame-inner {
          width: 100%;
          background: #ffffff;
          border-radius: 12px;
          border: none;
          box-shadow: none;
          /* Clip image inside the frame, no scroll */
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        /* ══════════════════════════════════════════
           PAGE shell inside the frame
        ══════════════════════════════════════════ */
        .sb-page {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: transparent;
        }

        /* ══════════════════════════════════════════
           NAV — top-right only
        ══════════════════════════════════════════ */
        .sb-nav {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 28px 52px 0 0;
          flex-shrink: 0;
        }

        .sb-nav-links {
          display: flex;
          gap: 48px;
          list-style: none;
        }

        .sb-nav-links a {
          font-size: 14px;
          font-weight: 400;
          color: #b8b8b8;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.15s;
        }
        .sb-nav-links a:hover { color: #1a1a1a; }

        /* ══════════════════════════════════════════
           BODY ROW — left + right columns
        ══════════════════════════════════════════ */
        .sb-body {
          flex: 1;
          display: flex;
          align-items: stretch;
          /* overflow hidden kills any scroll from the image */
          overflow: hidden;
          min-height: 0;
        }

        /* ══════════════════════════════════════════
           LEFT COLUMN
        ══════════════════════════════════════════ */
        .sb-left {
          width: 600px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 64px 0 64px 220px;
        }

        /* ══════════════════════════════════════════
           WORDMARK
        ══════════════════════════════════════════ */
        .sb-wordmark {
          font-family: 'Raleway', 'Inter', sans-serif;
          font-size: 46px;
          font-weight: 300;
          letter-spacing: 0.24em;
          color: #1a1a1a;
          text-transform: uppercase;
          user-select: none;
          white-space: nowrap;
          margin-bottom: 40px;
        }

        /* ══════════════════════════════════════════
           LOGIN CARD
        ══════════════════════════════════════════ */
        .sb-card {
          width: 470px;
          max-width: 100%;
          background: #ffffff;
          border-radius: 3px;
          padding: 60px 56px 52px;
          box-shadow:
            32px 0px 40px -20px rgba(0,0,0,0.10),
            0px 32px 48px -16px rgba(0,0,0,0.10);
        }

        /* ══════════════════════════════════════════
           MESSAGES
        ══════════════════════════════════════════ */
        .sb-msg {
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 4px;
          margin-bottom: 24px;
          text-align: center;
          font-weight: 500;
        }
        .sb-msg.error   { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; }
        .sb-msg.success { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }

        /* ══════════════════════════════════════════
           FORM
        ══════════════════════════════════════════ */
        .sb-form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sb-field {
          width: 100%;
          position: relative;
          margin-bottom: 40px;
        }

        .sb-input {
          width: 100%;
          border: none;
          border-bottom: 1px solid #e0e0e0;
          background: transparent !important;
          text-align: center;
          padding: 8px 32px 10px;
          font-size: 15px;
          font-weight: 400;
          color: #2a2a2a;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none;
          appearance: none;
          border-radius: 0;
          display: block;
        }

        /* Kill autofill colour */
        .sb-input:-webkit-autofill,
        .sb-input:-webkit-autofill:hover,
        .sb-input:-webkit-autofill:focus,
        .sb-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow:         0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #2a2a2a !important;
          caret-color: #2a2a2a;
          transition: background-color 9999s ease-in-out 0s;
        }

        .sb-input::placeholder { color: #c4c4c4; font-size: 15px; }
        .sb-input:focus { border-bottom-color: #999; }

        .sb-eye {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #cfcfcf;
          display: flex;
          align-items: center;
          transition: color 0.15s;
          line-height: 1;
        }
        .sb-eye:hover { color: #555; }

        /* ══════════════════════════════════════════
           LOG IN BUTTON
        ══════════════════════════════════════════ */
        .sb-login-btn {
          align-self: center;
          width: 148px;
          height: 46px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: background 0.15s;
          margin-top: 2px;
        }
        .sb-login-btn:hover:not(:disabled) { background: #333; }
        .sb-login-btn:disabled { background: #aaa; cursor: not-allowed; }

        /* ══════════════════════════════════════════
           SECONDARY LINKS
        ══════════════════════════════════════════ */
        .sb-secondary-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          margin-top: 28px;
        }

        .sb-signup-link {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          text-decoration: none;
          letter-spacing: 0.01em;
        }
        .sb-signup-link:hover { opacity: 0.55; }

        .sb-forgot-link {
          font-size: 14px;
          font-weight: 400;
          color: #c0c0c0;
          text-decoration: none;
        }
        .sb-forgot-link:hover { color: #555; }

        /* ══════════════════════════════════════════
           DIVIDER
        ══════════════════════════════════════════ */
        .sb-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          margin: 28px 0 20px;
          color: #d0d0d0;
          font-size: 12px;
          letter-spacing: 0.04em;
        }
        .sb-divider::before,
        .sb-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e8e8e8;
        }

        /* ══════════════════════════════════════════
           GOOGLE BUTTON
        ══════════════════════════════════════════ */
        .sb-google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 46px;
          background: #fff;
          border: 1px solid #e4e4e4;
          border-radius: 100px;
          font-size: 14.5px;
          font-weight: 500;
          color: #3a3a3a;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .sb-google-btn:hover:not(:disabled) { background: #f9f9f9; border-color: #d0d0d0; }
        .sb-google-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .sb-google-btn svg { flex-shrink: 0; }

        /* ══════════════════════════════════════════
           RIGHT COLUMN — whiteboard image
           Always pinned to the RIGHT edge of frame.
           Height = card height so it never causes scroll.
        ══════════════════════════════════════════ */
        .sb-illustration {
          flex: 1;
          display: flex;
          align-items: center;
          /* Always flush to the right border */
          justify-content: flex-end;
          padding: 0;
          overflow: hidden;
          min-height: 0;
        }

        .sb-board-img {
          width: auto;
          /* Never taller than the visible frame — use vh-based cap */
          height: min(660px, 78vh);
          max-height: 78vh;
          object-fit: contain;
          object-position: right center;
          display: block;
          user-select: none;
          -webkit-user-drag: none;
          flex-shrink: 0;
          margin-right: 0;
        }

        /* ══════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
           Every breakpoint keeps image pinned RIGHT
           and scales proportionally.
        ══════════════════════════════════════════ */

        /* ── Large desktop 1600px+ ── */
        @media (min-width: 1600px) {
          .sb-left     { width: 660px; padding-left: 120px; }
          .sb-card     { width: 510px; padding: 68px 64px 56px; }
          .sb-wordmark { font-size: 52px; }
          .sb-board-img { height: min(720px, 80vh); max-height: 80vh; }
        }

        /* ── Standard desktop 1231–1599px ── */
        @media (max-width: 1599px) and (min-width: 1231px) {
          .sb-board-img { height: min(600px, 75vh); max-height: 75vh; }
        }

        /* ── Below 1230px: single column, login centred, hide image ── */
        @media (max-width: 1230px) {
          .sb-frame       { padding: 0; overflow-y: auto; height: auto; min-height: 100vh; min-height: 100dvh; }
          .sb-frame-inner { border-radius: 0; overflow-y: auto; border: none; box-shadow: none; clip-path: none; }
          .sb-illustration { display: none; }

          .sb-nav {
            padding: 20px 24px 0;
            justify-content: center;
          }
          /* Hide nav links on mobile */
          .sb-nav-links { display: none; }
          /* Remove card shadow and border on mobile */
          .sb-card {
            box-shadow: none !important;
            border: none;
          }
          .sb-nav-links { gap: 32px; }
          .sb-nav-links a { font-size: 13.5px; }

          .sb-body {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: visible;
            padding-bottom: 48px;
          }

          .sb-left {
            width: 100%;
            align-items: center;
            padding: 40px 24px 0;
          }

          .sb-wordmark {
            font-size: 28px;
            letter-spacing: 0.20em;
            margin-bottom: 28px;
            text-align: center;
            white-space: normal;
          }

          .sb-card {
            width: 100%;
            max-width: 440px;
            padding: 52px 44px 44px;
            box-shadow: none;
            border: none;
          }
          /* Prevent iOS zoom on input focus */
          .sb-input { font-size: 16px; }
          .sb-input::placeholder { font-size: 16px; }

          /* Hide whiteboard below 1024px */
          .sb-illustration { display: none; }
        }

        /* ── Phone ≤480px ── */
        @media (max-width: 480px) {
          .sb-frame       { padding: 0; }
          .sb-frame-inner { border-radius: 0; border: none; box-shadow: none; clip-path: none; }
          .sb-nav         { padding: 16px 18px 0; }
          .sb-nav-links   { gap: 22px; }
          .sb-nav-links a { font-size: 13px; }
          .sb-left        { padding: 28px 18px 0; }
          .sb-wordmark    { font-size: 20px; letter-spacing: 0.15em; margin-bottom: 20px; }
          .sb-card        { padding: 36px 22px 30px; }
          .sb-field       { margin-bottom: 30px; }
          .sb-input       { font-size: 16px; padding: 6px 26px 8px; }
          .sb-input::placeholder { font-size: 13.5px; }
          .sb-login-btn   { width: 120px; height: 42px; font-size: 14px; }
          .sb-secondary-actions { margin-top: 20px; gap: 12px; }
          .sb-signup-link { font-size: 14px; }
          .sb-forgot-link { font-size: 13px; }
          .sb-divider     { margin: 20px 0 14px; }
          .sb-google-btn  { height: 42px; font-size: 13.5px; }
        }

        /* ── Small phone ≤360px ── */
        @media (max-width: 360px) {
          .sb-frame       { padding: 0; }
          .sb-frame-inner { border-radius: 0; border: none; box-shadow: none; clip-path: none; }
          .sb-nav-links   { gap: 16px; }
          .sb-nav-links a { font-size: 12px; }
          .sb-wordmark    { font-size: 17px; letter-spacing: 0.12em; }
          .sb-card        { padding: 28px 16px 26px; }
          .sb-field       { margin-bottom: 24px; }
          .sb-input       { font-size: 16px; }
          .sb-login-btn   { width: 114px; height: 40px; font-size: 13.5px; }
          .sb-signup-link { font-size: 13.5px; }
          .sb-google-btn  { height: 40px; font-size: 13px; gap: 7px; }
          .sb-google-btn svg { width: 15px; height: 15px; }
        }
      `}</style>

      {/* ── OUTER FRAME ── */}
      <div className="sb-frame">
        <div className="sb-frame-inner">
          <div className="sb-page">

            {/* NAV */}
            <nav className="sb-nav">
              <ul className="sb-nav-links">
                <li><a href="#">Kryefaqja</a></li>
                <li><a href="#">Rreth nesh</a></li>
                <li><a href="#">Kontakt</a></li>
              </ul>
            </nav>

            {/* BODY */}
            <div className="sb-body">

              {/* LEFT: wordmark + card */}
              <div className="sb-left">
                <div className="sb-wordmark">SCHOOLBRIDGE</div>

                <div className="sb-card">
                  {error      && <div className="sb-msg error">{error}</div>}
                  {successMsg && <div className="sb-msg success">{successMsg}</div>}

                  <form onSubmit={handleLogin} className="sb-form">

                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type="email"
                        placeholder="Shkruaj email-in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Fjalëkalimi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="sb-eye"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label="Shfaq ose fshih fjalëkalimin"
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="1.8">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="1.8">
                            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>

                    <button className="sb-login-btn" type="submit" disabled={loading}>
                      {loading ? "Duke hyrë..." : "Hyr"}
                    </button>

                  </form>

                  <div className="sb-secondary-actions">
                    <Link className="sb-signup-link" to="/register">Regjistrohu</Link>
                    <Link className="sb-forgot-link" to="/forgot-password">Keni harruar fjalëkalimin?</Link>
                  </div>

                  <div className="sb-divider">or</div>

                  <button
                    type="button"
                    className="sb-google-btn"
                    onClick={() => googleLogin()}
                    disabled={loading}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Vazhdo me Google
                  </button>

                </div>{/* end .sb-card */}
              </div>{/* end .sb-left */}

              {/* RIGHT: whiteboard image */}
              <div className="sb-illustration">
                <img
                  className="sb-board-img"
                  src={tableImg}
                  alt="Dërrasa me ekuacione matematike"
                  draggable={false}
                />
              </div>

            </div>{/* end .sb-body */}
          </div>{/* end .sb-page */}
        </div>{/* end .sb-frame-inner */}
      </div>{/* end .sb-frame */}
    </>
  );
}

export default Login;