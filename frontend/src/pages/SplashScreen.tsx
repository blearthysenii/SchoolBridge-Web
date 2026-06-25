import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');

        .splash-root {
          min-height: 100vh;
          min-height: 100svh;
          width: 100%;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
        }

        .logo-wrap {
          text-align: center;
          animation: fadeIn 0.9s ease both;
        }

        .schoolbridge-logo {
          font-size: clamp(48px, 11vw, 160px);
          font-weight: 900;
          letter-spacing: -0.085em;
          line-height: 0.9;
          color: #0f172a;
          white-space: nowrap;
          text-shadow:
            0 2px 0 #d9e2ef,
            0 8px 18px rgba(15, 23, 42, 0.18),
            0 28px 55px rgba(15, 23, 42, 0.16);
          transform: perspective(900px) rotateX(10deg);
          animation: logoFloat 4.5s ease-in-out infinite;
        }

        .schoolbridge-logo span {
          color: #111827;
        }

        .floor-shadow {
          width: min(78vw, 880px);
          height: 34px;
          margin: 30px auto 0;
          border-radius: 999px;
          background: radial-gradient(
            ellipse at center,
            rgba(15, 23, 42, 0.18) 0%,
            rgba(15, 23, 42, 0.08) 38%,
            transparent 72%
          );
          filter: blur(10px);
          animation: shadowPulse 4.5s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: perspective(900px) rotateX(10deg) translateY(0);
          }
          50% {
            transform: perspective(900px) rotateX(7deg) translateY(-8px);
          }
        }

        @keyframes shadowPulse {
          0%, 100% {
            opacity: 0.65;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.42;
            transform: scaleX(0.88);
          }
        }

        @media (max-width: 640px) {
          .schoolbridge-logo {
            font-size: clamp(38px, 13vw, 64px);
            letter-spacing: -0.07em;
          }

          .floor-shadow {
            width: 82vw;
            height: 24px;
            margin-top: 22px;
          }
        }
      `}</style>

      <main className="splash-root">
        <div className="logo-wrap">
          <div className="schoolbridge-logo">
            School<span>Bridge</span>
          </div>

          <div className="floor-shadow" />
        </div>
      </main>
    </>
  );
}