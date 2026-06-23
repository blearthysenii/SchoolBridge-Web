import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const meta = document.querySelector("meta[name='viewport']");
    if (meta) {
      meta.setAttribute("content", "width=device-width, initial-scale=1");
    }
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/forgot-password", {
        email,
      });

      setMessage(
        response.data.message ||
          "Kodi per rivendosjen e fjalekalimit u dergua ne email."
      );

      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            email,
          },
        });
      }, 1200);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Ndodhi nje gabim. Ju lutem provoni perseri."
      );
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

        .forgot-page {
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

        .forgot-card {
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

        .forgot-title {
          margin: 0 0 8px;
          text-align: center;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: -0.6px;
          color: #111827;
        }

        .forgot-subtitle {
          margin: 0 0 26px;
          text-align: center;
          font-size: 14.5px;
          line-height: 1.5;
          color: #6b7280;
        }

        .forgot-form {
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

        .forgot-input {
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

        .forgot-input::placeholder {
          color: #9ca3af;
        }

        .forgot-input:-webkit-autofill,
        .forgot-input:-webkit-autofill:hover,
        .forgot-input:-webkit-autofill:focus,
        .forgot-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111827 !important;
          caret-color: #111827 !important;
          transition: background-color 9999s ease-in-out 0s;
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
          .forgot-card {
            padding: 28px 22px 24px;
          }

          .forgot-title {
            font-size: 23px;
          }
        }
      `}</style>

      <main className="forgot-page">
        <section className="forgot-card">
          <div className="brand">
            <div className="brand-mark">SB</div>
            <div className="brand-text">SchoolBridge</div>
          </div>

          <h1 className="forgot-title">Keni harruar fjalekalimin?</h1>

          <p className="forgot-subtitle">
            Shkruani email-in tuaj dhe do t&apos;ju dergojme kodin per
            rivendosjen e fjalekalimit.
          </p>

          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}

          <form onSubmit={handleForgotPassword} className="forgot-form">
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                className="forgot-input"
                type="email"
                placeholder="Email adresa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} className="main-button">
              {loading ? "Duke derguar..." : "Dergo kodin"}
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

export default ForgotPassword;
