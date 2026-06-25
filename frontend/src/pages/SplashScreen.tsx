import Spline from "@splinetool/react-spline";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        :root {
          --splash-bg: #1b1b1b;
        }

        .splash-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          background: var(--splash-bg);
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
          left: 0;
          right: 0;
          bottom: 0;
          height: 92px;
          background: var(--splash-bg);
          z-index: 99999;
          pointer-events: none;
        }

        .spline-watermark-cover::after {
          content: "";
          position: absolute;
          right: 0;
          bottom: 92px;
          width: 270px;
          height: 170px;
          background: var(--splash-bg);
        }

        .splash-soft-shadow {
          position: absolute;
          left: 50%;
          bottom: 52px;
          transform: translateX(-50%);
          width: min(92%, 520px);
          height: 210px;
          border-radius: 34px;
          background: rgba(0, 0, 0, 0.22);
          filter: blur(42px);
          z-index: 3;
          pointer-events: none;
        }

        .splash-glass {
          position: absolute;
          left: 50%;
          bottom: 96px;
          transform: translateX(-50%);
          width: min(92%, 480px);
          padding: 30px 24px 24px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.24);
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

        .splash-title {
          margin: 0;
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -0.045em;
          line-height: 1.05;
          color: #050505;
        }

        .splash-title span {
          color: #050505;
        }

        .splash-text {
          margin: 14px auto 24px;
          max-width: 360px;
          color: #475569;
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
          padding: 13px 24px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          outline: none;
        }

        .splash-btn-primary {
          border: 1px solid #050505;
          color: #ffffff;
          background: #050505;
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.24);
        }

        .splash-btn-primary:hover {
          transform: translateY(-2px);
          background: #111111;
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.3);
        }

        .splash-btn-secondary {
          color: #050505;
          background: #f7f7f5;
          border: 1px solid rgba(5, 5, 5, 0.08);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
        }

        .splash-btn-secondary:hover {
          transform: translateY(-2px);
          background: #ffffff;
        }

        @media (min-width: 1600px) {
          .spline-watermark-cover {
            height: 100px;
          }

          .spline-watermark-cover::after {
            bottom: 100px;
            width: 320px;
            height: 190px;
          }

          .splash-glass {
            bottom: 106px;
          }
        }

        @media (max-width: 1400px) and (min-width: 769px) {
          .spline-watermark-cover {
            height: 86px;
          }

          .spline-watermark-cover::after {
            bottom: 86px;
            width: 230px;
            height: 145px;
          }

          .splash-glass {
            bottom: 92px;
          }
        }

        @media (max-width: 900px) {
          .spline-scene {
            transform: scale(1.22) translateY(-52px);
          }
        }

        @media (max-width: 768px) {
          .spline-watermark-cover {
            display: none;
          }

          .spline-scene {
            transform: scale(1.28) translateY(-42px);
          }

          .splash-glass {
            bottom: max(22px, env(safe-area-inset-bottom));
            width: calc(100% - 28px);
            padding: 25px 16px 18px;
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
        }

        @media (max-width: 420px) {
          .spline-scene {
            transform: scale(1.42) translateY(-58px);
          }

          .splash-title {
            font-size: 28px;
          }
        }
      `}</style>

      <main className="splash-root">
        <div className="spline-scene">
          <Spline scene="https://prod.spline.design/0R8IV1ejIFlNrd1l/scene.splinecode" />
        </div>

        <div className="splash-soft-shadow" />
        <div className="spline-watermark-cover" />

        <section className="splash-glass">
          <h1 className="splash-title">
            School<span>Bridge</span>
          </h1>

          <p className="splash-text">
            Ndihmon mesimdhenesit te identifikojne boshlleqet ne mesim dhe t’i mbeshtesin nxenesit me qarte.
          </p>

          <div className="splash-actions">
            <button
              type="button"
              className="splash-btn splash-btn-primary"
              onClick={() => navigate("/login")}
            >
              Fillo tani
            </button>

            <button
              type="button"
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
