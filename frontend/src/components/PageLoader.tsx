import logoUrl from "../images/logo.png";

type PageLoaderProps = {
  text?: string;
};

export default function PageLoader({ text = "Duke ngarkuar…" }: PageLoaderProps) {
  return (
    <div className="sb-pageloader">
      <img src={logoUrl} alt="SchoolBridge" className="sb-pageloader-logo" />
      <span className="sb-pageloader-name">SchoolBridge</span>
      <div className="sb-pageloader-spinner" />
      <span className="sb-pageloader-text">{text}</span>

      <style>{`
        .sb-pageloader {
          position: fixed; inset: 0; z-index: 9999;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.98), transparent 30rem),
            radial-gradient(circle at top right, rgba(219,234,254,0.58), transparent 34rem),
            #F3F4F6;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .sb-pageloader-logo {
          height: 40px; width: auto; object-fit: contain; margin-bottom: 4px;
          filter: drop-shadow(0 12px 22px rgba(15,23,42,0.12));
        }
        .sb-pageloader-name { font-size: 15px; font-weight: 850; color: #0F172A; letter-spacing: 0; }
        .sb-pageloader-spinner {
          width: 28px; height: 28px; margin-top: 10px;
          border: 3px solid rgba(37, 99, 235, 0.12);
          border-top-color: #2563EB;
          border-radius: 50%;
          animation: sb-spin 0.75s linear infinite;
        }
        .sb-pageloader-text { font-size: 12.5px; color: #94A3B8; font-weight: 700; }
      `}</style>
    </div>
  );
}
