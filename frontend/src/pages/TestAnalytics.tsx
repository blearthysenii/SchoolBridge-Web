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

const BAR_COLOR_GOOD = "#4CAF50";
const BAR_COLOR_GAP = "#f44336";
const BAR_COLOR_NEUTRAL = "#2196F3";

function getBarColor(successRate: number): string {
  if (successRate >= 80) return BAR_COLOR_GOOD;
  if (successRate >= 60) return BAR_COLOR_NEUTRAL;
  return BAR_COLOR_GAP;
}

function TestAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<TestAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || isNaN(Number(id))) return;

    setLoading(true);
    getTestAnalytics(Number(id))
      .then((res) => setAnalytics(res.data))
      .catch(() => setError("Failed to load test analytics."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <button onClick={() => navigate(-1)}>Back</button>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ padding: "40px" }}>
        <button onClick={() => navigate(-1)}>Back</button>
        <p style={{ color: "red" }}>{error || "No data available."}</p>
      </div>
    );
  }

  // Backend returns question_stats sorted by success_rate (ascending).
  // question_number is the stable original position by question_id order.
  const questionChartData = analytics.question_stats.map((q) => ({
    label: `Q${q.question_number}`,
    success_rate: q.success_rate,
    question_text: q.question_text,
    concept_name: q.concept_name,
  }));

  const conceptChartData = analytics.concept_stats.map((c) => ({
    label: c.concept_name.length > 14 ? c.concept_name.slice(0, 14) + "…" : c.concept_name,
    success_rate: c.success_rate,
    full_name: c.concept_name,
  }));

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate(-1)}>Back</button>

      <h1>Test Analytics</h1>
      <p>
        <strong>{analytics.test_title}</strong> — {analytics.subject_name} —{" "}
        {analytics.classroom_name}
      </p>

      <hr />

      <h2>Overview</h2>

      <p>Average Score: <strong>{analytics.average_score}%</strong></p>
      <p>Students Completed: <strong>{analytics.students_completed}</strong> / {analytics.total_students}</p>

      <hr />

      <h2>Student Ranking</h2>

      {analytics.student_ranking.length > 0 ? (
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "500px" }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Student</th>
              <th style={thStyle}>Correct</th>
              <th style={thStyle}>Score</th>
            </tr>
          </thead>
          <tbody>
            {analytics.student_ranking.map((s) => (
              <tr key={s.student_id}>
                <td style={tdStyle}>{s.rank}</td>
                <td style={tdStyle}>{s.student_name}</td>
                <td style={tdStyle}>{s.correct} / {s.total}</td>
                <td style={{ ...tdStyle, fontWeight: "bold", color: getBarColor(s.score) }}>
                  {s.score}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No results submitted for this test yet.</p>
      )}

      <hr />

      <h2>Question Success Rate</h2>

      {questionChartData.length > 0 ? (
        <>
          <p style={{ fontSize: "13px", color: "#666" }}>
            Green ≥ 80% | Blue ≥ 60% | Red &lt; 60%
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={questionChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Success Rate"]}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? `${label}: ${item.question_text} (${item.concept_name})` : label;
                }}
              />
              <Bar dataKey="success_rate" name="Success Rate">
                {questionChartData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.success_rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <ul style={{ marginTop: "12px" }}>
            {analytics.question_stats.map((q) => (
              <li key={q.question_id} style={{ marginBottom: "6px" }}>
                <strong>Q{q.question_number}</strong> [{q.concept_name}]: {q.question_text}
                {" — "}
                <span style={{ color: getBarColor(q.success_rate) }}>
                  {q.success_rate}% ({q.correct}/{q.total})
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No question data yet.</p>
      )}

      <hr />

      <h2>Concept Performance</h2>

      {conceptChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={conceptChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Success Rate"]}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload;
                return item ? item.full_name : label;
              }}
            />
            <Bar dataKey="success_rate" name="Success Rate">
              {conceptChartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.success_rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No concept data yet.</p>
      )}

      <hr />

      <h2>Weakest Concepts</h2>

      {analytics.weakest_concepts.length > 0 ? (
        <ul>
          {analytics.weakest_concepts.map((c) => (
            <li key={c.concept_id} style={{ marginBottom: "8px" }}>
              ⚠️ <strong>{c.concept_name}</strong> — {c.success_rate}%
              {" "}({c.correct}/{c.total} correct)
            </li>
          ))}
        </ul>
      ) : (
        <p>No data yet.</p>
      )}

      <hr />

      <h2>Strongest Concepts</h2>

      {analytics.strongest_concepts.length > 0 ? (
        <ul>
          {analytics.strongest_concepts.map((c) => (
            <li key={c.concept_id} style={{ marginBottom: "8px" }}>
              ✅ <strong>{c.concept_name}</strong> — {c.success_rate}%
              {" "}({c.correct}/{c.total} correct)
            </li>
          ))}
        </ul>
      ) : (
        <p>No data yet.</p>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderBottom: "1px solid #eee",
};

export default TestAnalytics;
