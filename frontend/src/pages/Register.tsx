import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("teacher");

  // Data e lindjes si 3 dropdown të veçanta
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const meta = document.querySelector("meta[name='viewport']");
    if (meta) {
      meta.setAttribute("content", "width=device-width, initial-scale=1");
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Gjenero vitet bazuar në role
  const currentYear = new Date().getFullYear();
  const minAge = role === "teacher" ? 18 : 5;
  const maxYear = currentYear - minAge;
  const minYear = maxYear - 80;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const months = [
    { value: "01", label: "Janar" },
    { value: "02", label: "Shkurt" },
    { value: "03", label: "Mars" },
    { value: "04", label: "Prill" },
    { value: "05", label: "Maj" },
    { value: "06", label: "Qershor" },
    { value: "07", label: "Korrik" },
    { value: "08", label: "Gusht" },
    { value: "09", label: "Shtator" },
    { value: "10", label: "Tetor" },
    { value: "11", label: "Nentor" },
    { value: "12", label: "Dhjetor" },
  ];

  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const daysInMonth = getDaysInMonth(birthMonth, birthYear);
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // Ndërto dateBirth string për backend
  const dateBirth =
    birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth}-${birthDay}`
      : "";

  const validateBirthDate = () => {
    if (!birthYear || !birthMonth || !birthDay) {
      setError("Ju lutem plotesoni daten e lindjes.");
      return false;
    }

    const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - minAge);

    if (birth > maxDate) {
      setError(
        role === "teacher"
          ? "Mesimdhenesi duhet te jete se paku 18 vjec."
          : "Nxenesi duhet te jete se paku 5 vjec."
      );
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validateBirthDate()) return;

    if (password.length < 8) {
      setError("Fjalekalimi duhet te kete te pakten 8 karaktere.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Fjalekalimet nuk perputhen.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/register", {
        full_name: fullName,
        role,
        date_birth: dateBirth,
        email,
        password,
      });

      setMessage("Kodi i verifikimit u dergua ne email.");
      setShowCodeInput(true);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Regjistrimi deshtoi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/users/verify-email", { email, code });
      setMessage("Llogaria u verifikua me sukses!");
      setTimeout(() => navigate("/"), 500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kodi i verifikimit nuk eshte valid.");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/users/resend-code", { email });
      setMessage("Kodi i ri u dergua ne email.");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ri-dergimi deshtoi.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  })();

  const strengthLabels = ["", "E dobet", "Mesatare", "E forte"];
  const strengthClasses = ["", "weak", "medium", "strong"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        html, body, #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .register-page {
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

        .register-card {
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

        .register-title {
          margin: 0 0 24px;
          text-align: center;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: -0.6px;
          color: #111827;
        }

        .register-form {
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

        .register-input {
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
          text-align: left;
          padding: 0;
          margin: 0;
        }

        .register-input::placeholder {
          color: #9ca3af;
        }

        .register-input:-webkit-autofill,
        .register-input:-webkit-autofill:hover,
        .register-input:-webkit-autofill:focus,
        .register-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111827 !important;
          caret-color: #111827 !important;
          transition: background-color 9999s ease-in-out 0s;
        }

        select.register-input {
          cursor: pointer;
        }

        /* Data e lindjes — 3 dropdown në një rresht */
        .date-group {
          width: 100%;
          display: grid;
          grid-template-columns: 2fr 3fr 2fr;
          gap: 10px;
        }

        .date-select-wrap {
          height: 48px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          padding: 0 12px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .date-select-wrap:focus-within {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .date-select {
          flex: 1;
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14.5px;
          font-family: inherit;
          color: #111827;
          cursor: pointer;
          padding: 0;
          margin: 0;
          appearance: none;
          -webkit-appearance: none;
        }

        .date-select.placeholder {
          color: #9ca3af;
        }

        .date-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 6px;
          padding-left: 2px;
        }

        .date-col {
          display: flex;
          flex-direction: column;
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

        .strength-bar.weak { background: #dc2626; }
        .strength-bar.medium { background: #f59e0b; }
        .strength-bar.strong { background: #16a34a; }

        .strength-text {
          width: 100%;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-align: right;
          margin-top: -6px;
        }

        .strength-text.weak { color: #dc2626; }
        .strength-text.medium { color: #f59e0b; }
        .strength-text.strong { color: #16a34a; }

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

        .secondary-button {
          width: 100%;
          height: 46px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #374151;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .secondary-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .resend-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          height: 40px;
          border: none;
          background: transparent;
          color: #2563eb;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.15s ease;
        }
        .resend-button:hover:not(:disabled) { color: #1d4ed8; }

        .resend-button:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }

        .login-text {
          margin: 24px 0 0;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        .login-link {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }
        .login-link:hover { color: #1d4ed8; }

        .success-box, .error-box {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          margin-bottom: 16px;
          text-align: center;
        }

        .success-box { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .error-box { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        @media (max-width: 480px) {
          .register-card { padding: 28px 22px 24px; }
          .register-title { font-size: 23px; margin-bottom: 20px; }
        }
      `}</style>

      <main className="register-page">
        <section className="register-card">
          <div className="brand">
            <div className="brand-mark">SB</div>
            <div className="brand-text">SchoolBridge</div>
          </div>

          <h1 className="register-title">
            {showCodeInput ? "Verifiko llogarine" : "Krijo llogarine tende"}
          </h1>

          {message && <div className="success-box">{message}</div>}
          {error && <div className="error-box">{error}</div>}

          {!showCodeInput ? (
            <form onSubmit={handleRegister} className="register-form">

              {/* Emri */}
              <div className="input-group">
                <FiUser className="input-icon" />
                <input
                  className="register-input"
                  type="text"
                  placeholder="Emri dhe mbiemri"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              {/* Roli */}
              <div className="input-group">
                {role === "teacher" ? (
                  <FaChalkboardTeacher className="input-icon" />
                ) : (
                  <FaUserGraduate className="input-icon" />
                )}
                <select
                  className="register-input"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setBirthDay("");
                    setBirthMonth("");
                    setBirthYear("");
                    setError("");
                  }}
                  required
                >
                  <option value="teacher">Mesimdhenes</option>
                  <option value="student">Nxenes</option>
                </select>
              </div>

              {/* Data e lindjes — 3 dropdown */}
              <div className="date-group">
                <div className="date-col">
                  <div className="date-label">Dita</div>
                  <div className="date-select-wrap">
                    <select
                      className={`date-select${!birthDay ? " placeholder" : ""}`}
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                      required
                    >
                      <option value="" disabled>DD</option>
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="date-col">
                  <div className="date-label">Muaji</div>
                  <div className="date-select-wrap">
                    <select
                      className={`date-select${!birthMonth ? " placeholder" : ""}`}
                      value={birthMonth}
                      onChange={(e) => {
                        setBirthMonth(e.target.value);
                        setBirthDay("");
                      }}
                      required
                    >
                      <option value="" disabled>Muaji</option>
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="date-col">
                  <div className="date-label">Viti</div>
                  <div className="date-select-wrap">
                    <select
                      className={`date-select${!birthYear ? " placeholder" : ""}`}
                      value={birthYear}
                      onChange={(e) => {
                        setBirthYear(e.target.value);
                        setBirthDay("");
                      }}
                      required
                    >
                      <option value="" disabled>VVVV</option>
                      {years.map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="input-group">
                <FiMail className="input-icon" />
                <input
                  className="register-input"
                  type="email"
                  placeholder="Email adresa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Fjalëkalimi */}
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  className="register-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Fjalekalimi min. 8 karaktere"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

              {password.length > 0 && (
                <>
                  <div className="password-strength">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={`strength-bar ${
                          item <= passwordStrength ? strengthClasses[passwordStrength] : ""
                        }`}
                      />
                    ))}
                  </div>
                  <div className={`strength-text ${strengthClasses[passwordStrength]}`}>
                    {strengthLabels[passwordStrength]}
                  </div>
                </>
              )}

              {/* Konfirmo fjalëkalimin */}
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  className="register-input"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmo fjalekalimin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
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
                {loading ? "Duke krijuar llogarine..." : "Krijo llogarine"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="register-form">
              <div className="input-group">
                <FiShield className="input-icon" />
                <input
                  className="register-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="Shkruaj kodin 6-shifror"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="main-button"
              >
                {loading ? "Duke verifikuar..." : "Verifiko llogarine"}
              </button>

              <button
                type="button"
                className="resend-button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
              >
                <FiRefreshCw />
                {resendCooldown > 0
                  ? `Ri-dergo kodin (${resendCooldown}s)`
                  : "Ri-dergo kodin"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowCodeInput(false);
                  setCode("");
                  setMessage("");
                  setError("");
                }}
              >
                Ndrysho email-in
              </button>
            </form>
          )}

          <p className="login-text">
            Ke llogari?{" "}
            <Link to="/" className="login-link">
              Kycu
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default Register;
