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
          background: #FFFFFF;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .sb-pageloader-logo { height: 36px; width: auto; object-fit: contain; margin-bottom: 4px; }
        .sb-pageloader-name { font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.2px; }
        .sb-pageloader-spinner {
          width: 28px; height: 28px; margin-top: 10px;
          border: 3px solid rgba(37, 99, 235, 0.12);
          border-top-color: #2563EB;
          border-radius: 50%;
          animation: sb-spin 0.75s linear infinite;
        }
        .sb-pageloader-text { font-size: 12.5px; color: #94A3B8; font-weight: 500; }
      `}</style>
    </div>
  );
}
