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

        .reset-page {
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

        .reset-card {
          width: 100%;
          max-width: 410px;
          background: transparent;
        }

        .reset-title {
          margin: 0 0 10px;
          text-align: center;
          font-size: 36px;
          line-height: 1.05;
          font-weight: 600;
          letter-spacing: -1.6px;
          color: #050505;
        }

        .reset-subtitle {
          margin: 0 0 24px;
          text-align: center;
          font-size: 15px;
          line-height: 1.45;
          color: #74797a;
        }

        .reset-form {
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

        .reset-input {
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

        .reset-input::placeholder {
          color: #74797a;
        }

        .reset-input:-webkit-autofill,
        .reset-input:-webkit-autofill:hover,
        .reset-input:-webkit-autofill:focus,
        .reset-input:-webkit-autofill:active {
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

        .password-strength {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          margin-top: -4px;
        }

        .strength-bar {
          height: 3px;
          border-radius: 2px;
          background: #e0e0e0;
        }

        .strength-bar.weak {
          background: #e53935;
        }

        .strength-bar.medium {
          background: #fb8c00;
        }

        .strength-bar.strong {
          background: #43a047;
        }

        .strength-text {
          width: 100%;
          font-size: 12px;
          color: #74797a;
          text-align: right;
          margin-top: -6px;
        }

        .strength-text.weak {
          color: #e53935;
        }

        .strength-text.medium {
          color: #fb8c00;
        }

        .strength-text.strong {
          color: #43a047;
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

        .back-text {
          margin: 26px 0 0;
          text-align: center;
          font-size: 15px;
          color: #1a1a1a;
        }

        .back-link {
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
          .reset-page {
            padding: 24px;
          }

          .reset-title {
            font-size: 33px;
          }
        }
      `}</style>

      <main className="reset-page">
        <section className="reset-card">
          <h1 className="reset-title">
            Rivendos <br /> fjalekalimin
          </h1>

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