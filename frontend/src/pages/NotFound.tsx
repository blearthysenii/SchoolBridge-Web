import { useNavigate } from "react-router-dom";
import logoUrl from "../images/logo.png";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf-root">
      <img src={logoUrl} alt="SchoolBridge" className="nf-logo" />
      <div className="nf-code">404</div>
      <h1 className="nf-title">Kjo faqe nuk ekziston</h1>
      <p className="nf-text">Faqja që po kërkoni nuk u gjet. Mund të ketë lëvizur ose adresa është e pasaktë.</p>
      <button className="nf-btn" onClick={() => navigate("/dashboard")}>
        Kthehu në panel
      </button>

      <style>{`
        .nf-root {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          background: #FFFFFF; padding: 24px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .nf-logo { height: 34px; width: auto; object-fit: contain; margin-bottom: 28px; }
        .nf-code {
          font-size: 64px; font-weight: 800; color: #2563EB;
          letter-spacing: -0.03em; line-height: 1;
        }
        .nf-title { font-size: 20px; font-weight: 700; color: #0F172A; margin: 12px 0 8px; }
        .nf-text { font-size: 13.5px; color: #64748B; max-width: 360px; line-height: 1.6; margin: 0 0 26px; }
        .nf-btn {
          background: #2563EB; color: #fff; border: none; border-radius: 8px;
          padding: 10px 20px; font-size: 13.5px; font-weight: 600;
          cursor: pointer; transition: background 0.12s;
        }
        .nf-btn:hover { background: #1D4ED8; }

        @media (max-width: 480px) {
          .nf-code { font-size: 52px; }
          .nf-title { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
