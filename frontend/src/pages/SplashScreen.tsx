import Spline from "@splinetool/react-spline";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .splash-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.10), transparent 34%),
            linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          font-family: 'Inter', sans-serif;
        }

        .spline-scene {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: scale(1.05) translateY(-28px);
          z-index: 1;
        }

        .spline-scene canvas {
          width: 100% !important;
          height: 100% !important;
        }

        .splash-glass {
          position: absolute;
          left: 50%;
          bottom: 42px;
          transform: translateX(-50%);
          width: min(92%, 460px);
          padding: 22px 22px 20px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.76);
          border: 1px solid rgba(226, 232, 240, 0.95);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          z-index: 5;
          text-align: center;
          animation: card-up 0.7s ease both;
        }

        @keyframes card-up {
          from { opacity: 0; transform: translate(-50%, 18px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .splash-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .splash-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #2563eb;
          box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.12);
        }

        .splash-title {
          margin: 0;
          font-size: 38px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0f172a;
        }

        .splash-title span {
          color: #2563eb;
        }

        .splash-text {
          margin: 10px auto 22px;
          max-width: 340px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .splash-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .splash-btn {
          border: 0;
          border-radius: 16px;
          padding: 13px 22px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .splash-btn-primary {
          color: white;
          background: #2563eb;
          box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28);
        }

        .splash-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 38px rgba(37, 99, 235, 0.34);
        }

        .splash-btn-secondary {
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .splash-btn-secondary:hover {
          transform: translateY(-2px);
          background: #f8fafc;
        }

        @media (max-width: 768px) {
          .spline-scene {
            transform: scale(1.35) translateY(-70px);
          }

          .splash-glass {
            bottom: 24px;
            width: calc(100% - 28px);
            padding: 20px 16px 18px;
            border-radius: 24px;
          }

          .splash-title {
            font-size: 31px;
          }

          .splash-text {
            font-size: 13px;
            margin-bottom: 18px;
          }

          .splash-actions {
            flex-direction: column;
          }

          .splash-btn {
            width: 100%;
            padding: 14px 18px;
          }
        }

        @media (max-width: 420px) {
          .spline-scene {
            transform: scale(1.55) translateY(-86px);
          }

          .splash-title {
            font-size: 28px;
          }

          .splash-badge {
            font-size: 11px;
          }
        }
      `}</style>

      <main className="splash-root">
        <div className="spline-scene">
          <Spline scene="https://prod.spline.design/0R8IV1ejIFlNrd1l/scene.splinecode" />
        </div>

        <section className="splash-glass">
          <div className="splash-badge">
            <span className="splash-dot" />
            Platformë mësimi adaptive
          </div>

          <h1 className="splash-title">
            School<span>Bridge</span>
          </h1>

          <p className="splash-text">
            Ndihmon mësuesit të identifikojnë boshllëqet në mësim dhe të mbështesin nxënësit më qartë.
          </p>

          <div className="splash-actions">
            <button
              className="splash-btn splash-btn-primary"
              onClick={() => navigate("/login")}
            >
              Fillo tani
            </button>

            <button
              className="splash-btn splash-btn-secondary"
              onClick={() => navigate("/register")}
            >
              Krijo llogari
            </button>
          </div>
        </section>
      </main>
    </>
  );
}