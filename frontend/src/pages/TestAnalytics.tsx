import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { getTestAnalytics } from "../services/analyticsService";

type StudentRanking = {
  rank: number;
  student_id: number;
  student_name: string;
  correct: number;
  total: number;
  score: number;
};

type QuestionStat = {
  question_id: number;
  question_number: number;
  question_text: string;
  concept_id: number;
  concept_name: string;
  correct: number;
  total: number;
  success_rate: number;
};

type ConceptStat = {
  concept_id: number;
  concept_name: string;
  correct: number;
  total: number;
  success_rate: number;
  is_gap: boolean;
};

type TestAnalyticsData = {
  test_id: number;
  test_title: string;
  subject_name: string;
  classroom_name: string;
  total_students: number;
  students_completed: number;
  average_score: number;
  student_ranking: StudentRanking[];
  question_stats: QuestionStat[];
  concept_stats: ConceptStat[];
  weakest_concepts: ConceptStat[];
  strongest_concepts: ConceptStat[];
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function rateColor(r: number) {
  return r >= 80 ? "#22c55e" : r >= 60 ? "#f59e0b" : "#ef4444";
}
function rateBg(r: number) {
  return r >= 80 ? "#f0fdf4" : r >= 60 ? "#fffbeb" : "#fff5f5";
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconWarn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── Rate bar ──────────────────────────────────────────────────────────────────
function RateBar({ rate }: { rate: number }) {
  const color = rateColor(rate);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${rate}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>{rate}%</span>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, extra }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const item = payload[0].payload;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
      padding: "10px 14px", fontSize: 12.5, boxShadow: "0 4px 16px rgba(15,23,42,0.1)",
      maxWidth: 240,
    }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{item.full_name ?? label}</div>
      {item.question_text && <div style={{ color: "#64748b", marginBottom: 6 }}>{item.question_text}</div>}
      {item.concept_name && extra && <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>Koncepti: {item.concept_name}</div>}
      <div style={{ color: rateColor(val), fontWeight: 700 }}>{val}% sukses</div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
      padding: "16px 20px",
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent ?? "#0f172a", lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
function TestAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<TestAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"ranking" | "questions" | "concepts" | "insights">("ranking");

  useEffect(() => {
    if (!id || isNaN(Number(id))) return;
    setLoading(true);
    getTestAnalytics(Number(id))
      .then((res) => setAnalytics(res.data))
      .catch(() => setError("Dështoi ngarkimi i analitikës."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <style>{baseStyles}</style>
      <header className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}><IconBack /> Kthehu</button>
        <div className="topbar-title">Analitika e testit</div>
      </header>
      <div className="page" style={{ display: "flex", alignItems: "center", gap: 10, color: "#94a3b8", fontSize: 14 }}>
        <span style={{ animation: "spin 0.8s linear infinite", display: "inline-flex" }}><IconSpinner /></span>
        Duke ngarkuar analitikën…
      </div>
    </>
  );

  if (error || !analytics) return (
    <>
      <style>{baseStyles}</style>
      <header className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}><IconBack /> Kthehu</button>
      </header>
      <div className="page">
        <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "18px 20px", color: "#dc2626", fontSize: 13.5 }}>
          {error || "Nuk ka të dhëna të disponueshme."}
        </div>
      </div>
    </>
  );

  const questionChartData = analytics.question_stats.map((q) => ({
    label: `P${q.question_number}`,
    success_rate: q.success_rate,
    question_text: q.question_text,
    concept_name: q.concept_name,
    full_name: `P${q.question_number}`,
  }));

  const conceptChartData = analytics.concept_stats.map((c) => ({
    label: c.concept_name.length > 12 ? c.concept_name.slice(0, 12) + "…" : c.concept_name,
    success_rate: c.success_rate,
    full_name: c.concept_name,
  }));

  const tabs = [
    { key: "ranking" as const, label: "Renditja", count: analytics.student_ranking.length },
    { key: "questions" as const, label: "Pyetjet", count: analytics.question_stats.length },
    { key: "concepts" as const, label: "Konceptet", count: analytics.concept_stats.length },
    { key: "insights" as const, label: "Konkluzione", count: analytics.weakest_concepts.length + analytics.strongest_concepts.length },
  ];

  return (
    <>
      <style>{baseStyles}</style>

      {/* TOP BAR */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <IconBack /> Kthehu
          </button>
          <div className="breadcrumb">
            <span className="breadcrumb-seg">Testet</span>
            <span className="breadcrumb-sep"><IconChevron /></span>
            <span className="breadcrumb-current">{analytics.test_title}</span>
          </div>
        </div>
      </header>

      <div className="page">
        {/* TEST HEADER */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 21, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>{analytics.test_title}</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>
            {analytics.subject_name} · {analytics.classroom_name}
          </div>
        </div>

        {/* STATS ROW */}
        <div className="stats-row">
          <StatCard label="Nota mesatare" value={`${analytics.average_score}%`} accent={rateColor(analytics.average_score)} />
          <StatCard label="Kanë bërë testin" value={analytics.students_completed} />
          <StatCard label="Gjithsej nxënës" value={analytics.total_students} />
          <StatCard
            label="Mbulimi"
            value={analytics.total_students > 0
              ? `${Math.round((analytics.students_completed / analytics.total_students) * 100)}%`
              : "—"}
          />
        </div>

        {/* TABS */}
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className="tab-badge">{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── RANKING TAB ── */}
        {activeTab === "ranking" && (
          <>
            <div className="section-hdr">
              <div className="section-hdr-title">Renditja e nxënësve</div>
              <div className="section-hdr-sub">{analytics.student_ranking.length} nxënës kanë dhënë testin</div>
            </div>

            {analytics.student_ranking.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>#</th>
                    <th>Emri</th>
                    <th className="hide-mobile">Korrekte</th>
                    <th>Nota</th>
                    <th>Shkalla</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.student_ranking.map((s) => (
                    <tr key={s.student_id}>
                      <td>
                        <div style={{
                          width: 26, height: 26, borderRadius: 6,
                          background: s.rank <= 3 ? "#eff6ff" : "#f1f5f9",
                          color: s.rank <= 3 ? "#2563eb" : "#64748b",
                          fontWeight: 700, fontSize: 12,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{s.rank}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{s.student_name}</td>
                      <td className="hide-mobile" style={{ color: "#64748b", fontSize: 13 }}>
                        {s.correct} / {s.total}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: 14,
                          color: rateColor(s.score),
                          background: rateBg(s.score),
                          padding: "2px 8px", borderRadius: 5,
                        }}>{s.score}%</span>
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <RateBar rate={s.score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <strong>Asnjë rezultat ende</strong>
                Asnjë nxënës nuk ka dorëzuar rezultate për këtë test.
              </div>
            )}
          </>
        )}

        {/* ── QUESTIONS TAB ── */}
        {activeTab === "questions" && (
          <>
            <div className="section-hdr">
              <div className="section-hdr-title">Suksesi sipas pyetjeve</div>
              <div className="section-hdr-sub">E renditura nga më e vështira te më e lehtë</div>
            </div>

            {questionChartData.length > 0 ? (
              <>
                <div className="chart-card">
                  <div className="chart-legend">
                    <span className="legend-dot" style={{ background: "#22c55e" }} />Mirë ≥80%
                    <span className="legend-dot" style={{ background: "#f59e0b", marginLeft: 12 }} />Mesatar ≥60%
                    <span className="legend-dot" style={{ background: "#ef4444", marginLeft: 12 }} />Dobët &lt;60%
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={questionChartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip extra />} />
                      <Bar dataKey="success_rate" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {questionChartData.map((entry, i) => (
                          <Cell key={i} fill={rateColor(entry.success_rate)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <table className="data-table" style={{ marginTop: 16 }}>
                  <thead>
                    <tr>
                      <th>Nr.</th>
                      <th>Pyetja</th>
                      <th className="hide-mobile">Koncepti</th>
                      <th>Suksesi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.question_stats.map((q) => (
                      <tr key={q.question_id}>
                        <td style={{ fontWeight: 700, color: "#64748b" }}>P{q.question_number}</td>
                        <td style={{ color: "#0f172a", fontSize: 13 }}>{q.question_text}</td>
                        <td className="hide-mobile" style={{ color: "#64748b", fontSize: 12.5 }}>{q.concept_name}</td>
                        <td style={{ minWidth: 130 }}>
                          <RateBar rate={q.success_rate} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="empty-state">
                <strong>Nuk ka të dhëna pyetjesh</strong>
                Dorëzoni rezultate për të parë statistikat sipas pyetjeve.
              </div>
            )}
          </>
        )}

        {/* ── CONCEPTS TAB ── */}
        {activeTab === "concepts" && (
          <>
            <div className="section-hdr">
              <div className="section-hdr-title">Performanca sipas koncepteve</div>
              <div className="section-hdr-sub">{analytics.concept_stats.length} koncepte të testuara</div>
            </div>

            {conceptChartData.length > 0 ? (
              <>
                <div className="chart-card">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={conceptChartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="success_rate" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {conceptChartData.map((entry, i) => (
                          <Cell key={i} fill={rateColor(entry.success_rate)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="concept-grid" style={{ marginTop: 16 }}>
                  {analytics.concept_stats.map((c) => (
                    <div key={c.concept_id} className={`concept-card${c.is_gap ? " is-gap" : ""}`}>
                      <div className="concept-card-name">{c.concept_name}</div>
                      <div style={{ marginTop: 8 }}><RateBar rate={c.success_rate} /></div>
                      <div className="concept-card-counts">
                        <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ {c.correct}</span>
                        <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>✗ {c.incorrect ?? c.total - c.correct}</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{c.total} gjithsej</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <strong>Nuk ka të dhëna konceptesh</strong>
                Dorëzoni rezultate për të parë performancën sipas koncepteve.
              </div>
            )}
          </>
        )}

        {/* ── INSIGHTS TAB ── */}
        {activeTab === "insights" && (
          <>
            {/* WEAKEST */}
            <div className="section-hdr" style={{ marginTop: 0 }}>
              <div className="section-hdr-title">Konceptet më të dobëta</div>
              <div className="section-hdr-sub">Ku klasa ka nevojë për mbështetje</div>
            </div>

            {analytics.weakest_concepts.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {analytics.weakest_concepts.map((c) => (
                  <div key={c.concept_id} className="gap-card">
                    <div className="gap-icon"><IconWarn /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{c.concept_name}</div>
                      <div style={{ marginTop: 6 }}><RateBar rate={c.success_rate} /></div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>
                        {c.correct} korrekte · {c.total - c.correct} gabim · {c.total} gjithsej
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-gaps" style={{ marginBottom: 24 }}>Nuk ka koncepte shumë të dobëta.</div>
            )}

            {/* STRONGEST */}
            <div className="section-hdr">
              <div className="section-hdr-title">Konceptet më të forta</div>
              <div className="section-hdr-sub">Ku klasa performon mirë</div>
            </div>

            {analytics.strongest_concepts.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analytics.strongest_concepts.map((c) => (
                  <div key={c.concept_id} style={{
                    background: "#fff", border: "1px solid #bbf7d0",
                    borderLeft: "4px solid #22c55e",
                    borderRadius: 10, padding: "14px 18px",
                    display: "flex", alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 7,
                      background: "#dcfce7", color: "#16a34a",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}><IconCheck /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{c.concept_name}</div>
                      <div style={{ marginTop: 6 }}><RateBar rate={c.success_rate} /></div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>
                        {c.correct} korrekte · {c.total - c.correct} gabim · {c.total} gjithsej
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <strong>Nuk ka të dhëna</strong>
                Dorëzoni rezultate për të parë konceptet më të forta.
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

const baseStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; background: #f8fafc; color: #0f172a; }

  @keyframes spin { to { transform: rotate(360deg); } }

  .topbar {
    background: #fff; border-bottom: 1px solid #e2e8f0;
    padding: 0 28px; height: 56px;
    display: flex; align-items: center; gap: 12px;
    position: sticky; top: 0; z-index: 50;
  }
  .topbar-left { display: flex; align-items: center; gap: 10px; }
  .topbar-title { font-size: 14.5px; font-weight: 600; color: #0f172a; }
  .back-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: 1px solid #e2e8f0; border-radius: 7px;
    padding: 6px 12px; font-size: 13px; font-weight: 500; color: #475569;
    cursor: pointer; transition: background 0.12s;
  }
  .back-btn:hover { background: #f1f5f9; }
  .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13.5px; }
  .breadcrumb-seg { color: #64748b; font-weight: 500; }
  .breadcrumb-sep { color: #cbd5e1; display: flex; align-items: center; }
  .breadcrumb-current { color: #0f172a; font-weight: 600; }

  .page { max-width: 900px; margin: 0 auto; padding: 28px; }

  .stats-row {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 28px;
  }

  .tabs {
    display: flex; border-bottom: 1px solid #e2e8f0;
    margin-bottom: 24px; overflow-x: auto; gap: 0;
  }
  .tab {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 18px; font-size: 13.5px; font-weight: 500; color: #64748b;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    cursor: pointer; white-space: nowrap; transition: color 0.12s;
    background: none; border-top: none; border-left: none; border-right: none;
  }
  .tab:hover { color: #0f172a; }
  .tab.active { color: #2563eb; border-bottom-color: #2563eb; }
  .tab-badge {
    background: #f1f5f9; color: #64748b;
    font-size: 11px; font-weight: 600;
    padding: 1px 6px; border-radius: 10px; min-width: 20px; text-align: center;
  }
  .tab.active .tab-badge { background: #eff6ff; color: #2563eb; }

  .section-hdr { display: flex; flex-direction: column; margin-bottom: 14px; }
  .section-hdr-title { font-size: 14px; font-weight: 700; color: #0f172a; }
  .section-hdr-sub { font-size: 12.5px; color: #94a3b8; margin-top: 2px; }

  .chart-card {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 10px; padding: 20px 16px 12px;
    margin-bottom: 0;
  }
  .chart-legend {
    display: flex; align-items: center; gap: 4px;
    font-size: 11.5px; color: #64748b; margin-bottom: 14px;
  }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

  .data-table {
    width: 100%; border-collapse: collapse;
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 10px; overflow: hidden;
  }
  .data-table th {
    text-align: left; font-size: 11.5px; font-weight: 600;
    color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;
    padding: 10px 16px; background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .data-table td {
    padding: 11px 16px; font-size: 13.5px; color: #334155;
    border-bottom: 1px solid #f1f5f9; vertical-align: middle;
  }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: #fafbff; }

  .concept-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }
  .concept-card {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 10px; padding: 14px 16px;
  }
  .concept-card.is-gap { border-color: #fecaca; background: #fff5f5; }
  .concept-card-name { font-size: 13.5px; font-weight: 700; color: #0f172a; }
  .concept-card-counts { display: flex; gap: 12px; margin-top: 8px; }

  .gap-card {
    background: #fff; border: 1px solid #fecaca;
    border-left: 4px solid #ef4444;
    border-radius: 10px; padding: 14px 18px;
    display: flex; align-items: flex-start; gap: 12px;
  }
  .gap-icon {
    width: 32px; height: 32px; border-radius: 7px;
    background: #fee2e2; color: #ef4444;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  .empty-state {
    background: #f8fafc; border: 1px dashed #e2e8f0;
    border-radius: 10px; padding: 36px 24px;
    text-align: center; color: #94a3b8; font-size: 13.5px;
  }
  .empty-state strong { display: block; font-size: 14px; color: #64748b; margin-bottom: 4px; }
  .empty-gaps {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; padding: 18px;
    text-align: center; color: #16a34a; font-size: 13.5px; font-weight: 500;
  }

  @media (max-width: 640px) {
    .page { padding: 16px; }
    .topbar { padding: 0 16px; }
    .breadcrumb { display: none; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .concept-grid { grid-template-columns: 1fr; }
    .hide-mobile { display: none; }
    .tab { padding: 10px 12px; font-size: 12.5px; }
  }
`;

export default TestAnalytics;