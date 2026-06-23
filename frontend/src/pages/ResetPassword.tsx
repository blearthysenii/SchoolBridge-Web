import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
} from "react-icons/fi";
import api from "../services/api";

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
    if (meta) {
      meta.setAttribute("content", "width=device-width, initial-scale=1");
    }
  }, []);

  const passwordStrength = (() => {
    let strength = 0;

    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) strength++;

    return strength;
  })();

  const strengthLabels = ["", "E dobet", "Mesatare", "E forte"];
  const strengthClasses = ["", "weak", "medium", "strong"];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (code.trim().length < 4) {
      setError("Ju lutem shkruani kodin e derguar ne email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Fjalekalimi duhet te kete te pakten 8 karaktere.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Fjalekalimet nuk perputhen.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/reset-password", {
        email,
        code,
        new_password: newPassword,
      });

      setMessage("Fjalekalimi u rivendos me sukses.");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Rivendosja e fjalekalimit deshtoi.");
    } finally {
      setLoading(false);
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

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .reset-page {
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

        .reset-card {
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

        .reset-title {
          margin: 0 0 8px;
          text-align: center;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: -0.6px;
          color: #111827;
        }

        .reset-subtitle {
          margin: 0 0 26px;
          text-align: center;
          font-size: 14.5px;
          line-height: 1.5;
          color: #6b7280;
        }

        .reset-form {
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

        .reset-input {
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

        .reset-input::placeholder {
          color: #9ca3af;
        }

        .reset-input:-webkit-autofill,
        .reset-input:-webkit-autofill:hover,
        .reset-input:-webkit-autofill:focus,
        .reset-input:-webkit-autofill:active {
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

        .password-strength {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
          margin-top: -4px;
        }

        .strength-bar {
          height: 4px;
          border-radius: 99px;
          background: #e5e7eb;
        }

        .strength-bar.weak {
          background: #dc2626;
        }

        .strength-bar.medium {
          background: #f59e0b;
        }

        .strength-bar.strong {
          background: #16a34a;
        }

        .strength-text {
          width: 100%;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-align: right;
          margin-top: -6px;
        }

        .strength-text.weak {
          color: #dc2626;
        }

        .strength-text.medium {
          color: #f59e0b;
        }

        .strength-text.strong {
          color: #16a34a;
        }

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

        .back-text {
          margin: 24px 0 0;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        .back-link {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }
        .back-link:hover { color: #1d4ed8; }

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
          .reset-card {
            padding: 28px 22px 24px;
          }

          .reset-title {
            font-size: 23px;
          }
        }
      `}</style>

      <main className="reset-page">
        <section className="reset-card">
          <div className="brand">
            <div className="brand-mark">SB</div>
            <div className="brand-text">SchoolBridge</div>
          </div>

          <h1 className="reset-title">Rivendos fjalekalimin</h1>

          <p className="reset-subtitle">
            Shkruani kodin e derguar ne email dhe krijoni nje fjalekalim te ri.
          </p>

          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}

          <form onSubmit={handleResetPassword} className="reset-form">
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                className="reset-input"
                type="email"
                placeholder="Email adresa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={!emailFromState}
              />
            </div>

            <div className="input-group">
              <FiShield className="input-icon" />
              <input
                className="reset-input"
                type="text"
                placeholder="Kodi i verifikimit"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                className="reset-input"
                type={showPassword ? "text" : "password"}
                placeholder="Fjalekalimi i ri min. 8 karaktere"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            {newPassword.length > 0 && (
              <>
                <div className="password-strength">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`strength-bar ${
                        item <= passwordStrength
                          ? strengthClasses[passwordStrength]
                          : ""
                      }`}
                    />
                  ))}
                </div>

                <div className={`strength-text ${strengthClasses[passwordStrength]}`}>
                  {strengthLabels[passwordStrength]}
                </div>
              </>
            )}

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                className="reset-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmo fjalekalimin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="eye-button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label="Shfaq ose fsheh konfirmimin e fjalekalimit"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="main-button">
              {loading ? "Duke ruajtur..." : "Ruaj fjalekalimin"}
            </button>
          </form>

          <p className="back-text">
            <Link to="/" className="back-link">
              Kthehu te hyrja
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default ResetPassword;
