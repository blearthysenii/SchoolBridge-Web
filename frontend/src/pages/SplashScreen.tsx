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
          height: 100svh;
          overflow: hidden;
          background: #181818;
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

        .spline-watermark-cover {
          position: fixed;
          right: 0;
          bottom: 0;
          width: 220px;
          height: 70px;
          background: #181818;
          z-index: 20;
          pointer-events: none;
        }

        .splash-soft-shadow {
          position: absolute;
          left: 50%;
          bottom: 52px;
          transform: translateX(-50%);
          width: min(92%, 520px);
          height: 210px;
          border-radius: 34px;
          background: rgba(37, 99, 235, 0.13);
          filter: blur(42px);
          z-index: 3;
          pointer-events: none;
        }

        .splash-glass {
          position: absolute;
          left: 50%;
          bottom: 70px;
          transform: translateX(-50%);
          width: min(92%, 480px);
          padding: 24px 24px 22px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          z-index: 10;
          text-align: center;
          animation: card-up 0.75s ease both;
        }

        @keyframes card-up {
          from {
            opacity: 0;
            transform: translate(-50%, 22px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .splash-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 13px;
          border-radius: 999px;
          background: rgba(239, 246, 255, 0.95);
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 13px;
          border: 1px solid rgba(191, 219, 254, 0.9);
        }

        .splash-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #2563eb;
          box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.13);
        }

        .splash-title {
          margin: 0;
          font-size: 39px;
          font-weight: 800;
          letter-spacing: -0.045em;
          line-height: 1.05;
          color: #0f172a;
        }

        .splash-title span {
          color: #2563eb;
        }

        .splash-text {
          margin: 12px auto 23px;
          max-width: 355px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.65;
        }

        .splash-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .splash-btn {
          border-radius: 16px;
          padding: 13px 23px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          outline: none;
        }

        .splash-btn-primary {
          border: 1px solid #2563eb;
          color: #ffffff;
          background: #2563eb;
          box-shadow: 0 16px 34px rgba(37, 99, 235, 0.32);
        }

        .splash-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 42px rgba(37, 99, 235, 0.38);
        }

        .splash-btn-secondary {
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
        }

        .splash-btn-secondary:hover {
          transform: translateY(-2px);
          background: #f8fafc;
        }

        @media (max-width: 900px) {
          .spline-scene {
            transform: scale(1.22) translateY(-52px);
          }

          .splash-glass {
            bottom: 48px;
          }
        }

        @media (max-width: 768px) {
          .spline-scene {
            transform: scale(1.38) translateY(-78px);
          }

          .splash-glass {
            bottom: 26px;
            width: calc(100% - 28px);
            padding: 21px 16px 18px;
            border-radius: 25px;
          }

          .splash-soft-shadow {
            bottom: 12px;
            width: calc(100% - 20px);
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

          .spline-watermark-cover {
            width: 170px;
            height: 58px;
          }
        }

        @media (max-width: 420px) {
          .spline-scene {
            transform: scale(1.58) translateY(-95px);
          }

          .splash-title {
            font-size: 28px;
          }

          .splash-badge {
            font-size: 11px;
            padding: 7px 11px;
          }
        }
      `}</style>

      <main className="splash-root">
        <div className="spline-scene">
          <Spline scene="https://prod.spline.design/0R8IV1ejIFlNrd1l/scene.splinecode" />
        </div>

        <div className="spline-watermark-cover" />
        <div className="splash-soft-shadow" />

        <section className="splash-glass">
          <div className="splash-badge">
            <span className="splash-dot" />
            Adaptive learning platform
          </div>

          <h1 className="splash-title">
            School<span>Bridge</span>
          </h1>

          <p className="splash-text">
            Helping teachers identify learning gaps and support students more clearly.
          </p>

          <div className="splash-actions">
            <button
              type="button"
              className="splash-btn splash-btn-primary"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>

            <button
              type="button"
              className="splash-btn splash-btn-secondary"
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
