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

        .forgot-page {
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

        .forgot-card {
          width: 100%;
          max-width: 410px;
          background: transparent;
        }

        .forgot-title {
          margin: 0 0 10px;
          text-align: center;
          font-size: 36px;
          line-height: 1.05;
          font-weight: 600;
          letter-spacing: -1.6px;
          color: #050505;
        }

        .forgot-subtitle {
          margin: 0 0 24px;
          text-align: center;
          font-size: 15px;
          line-height: 1.45;
          color: #74797a;
        }

        .forgot-form {
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

        .forgot-input {
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

        .forgot-input::placeholder {
          color: #74797a;
        }

        .forgot-input:-webkit-autofill,
        .forgot-input:-webkit-autofill:hover,
        .forgot-input:-webkit-autofill:focus,
        .forgot-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111111 !important;
          caret-color: #111111 !important;
          transition: background-color 9999s ease-in-out 0s;
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
          .forgot-page {
            padding: 24px;
          }

          .forgot-title {
            font-size: 33px;
          }
        }
      `}</style>

      <main className="forgot-page">
        <section className="forgot-card">
          <h1 className="forgot-title">
            Keni harruar <br /> fjalekalimin?
          </h1>

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