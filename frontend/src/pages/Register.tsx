import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import tableImg from "../images/table.png";
import { getErrorMessage } from "../services/errors";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName]           = useState("");
  const [role] = useState("teacher"); // always teacher, not changeable
  const [birthDay, setBirthDay]           = useState("");
  const [birthMonth, setBirthMonth]       = useState("");
  const [birthYear, setBirthYear]         = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [code, setCode]                   = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage]             = useState("");
  const [error, setError]                 = useState("");

  useEffect(() => {
    const meta = document.querySelector("meta[name='viewport']");
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1");
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const currentYear = new Date().getFullYear();
  const minAge  = role === "teacher" ? 18 : 5;
  const maxYear = currentYear - minAge;
  const minYear = maxYear - 80;
  const years   = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const months = [
    { value: "01", label: "Janar"   }, { value: "02", label: "Shkurt"  },
    { value: "03", label: "Mars"    }, { value: "04", label: "Prill"   },
    { value: "05", label: "Maj"     }, { value: "06", label: "Qershor" },
    { value: "07", label: "Korrik"  }, { value: "08", label: "Gusht"   },
    { value: "09", label: "Shtator" }, { value: "10", label: "Tetor"   },
    { value: "11", label: "Nëntor"  }, { value: "12", label: "Dhjetor" },
  ];

  const getDaysInMonth = (m: string, y: string) =>
    !m || !y ? 31 : new Date(parseInt(y), parseInt(m), 0).getDate();

  const daysInMonth = getDaysInMonth(birthMonth, birthYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  const dateBirth = birthYear && birthMonth && birthDay
    ? `${birthYear}-${birthMonth}-${birthDay}` : "";

  const validateBirthDate = () => {
    if (!birthYear || !birthMonth || !birthDay) {
      setError("Ju lutem plotësoni datën e lindjes.");
      return false;
    }
    const birth   = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - minAge);
    if (birth > maxDate) {
      setError(role === "teacher"
        ? "Mësuesi duhet të jetë së paku 18 vjeç."
        : "Nxënësi duhet të jetë së paku 5 vjeç.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    if (!validateBirthDate()) return;
    if (password.length < 8) { setError("Fjalëkalimi duhet të ketë të paktën 8 karaktere."); return; }
    if (password !== confirmPassword) { setError("Fjalëkalimet nuk përputhen."); return; }
    setLoading(true);
    try {
      await api.post("/users/register", { full_name: fullName, role, date_birth: dateBirth, email, password });
      setMessage("Kodi i verifikimit u dërgua në adresën e emailit.");
      setShowCodeInput(true);
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Regjistrimi dështoi."));
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError(""); setLoading(true);
    try {
      await api.post("/users/verify-email", { email, code });
      setMessage("Llogaria u verifikua me sukses!");
      setTimeout(() => navigate("/login"), 500);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Kodi i verifikimit nuk është i vlefshëm."));
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setMessage(""); setError(""); setLoading(true);
    try {
      await api.post("/users/resend-code", { email });
      setMessage("Kodi i ri u dërgua në adresën e emailit.");
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ri-dërgimi dështoi."));
    } finally { setLoading(false); }
  };

  const passwordStrength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabels  = ["", "E dobët", "Mesatare", "E fortë"];
  const strengthColors  = ["", "#e53e3e", "#d97706", "#16a34a"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Raleway:wght@200;300;400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          margin: 0; padding: 0;
        }

        html, body, #root {
          width: 100%;
          min-height: 100dvh;
          height: auto;
          background: #f0f0ee;
          overflow-x: hidden;
          overflow-y: auto;
        }

        /* ── OUTER FRAME ── */
        .sb-frame {
          min-height: 100dvh;
          height: auto;
          width: 100%;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 20px;
          padding-bottom: max(20px, env(safe-area-inset-bottom));
          background: #f0f0ee;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
          overflow-y: auto;
        }

        .sb-frame-inner {
          width: 100%;
          background: #ffffff;
          border-radius: 12px;
          border: none;
          box-shadow: none;
          min-height: calc(100dvh - 40px);
          height: auto;
          overflow: visible;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        /* ── PAGE ── */
        .sb-page {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: transparent;
          min-height: 100%;
          height: auto;
          overflow: visible;
        }

        /* ── NAV ── */
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

        /* ── BODY ── */
        .sb-body {
          flex: 1;
          display: flex;
          align-items: stretch;
          overflow: visible;
          min-height: 0;
        }

        /* ── LEFT COLUMN ── */
        .sb-left {
          width: 600px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 64px 0 64px 220px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
        }
        .sb-left::-webkit-scrollbar { display: none; }

        /* ── WORDMARK ── */
        .sb-wordmark {
          font-family: 'Raleway', 'Inter', sans-serif;
          font-size: 46px; font-weight: 300;
          letter-spacing: 0.24em; color: #1a1a1a;
          text-transform: uppercase; user-select: none;
          white-space: nowrap; margin-bottom: 40px;
          flex-shrink: 0;
        }

        /* ── REGISTER CARD — static size, never changes above 1024px ── */
        .sb-card {
          width: 470px;
          max-width: 100%;
          background: #ffffff;
          border-radius: 3px;
          padding: 48px 56px 44px;
          box-shadow:
            32px 0px 40px -20px rgba(0,0,0,0.10),
            0px 32px 48px -16px rgba(0,0,0,0.10);
          flex-shrink: 0;
        }

        /* ── MESSAGES ── */
        .sb-msg {
          font-size: 13px; padding: 10px 14px; border-radius: 4px;
          margin-bottom: 20px; text-align: center; font-weight: 500;
        }
        .sb-msg.error   { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; }
        .sb-msg.success { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }

        /* ── FORM ── */
        .sb-form { display: flex; flex-direction: column; align-items: center; }

        .sb-field {
          width: 100%; position: relative; margin-bottom: 32px;
        }

        .sb-label {
          font-size: 11px; font-weight: 500; color: #aaa;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 8px; display: block; text-align: center;
        }

        .sb-input {
          width: 100%;
          border: none;
          border-bottom: 1px solid #e0e0e0;
          background: transparent !important;
          text-align: center;
          padding: 8px 32px 10px;
          font-size: 15px; font-weight: 400; color: #2a2a2a;
          font-family: inherit; outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none; appearance: none;
          border-radius: 0; display: block;
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
        .sb-input::placeholder { color: #c4c4c4; font-size: 15px; }
        .sb-input:focus { border-bottom-color: #999; }

        /* Select same style as input */
        .sb-select {
          width: 100%;
          border: none;
          border-bottom: 1px solid #e0e0e0;
          background: transparent;
          text-align: center;
          padding: 8px 0 10px;
          font-size: 15px; font-weight: 400; color: #2a2a2a;
          font-family: inherit; outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none; appearance: none;
          cursor: pointer; border-radius: 0;
        }
        .sb-select:focus { border-bottom-color: #999; }
        .sb-select option { color: #2a2a2a; }

        /* Date group — 3 selects in a row */
        .sb-date-group {
          width: 100%;
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
        }
        .sb-date-col { flex: 1; display: flex; flex-direction: column; }
        .sb-date-label {
          font-size: 11px; font-weight: 500; color: #aaa;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 6px; text-align: center;
        }



        /* Eye toggle */
        .sb-eye {
          position: absolute; right: 0; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          padding: 4px; color: #cfcfcf;
          display: flex; align-items: center;
          transition: color 0.15s; line-height: 1;
        }
        .sb-eye:hover { color: #555; }

        /* Password strength */
        .sb-strength-bars {
          display: flex; gap: 6px; width: 100%; margin-bottom: 6px; margin-top: -20px;
        }
        .sb-strength-bar {
          flex: 1; height: 3px; border-radius: 2px;
          background: #e8e8e8; transition: background 0.3s;
        }
        .sb-strength-label {
          font-size: 11px; font-weight: 500;
          margin-bottom: 20px; text-align: center; width: 100%;
        }

        /* Role toggle */
        .sb-role-toggle {
          display: flex;
          width: 100%;
          background: #f5f5f5;
          border-radius: 100px;
          padding: 3px;
          margin-bottom: 32px;
        }
        .sb-role-btn {
          flex: 1;
          height: 36px;
          border: none;
          border-radius: 100px;
          font-size: 13.5px;
          font-weight: 500;
          font-family: inherit;
          cursor: default;
          background: transparent;
          color: #bbb;
          pointer-events: none;
        }
        .sb-role-btn.active {
          background: #1a1a1a;
          color: #fff;
        }

        /* ── MAIN BUTTON ── */
        .sb-btn {
          align-self: center;
          height: 46px;
          padding: 0 32px;
          min-width: 180px;
          background: #1a1a1a; color: #fff;
          border: none; border-radius: 100px;
          font-size: 15px; font-weight: 500;
          font-family: inherit; cursor: pointer;
          letter-spacing: 0.01em; transition: background 0.15s;
          margin-top: 8px;
        }
        .sb-btn:hover:not(:disabled) { background: #333; }
        .sb-btn:disabled { background: #aaa; cursor: not-allowed; }

        /* ── SECONDARY BUTTON ── */
        .sb-btn-secondary {
          align-self: center;
          height: 42px;
          padding: 0 24px;
          background: transparent; color: #888;
          border: 1px solid #e0e0e0; border-radius: 100px;
          font-size: 13.5px; font-weight: 400;
          font-family: inherit; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          margin-top: 12px;
        }
        .sb-btn-secondary:hover:not(:disabled) { color: #333; border-color: #aaa; }
        .sb-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── BOTTOM LINK ── */
        .sb-bottom-text {
          text-align: center; font-size: 13.5px; color: #aaa;
          margin-top: 24px;
        }
        .sb-bottom-link {
          font-weight: 700; color: #1a1a1a; text-decoration: none;
        }
        .sb-bottom-link:hover { opacity: 0.55; }

        /* ── VERIFICATION SCREEN ── */
        .sb-verify-title {
          font-size: 15px; font-weight: 400; color: #555;
          text-align: center; margin-bottom: 28px; line-height: 1.6;
        }
        .sb-verify-email {
          font-weight: 600; color: #1a1a1a;
        }

        /* ── ILLUSTRATION ── */
        .sb-illustration {
          flex: 1; display: flex;
          align-items: center; justify-content: flex-end;
          padding: 0; overflow: hidden; min-height: 0;
        }
        .sb-board-img {
          width: auto;
          height: min(660px, 78vh);
          max-height: 78vh;
          object-fit: contain;
          object-position: right center;
          display: block;
          user-select: none; -webkit-user-drag: none;
          flex-shrink: 0; margin-right: 0;
        }

        /* ── RESPONSIVE ── */
        @media (min-width: 1600px) {
          .sb-left  { width: 660px; padding-left: 120px; }
          .sb-card  { width: 510px; padding: 68px 64px 56px; }
          .sb-wordmark { font-size: 52px; }
          .sb-board-img { height: min(720px, 80vh); max-height: 80vh; }
        }

        @media (max-width: 1599px) and (min-width: 1301px) {
          .sb-board-img { height: min(660px, 78vh); }
        }

        /* 1025–1300px: only image adjusts, card stays static */
        @media (max-width: 1300px) and (min-width: 1025px) {
          .sb-board-img { height: min(540px, 68vh); }
        }

        /* ── Below 1130px: single column, mobile layout ── */
        @media (max-width: 1130px) {
          .sb-frame {
            padding: 0;
            min-height: 100dvh;
            height: auto;
            overflow-x: hidden;
            overflow-y: auto;
            padding-bottom: max(24px, env(safe-area-inset-bottom));
          }
          .sb-frame-inner {
            min-height: 100dvh;
            border-radius: 0;
            overflow: visible;
            border: none;
            box-shadow: none;
          }
          .sb-page        { overflow: visible; }

          .sb-nav { padding: 20px 24px 0; justify-content: center; }
          .sb-nav-links { display: none; }

          .sb-body {
            flex-direction: column; align-items: center;
            justify-content: flex-start;
            overflow: visible; padding-bottom: max(48px, env(safe-area-inset-bottom));
          }

          .sb-left {
            width: 100%; align-items: center;
            padding: 36px 24px 0;
            overflow: visible;
          }

          .sb-wordmark {
            font-size: 28px; letter-spacing: 0.20em;
            margin-bottom: 24px; text-align: center; white-space: normal;
          }

          .sb-card {
            width: 100%; max-width: 440px;
            padding: 44px 32px 36px;
            box-shadow: none; border: none;
          }

          .sb-illustration { display: none; }
        }

        @media (max-width: 480px) {
          .sb-frame { padding: 0; }
          .sb-nav   { padding: 16px 18px 0; }
          .sb-left  { padding: 28px 16px 0; }
          .sb-wordmark { font-size: 20px; letter-spacing: 0.15em; margin-bottom: 20px; }
          .sb-card  { padding: 32px 18px 28px; }
          .sb-field { margin-bottom: 24px; }
          .sb-date-group { margin-bottom: 24px; }
          .sb-input { font-size: 16px; min-height: 44px; }
          .sb-input::placeholder { font-size: 15px; }
          .sb-select { font-size: 16px; min-height: 44px; }
          .sb-btn   { min-width: 160px; height: 44px; font-size: 14px; }
        }

        @media (max-width: 360px) {
          .sb-wordmark { font-size: 17px; letter-spacing: 0.12em; }
          .sb-card { padding: 24px 14px 22px; }
          .sb-date-group { gap: 8px; }
          .sb-input,
          .sb-select,
          .sb-btn,
          .sb-btn-secondary {
            min-height: 44px;
          }
        }

        @media (max-height: 700px) {
          .sb-frame {
            align-items: flex-start;
            padding-top: 12px;
            padding-bottom: max(24px, env(safe-area-inset-bottom));
          }

          .sb-frame-inner {
            min-height: auto;
          }

          .sb-body {
            align-items: flex-start;
            justify-content: flex-start;
            overflow: visible;
            padding-bottom: max(36px, env(safe-area-inset-bottom));
          }

          .sb-left {
            padding-top: 24px;
            padding-bottom: 36px;
          }

          .sb-wordmark {
            font-size: 32px;
            margin-bottom: 18px;
          }

          .sb-card {
            padding-top: 34px;
            padding-bottom: 32px;
          }

          .sb-field,
          .sb-date-group,
          .sb-role-toggle {
            margin-bottom: 22px;
          }

          .sb-strength-bars {
            margin-top: -12px;
          }

          .sb-strength-label {
            margin-bottom: 16px;
          }

          .sb-illustration {
            display: none;
          }
        }

        @media (max-height: 700px) and (max-width: 480px) {
          .sb-frame {
            padding-top: 0;
          }

          .sb-body {
            align-items: center;
          }

          .sb-left {
            padding: 22px 16px max(36px, env(safe-area-inset-bottom));
          }

          .sb-wordmark {
            font-size: 20px;
            letter-spacing: 0.15em;
            margin-bottom: 16px;
          }

          .sb-card {
            padding: 28px 16px 26px;
          }

          .sb-field,
          .sb-date-group,
          .sb-role-toggle {
            margin-bottom: 20px;
          }
        }

        @media (max-height: 700px) and (max-width: 360px) {
          .sb-wordmark {
            font-size: 17px;
            letter-spacing: 0.12em;
          }

          .sb-card {
            padding: 22px 12px 24px;
          }
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

            <div className="sb-body">

              {/* LEFT */}
              <div className="sb-left">
                <div className="sb-wordmark">SCHOOLBRIDGE</div>

                <div className="sb-card">
                  {error   && <div className="sb-msg error">{error}</div>}
                  {message && <div className="sb-msg success">{message}</div>}

                  {!showCodeInput ? (
                    <form onSubmit={handleRegister} className="sb-form">

                      {/* Emri */}
                      <div className="sb-field">
                        <input
                          className="sb-input"
                          type="text"
                          placeholder="Emri dhe mbiemri"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          autoComplete="name"
                          required
                        />
                      </div>



                      {/* Roli — vetëm Mësimdhënës */}
                      <div className="sb-role-toggle">
                        <button type="button" className="sb-role-btn active" disabled>
                          Mësimdhënës
                        </button>
                      </div>

                      {/* Data e lindjes */}
                      <div className="sb-date-group">
                        <div className="sb-date-col">
                          <div className="sb-date-label">Dita</div>
                          <select
                            className="sb-select"
                            value={birthDay}
                            onChange={(e) => setBirthDay(e.target.value)}
                            required
                          >
                            <option value="" disabled>DD</option>
                            {days.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="sb-date-col">
                          <div className="sb-date-label">Muaji</div>
                          <select
                            className="sb-select"
                            value={birthMonth}
                            onChange={(e) => { setBirthMonth(e.target.value); setBirthDay(""); }}
                            required
                          >
                            <option value="" disabled>Muaji</option>
                            {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                        </div>
                        <div className="sb-date-col">
                          <div className="sb-date-label">Viti</div>
                          <select
                            className="sb-select"
                            value={birthYear}
                            onChange={(e) => { setBirthYear(e.target.value); setBirthDay(""); }}
                            required
                          >
                            <option value="" disabled>VVVV</option>
                            {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="sb-field">
                        <input
                          className="sb-input"
                          type="email"
                          placeholder="Adresa e emailit"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                        />
                      </div>

                      {/* Fjalëkalimi */}
                      <div className="sb-field">
                        <input
                          className="sb-input"
                          type={showPassword ? "text" : "password"}
                          placeholder="Fjalëkalimi (min. 8 karaktere)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button" className="sb-eye"
                          onClick={() => setShowPassword((p) => !p)}
                          aria-label="Shfaq ose fshih fjalëkalimin"
                        >
                          {showPassword ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Password strength */}
                      {password.length > 0 && (
                        <>
                          <div className="sb-strength-bars">
                            {[1,2,3].map((i) => (
                              <div
                                key={i}
                                className="sb-strength-bar"
                                style={{ background: i <= passwordStrength ? strengthColors[passwordStrength] : "#e8e8e8" }}
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

                      {/* Konfirmo fjalëkalimin */}
                      <div className="sb-field">
                        <input
                          className="sb-input"
                          type={showConfirmPw ? "text" : "password"}
                          placeholder="Konfirmo fjalëkalimin"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button" className="sb-eye"
                          onClick={() => setShowConfirmPw((p) => !p)}
                          aria-label="Shfaq ose fshih konfirmimin"
                        >
                          {showConfirmPw ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>

                      <button type="submit" className="sb-btn" disabled={loading}>
                        {loading ? "Duke krijuar llogarinë..." : "Krijo llogarinë"}
                      </button>

                      <p className="sb-bottom-text" style={{ marginTop: 20 }}>
                        Ke llogari?{" "}
                        <Link to="/login" className="sb-bottom-link">Kyçu</Link>
                      </p>

                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode} className="sb-form">

                      <p className="sb-verify-title">
                        Kodi u dërgua në<br />
                        <span className="sb-verify-email">{email}</span>
                      </p>

                      <div className="sb-field">
                        <input
                          className="sb-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="Kodi 6-shifror"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength={6}
                          autoComplete="one-time-code"
                          required
                        />
                      </div>

                      <button
                        type="submit" className="sb-btn"
                        disabled={loading || code.length !== 6}
                      >
                        {loading ? "Duke verifikuar..." : "Verifiko llogarinë"}
                      </button>

                      <button
                        type="button" className="sb-btn-secondary"
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0 || loading}
                      >
                        {resendCooldown > 0
                          ? `Ri-dërgo kodin (${resendCooldown}s)`
                          : "Ri-dërgo kodin"}
                      </button>

                      <button
                        type="button" className="sb-btn-secondary"
                        onClick={() => { setShowCodeInput(false); setCode(""); setMessage(""); setError(""); }}
                      >
                        Ndrysho adresën e emailit
                      </button>

                    </form>
                  )}
                </div>
              </div>

              {/* RIGHT — whiteboard image */}
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

export default Register;
