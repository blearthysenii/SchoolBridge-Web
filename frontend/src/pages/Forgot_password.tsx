import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import tableImg from "../images/table.png";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const meta = document.querySelector("meta[name='viewport']");
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1");
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/users/forgot-password", { email });
      setMessage(response.data.message || "Kodi per rivendosjen e fjalekalimit u dergua ne email.");
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ndodhi nje gabim. Ju lutem provoni perseri.");
    } finally {
      setLoading(false);
    }
  };

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
          overflow: hidden;
        }

        .sb-frame-inner {
          width: 100%;
          background: #ffffff;
          border-radius: 12px;
          border: none;
          box-shadow: none;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .sb-page {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: transparent;
        }

        /* NAV */
        .sb-nav {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 28px 52px 0 0;
          flex-shrink: 0;
        }
        .sb-nav-links { display: flex; gap: 48px; list-style: none; }
        .sb-nav-links a {
          font-size: 14px; font-weight: 400; color: #b8b8b8;
          text-decoration: none; letter-spacing: 0.01em; transition: color 0.15s;
        }
        .sb-nav-links a:hover { color: #1a1a1a; }

        /* BODY */
        .sb-body {
          flex: 1;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          min-height: 0;
        }

        /* LEFT COLUMN */
        .sb-left {
          width: 600px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 64px 0 64px 220px;
        }

        /* WORDMARK */
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

        /* CARD */
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

        /* MESSAGES */
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

        /* HEADING inside card */
        .sb-card-title {
          font-size: 15px;
          font-weight: 500;
          color: #aaa;
          letter-spacing: 0.04em;
          text-align: center;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        /* FORM */
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

        /* BUTTON */
        .sb-btn {
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
        .sb-btn:hover:not(:disabled) { background: #333; }
        .sb-btn:disabled { background: #aaa; cursor: not-allowed; }

        /* BOTTOM LINK */
        .sb-bottom-text {
          text-align: center;
          font-size: 14px;
          color: #c0c0c0;
          margin-top: 28px;
        }
        .sb-bottom-link {
          font-weight: 700;
          color: #1a1a1a;
          text-decoration: none;
        }
        .sb-bottom-link:hover { opacity: 0.55; }

        /* RIGHT COLUMN */
        .sb-illustration {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0;
          overflow: hidden;
          min-height: 0;
        }
        .sb-board-img {
          width: auto;
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

        /* RESPONSIVE */
        @media (min-width: 1600px) {
          .sb-left     { width: 660px; padding-left: 120px; }
          .sb-card     { width: 510px; padding: 68px 64px 56px; }
          .sb-wordmark { font-size: 52px; }
          .sb-board-img { height: min(720px, 80vh); max-height: 80vh; }
        }

        @media (max-width: 1599px) and (min-width: 1231px) {
          .sb-board-img { height: min(600px, 75vh); max-height: 75vh; }
        }

        @media (max-width: 1230px) {
          .sb-frame       { padding: 0; overflow-y: auto; height: auto; min-height: 100vh; min-height: 100dvh; }
          .sb-frame-inner { border-radius: 0; overflow-y: auto; border: none; box-shadow: none; clip-path: none; }
          .sb-illustration { display: none; }

          .sb-nav { padding: 20px 24px 0; justify-content: center; }
          .sb-nav-links { display: none; }

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
          .sb-input { font-size: 16px; }
          .sb-input::placeholder { font-size: 16px; }
        }

        @media (max-width: 480px) {
          .sb-frame       { padding: 0; }
          .sb-frame-inner { border-radius: 0; border: none; box-shadow: none; clip-path: none; }
          .sb-nav         { padding: 16px 18px 0; }
          .sb-left        { padding: 28px 18px 0; }
          .sb-wordmark    { font-size: 20px; letter-spacing: 0.15em; margin-bottom: 20px; }
          .sb-card        { padding: 36px 22px 30px; }
          .sb-field       { margin-bottom: 30px; }
          .sb-input       { font-size: 16px; padding: 6px 26px 8px; }
          .sb-btn         { width: 120px; height: 42px; font-size: 14px; }
          .sb-bottom-text { margin-top: 20px; font-size: 13px; }
        }

        @media (max-width: 360px) {
          .sb-frame       { padding: 0; }
          .sb-frame-inner { border-radius: 0; border: none; box-shadow: none; clip-path: none; }
          .sb-wordmark    { font-size: 17px; letter-spacing: 0.12em; }
          .sb-card        { padding: 28px 16px 26px; }
          .sb-field       { margin-bottom: 24px; }
          .sb-btn         { width: 114px; height: 40px; font-size: 13.5px; }
        }
      `}</style>

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

              {/* LEFT */}
              <div className="sb-left">
                <div className="sb-wordmark">SCHOOLBRIDGE</div>

                <div className="sb-card">
                  {error   && <div className="sb-msg error">{error}</div>}
                  {message && <div className="sb-msg success">{message}</div>}

                  <p className="sb-card-title">
                    Shkruani email-in tuaj dhe do t'ju dërgojmë<br />
                    kodin për rivendosjen e fjalëkalimit.
                  </p>

                  <form onSubmit={handleForgotPassword} className="sb-form">
                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type="email"
                        placeholder="Email adresa"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>

                    <button type="submit" className="sb-btn" disabled={loading}>
                      {loading ? "Duke dërguar..." : "Dërgo kodin"}
                    </button>
                  </form>

                  <p className="sb-bottom-text">
                    <Link to="/login" className="sb-bottom-link">Kthehu te hyrja</Link>
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="sb-illustration">
                <img
                  className="sb-board-img"
                  src={tableImg}
                  alt="Dërrasa me ekuacione matematike"
                  draggable={false}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;