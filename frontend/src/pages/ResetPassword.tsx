import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import tableImg from "../images/table.png";
import { getErrorMessage } from "../services/errors";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = (location.state as { email?: string } | null)?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const meta = document.querySelector("meta[name='viewport']");
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1");
  }, []);

  const passwordStrength = (() => {
    let strength = 0;

    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) strength++;

    return strength;
  })();

  const strengthLabels = ["", "E dobët", "Mesatare", "E fortë"];
  const strengthColors = ["", "#dc2626", "#d97706", "#16a34a"];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (code.trim().length < 4) {
      setError("Ju lutemi shkruani kodin e dërguar në adresën e emailit.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Fjalëkalimi duhet të ketë të paktën 8 karaktere.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Fjalëkalimet nuk përputhen.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/reset-password", {
        email,
        code,
        new_password: newPassword,
      });

      setMessage("Fjalëkalimi u rivendos me sukses.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Rivendosja e fjalëkalimit dështoi."));
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

        .sb-nav-links a:hover {
          color: #1a1a1a;
        }

        .sb-body {
          flex: 1;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          min-height: 0;
        }

        .sb-left {
          width: 680px;
          min-width: 680px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 48px 0 48px 80px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sb-left::-webkit-scrollbar {
          display: none;
        }

        .sb-wordmark {
          font-family: 'Raleway', 'Inter', sans-serif;
          font-size: 46px;
          font-weight: 300;
          letter-spacing: 0.24em;
          color: #1a1a1a;
          text-transform: uppercase;
          user-select: none;
          white-space: nowrap;
          margin-bottom: 30px;
          flex-shrink: 0;
          width: max-content;
          max-width: none;
        }

        .sb-card {
          width: 470px;
          min-width: 470px;
          max-width: none;
          background: #ffffff;
          border-radius: 3px;
          padding: 44px 56px 40px;
          flex-shrink: 0;
          box-shadow:
            32px 0px 40px -20px rgba(0,0,0,0.10),
            0px 32px 48px -16px rgba(0,0,0,0.10);
        }

        .sb-msg {
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 4px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 500;
        }

        .sb-msg.error {
          background:#fef2f2;
          color:#b91c1c;
          border:1px solid #fecaca;
        }

        .sb-msg.success {
          background:#f0fdf4;
          color:#15803d;
          border:1px solid #bbf7d0;
        }

        .sb-form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sb-field {
          width: 100%;
          position: relative;
          margin-bottom: 30px;
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
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #2a2a2a !important;
          caret-color: #2a2a2a;
          transition: background-color 9999s ease-in-out 0s;
        }

        .sb-input::placeholder {
          color: #c4c4c4;
          font-size: 15px;
        }

        .sb-input:focus {
          border-bottom-color: #999;
        }

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

        .sb-eye:hover {
          color: #555;
        }

        .sb-strength-bars {
          display: flex;
          gap: 6px;
          width: 100%;
          margin-top: -16px;
          margin-bottom: 6px;
        }

        .sb-strength-bar {
          flex: 1;
          height: 3px;
          border-radius: 999px;
          background: #e8e8e8;
          transition: background 0.2s;
        }

        .sb-strength-label {
          width: 100%;
          text-align: center;
          font-size: 11.5px;
          font-weight: 500;
          margin-bottom: 22px;
        }

        .sb-btn {
          align-self: center;
          height: 46px;
          min-width: 190px;
          padding: 0 30px;
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

        .sb-btn:hover:not(:disabled) {
          background: #333;
        }

        .sb-btn:disabled {
          background: #aaa;
          cursor: not-allowed;
        }

        .sb-back {
          text-align: center;
          font-size: 13.5px;
          color: #aaa;
          margin-top: 24px;
        }

        .sb-back a {
          font-weight: 700;
          color: #1a1a1a;
          text-decoration: none;
        }

        .sb-back a:hover {
          opacity: 0.55;
        }

        .sb-illustration {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0;
          overflow: hidden;
          min-height: 0;
        }

        .sb-board-img {
          width: auto;
          height: min(620px, 74vh);
          max-height: 74vh;
          object-fit: contain;
          object-position: right center;
          display: block;
          user-select: none;
          -webkit-user-drag: none;
          flex-shrink: 0;
          margin-right: 0;
        }

        @media (min-width: 1600px) {
          .sb-left {
            width: 760px;
            min-width: 760px;
            padding-left: 120px;
          }

          .sb-card {
            width: 510px;
            min-width: 510px;
            padding: 48px 64px 44px;
          }

          .sb-wordmark {
            font-size: 52px;
          }

          .sb-board-img {
            height: min(700px, 78vh);
            max-height: 78vh;
          }
        }

        @media (max-width: 1599px) and (min-width: 1231px) {
          .sb-left {
            width: 680px;
            min-width: 680px;
            padding-left: 80px;
          }

          .sb-wordmark {
            font-size: 46px;
            letter-spacing: 0.24em;
            white-space: nowrap;
          }

          .sb-card {
            width: 470px;
            min-width: 470px;
            max-width: none;
          }

          .sb-board-img {
            height: min(560px, 70vh);
            max-height: 70vh;
          }
        }

        @media (max-width: 1230px) {
          html, body, #root {
            max-height: none;
            overflow-y: auto;
          }

          .sb-frame {
            padding: 0;
            overflow-y: auto;
            height: auto;
            min-height: 100vh;
            min-height: 100dvh;
          }

          .sb-frame-inner {
            border-radius: 0;
            overflow-y: auto;
            border: none;
            box-shadow: none;
            clip-path: none;
          }

          .sb-illustration {
            display: none;
          }

          .sb-nav {
            padding: 20px 24px 0;
            justify-content: center;
          }

          .sb-nav-links {
            display: none;
          }

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
            overflow: visible;
          }

          .sb-wordmark {
            font-size: 28px;
            letter-spacing: 0.20em;
            margin-bottom: 28px;
            text-align: center;
            white-space: normal;
            width: auto;
            max-width: 100%;
          }

          .sb-card {
            width: 100%;
            min-width: 0;
            max-width: 440px;
            padding: 44px 32px 36px;
            box-shadow: none !important;
            border: none;
          }

          .sb-input {
            font-size: 16px;
          }

          .sb-input::placeholder {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .sb-frame {
            padding: 0;
          }

          .sb-frame-inner {
            border-radius: 0;
            border: none;
            box-shadow: none;
            clip-path: none;
          }

          .sb-nav {
            padding: 16px 18px 0;
          }

          .sb-left {
            padding: 28px 18px 0;
          }

          .sb-wordmark {
            font-size: 20px;
            letter-spacing: 0.15em;
            margin-bottom: 20px;
          }

          .sb-card {
            padding: 32px 18px 28px;
          }

          .sb-field {
            margin-bottom: 24px;
          }

          .sb-input {
            font-size: 16px;
            padding: 6px 26px 8px;
          }

          .sb-input::placeholder {
            font-size: 13.5px;
          }

          .sb-strength-bars {
            margin-top: -10px;
          }

          .sb-strength-label {
            margin-bottom: 18px;
          }

          .sb-btn {
            min-width: 160px;
            height: 42px;
            font-size: 14px;
          }

          .sb-back {
            margin-top: 20px;
            font-size: 13px;
          }
        }

        @media (max-width: 360px) {
          .sb-wordmark {
            font-size: 17px;
            letter-spacing: 0.12em;
          }

          .sb-card {
            padding: 26px 14px 24px;
          }

          .sb-field {
            margin-bottom: 22px;
          }

          .sb-btn {
            min-width: 150px;
            height: 40px;
            font-size: 13.5px;
          }
        }
      `}</style>

      <div className="sb-frame">
        <div className="sb-frame-inner">
          <div className="sb-page">
            <nav className="sb-nav">
              <ul className="sb-nav-links">
                <li><a href="#">Kryefaqja</a></li>
                <li><a href="#">Rreth nesh</a></li>
                <li><a href="#">Kontakt</a></li>
              </ul>
            </nav>

            <div className="sb-body">
              <div className="sb-left">
                <div className="sb-wordmark">SCHOOLBRIDGE</div>

                <div className="sb-card">
                  {error && <div className="sb-msg error">{error}</div>}
                  {message && <div className="sb-msg success">{message}</div>}

                  <form onSubmit={handleResetPassword} className="sb-form">
                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type="email"
                        placeholder="Adresa e emailit"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus={!emailFromState}
                        autoComplete="email"
                      />
                    </div>

                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type="text"
                        placeholder="Kodi i verifikimit"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Fjalëkalimi i ri"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="sb-eye"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label="Shfaq ose fsheh fjalëkalimin"
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

                    {newPassword.length > 0 && (
                      <>
                        <div className="sb-strength-bars">
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="sb-strength-bar"
                              style={{
                                background:
                                  item <= passwordStrength
                                    ? strengthColors[passwordStrength]
                                    : "#e8e8e8",
                              }}
                            />
                          ))}
                        </div>

                        <div
                          className="sb-strength-label"
                          style={{ color: strengthColors[passwordStrength] }}
                        >
                          {strengthLabels[passwordStrength]}
                        </div>
                      </>
                    )}

                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Konfirmo fjalëkalimin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="sb-eye"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label="Shfaq ose fsheh konfirmimin e fjalëkalimit"
                      >
                        {showConfirmPassword ? (
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

                    <button type="submit" disabled={loading} className="sb-btn">
                      {loading ? "Duke ruajtur..." : "Ruaj fjalëkalimin"}
                    </button>
                  </form>

                  <p className="sb-back">
                    <Link to="/login">Kthehu te hyrja</Link>
                  </p>
                </div>
              </div>

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

export default ResetPassword;
