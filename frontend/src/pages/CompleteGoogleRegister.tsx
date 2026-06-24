import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import tableImg from "../images/table.png";

function CompleteGoogleRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(
    localStorage.getItem("google_name") || ""
  );

  const [dateBirth, setDateBirth] = useState("");
  const role = "teacher";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const meta = document.querySelector("meta[name='viewport']");
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1");
  }, []);

  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (!dateBirth) {
      alert("Please select your date of birth");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const email = localStorage.getItem("google_email");

      const response = await api.post("/users/google-complete-register", {
        full_name: fullName,
        email,
        date_birth: dateBirth,
        role,
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      localStorage.removeItem("google_email");
      localStorage.removeItem("google_name");

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert("Registration failed");
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
        .sb-nav-links a:hover { color: #1a1a1a; }

        .sb-body {
          flex: 1;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          min-height: 0;
        }

        .sb-left {
          width: 600px;
          min-width: 600px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 50px 0 50px 220px;
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
          margin-bottom: 34px;
          flex-shrink: 0;
        }

        .sb-card {
          width: 470px;
          min-width: 470px;
          max-width: 470px;
          background: #ffffff;
          border-radius: 3px;
          padding: 42px 56px 40px;
          box-shadow:
            32px 0px 40px -20px rgba(0,0,0,0.10),
            0px 32px 48px -16px rgba(0,0,0,0.10);
        }

        .sb-form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sb-field {
          width: 100%;
          position: relative;
          margin-bottom: 26px;
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

        .sb-input:focus { border-bottom-color: #999; }

        .sb-input:disabled {
          color: #2a2a2a;
          opacity: 1;
          cursor: default;
          background: transparent !important;
        }

        .sb-input[readonly] {
          cursor: default;
        }


        select.sb-input {
          cursor: pointer;
          color: #c4c4c4;
        }

        select.sb-input.has-value {
          color: #2a2a2a;
        }

        input[type="date"].sb-input {
          color: #c4c4c4;
        }

        input[type="date"].sb-input.has-value {
          color: #2a2a2a;
        }

        input[type="date"].sb-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.45;
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
        .sb-eye:hover { color: #555; }

        .sb-btn {
          align-self: center;
          min-width: 190px;
          height: 46px;
          padding: 0 28px;
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
          margin-top: 4px;
        }
        .sb-btn:hover { background: #333; }

        .sb-note {
          margin-top: 24px;
          text-align: center;
          font-size: 13.5px;
          color: #b8b8b8;
          line-height: 1.5;
        }

        .sb-illustration {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0;
          overflow: hidden;
          min-height: 0;
          flex-shrink: 1;
          min-width: 0;
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

        @media (min-width: 1600px) {
          .sb-left { width: 660px; min-width: 660px; padding-left: 120px; }
          .sb-card { width: 510px; min-width: 510px; max-width: 510px; padding: 48px 64px 44px; }
          .sb-wordmark { font-size: 52px; }
          .sb-board-img { height: min(720px, 80vh); max-height: 80vh; }
        }

        @media (max-width: 1599px) and (min-width: 1231px) {
          .sb-board-img { height: min(600px, 75vh); max-height: 75vh; }
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
            min-width: 0;
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
            min-width: 0;
            max-width: 440px;
            padding: 40px 32px 36px;
            box-shadow: none;
            border: none;
          }

          .sb-input {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
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

          .sb-btn {
            min-width: 160px;
            height: 42px;
            font-size: 14px;
          }

          .sb-note {
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
            padding: 26px 14px 22px;
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
                  <form onSubmit={handleCompleteRegister} className="sb-form">
                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type="text"
                        placeholder="Emri i plotë"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="sb-field">
                      <input
                        className="sb-input has-value"
                        type="text"
                        value="Mësimdhënës"
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="sb-field">
                      <input
                        className={`sb-input ${dateBirth ? "has-value" : ""}`}
                        type="date"
                        value={dateBirth}
                        onChange={(e) => setDateBirth(e.target.value)}
                        required
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
                      />
                      <button
                        type="button"
                        className="sb-eye"
                        onClick={() => setShowPassword((prev) => !prev)}
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

                    <div className="sb-field">
                      <input
                        className="sb-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Konfirmo fjalëkalimin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="sb-eye"
                        onClick={() => setShowPassword((prev) => !prev)}
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

                    <button type="submit" className="sb-btn">
                      Përfundo regjistrimin
                    </button>
                  </form>

                  <p className="sb-note">
                    Plotëso të dhënat për të vazhduar në SchoolBridge.
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

export default CompleteGoogleRegister;
