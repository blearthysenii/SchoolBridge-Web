import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Raleway:wght@300&display=swap');

        .splash-root {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: splash-fade-in 0.6s ease both;
        }

        @keyframes splash-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .splash-wordmark {
          font-family: 'Raleway', 'Inter', sans-serif;
          font-size: 36px;
          font-weight: 300;
          letter-spacing: 0.24em;
          color: #1a1a1a;
          text-transform: uppercase;
          user-select: none;
          margin-bottom: 28px;
        }

        .splash-label {
          font-size: 14px;
          font-weight: 400;
          color: #94a3b8;
          letter-spacing: 0.02em;
          margin-bottom: 16px;
        }

        .splash-track {
          width: 180px;
          height: 3px;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
        }

        .splash-bar {
          height: 100%;
          background: #2563eb;
          border-radius: 999px;
          animation: splash-progress 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes splash-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        @media (max-width: 480px) {
          .splash-wordmark { font-size: 24px; letter-spacing: 0.18em; }
          .splash-label    { font-size: 13px; }
          .splash-track    { width: 140px; }
        }
      `}</style>

      <div className="splash-root">
        <div className="splash-wordmark">SCHOOLBRIDGE</div>
        <p className="splash-label">Loading SchoolBridge...</p>
        <div className="splash-track">
          <div className="splash-bar" />
        </div>
      </div>
    </>
  );
}
