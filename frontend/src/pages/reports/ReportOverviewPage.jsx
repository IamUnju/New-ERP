import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RANGE_LABELS = {
  week: "7 Days",
  month: "30 Days",
  year: "12 Months",
};

const buildSeries = (range) => {
  if (range === "year") {
    return [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].map((label, index) => ({
      label,
      sales: 0,
      orders: 0,
      key: index,
    }));
  }

  const count = range === "month" ? 30 : 7;
  return Array.from({ length: count }, (_, idx) => ({
    label: `Day ${idx + 1}`,
    sales: 0,
    orders: 0,
    key: idx,
  }));
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 12 }}>
      <div style={{ color: "#9ca3af", marginBottom: 4 }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ fontWeight: 600 }}>
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
}

export default function ReportOverviewPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [range, setRange] = useState("month");
  const series = useMemo(() => buildSeries(range), [range]);

  if (reportId !== "sales-overview") {
    return (
      <div style={{ padding: 24 }}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0 }}>Report Overview</h1>
            <p style={{ color: "#6b7280", marginTop: 4 }}>This report is not available yet.</p>
          </div>
          <button className="btn" onClick={() => navigate("/reports")}>Back to Reports</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-overview-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        .report-overview-shell {
          --ink: #0f172a;
          --muted: #6b7280;
          --line: #e6e9ef;
          --panel: #ffffff;
          --surface: #f6f7fb;
          --accent: #22c55e;
          --accent-weak: #e8f9ee;
          --warning: #f59e0b;
          --primary: #2563eb;
          min-height: calc(100vh - 64px);
          padding: 20px 18px 28px;
          background: #f6f7fb;
          font-family: "Space Grotesk", "IBM Plex Sans", "Segoe UI", sans-serif;
          color: var(--ink);
        }

        .overview-wrap {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          gap: 16px;
        }

        .overview-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .date-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: var(--panel);
          font-size: 12px;
          color: #374151;
        }

        .overview-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .overview-btn {
          border: 1px solid var(--line);
          background: #f3f4f6;
          border-radius: 10px;
          padding: 6px 12px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .overview-card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
        }

        .overview-card .label {
          color: #111827;
          font-size: 12px;
          font-weight: 600;
        }

        .overview-card .value {
          font-size: 20px;
          font-weight: 700;
          margin-top: 6px;
        }

        .icon-badge {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #fff;
        }

        .overview-chart {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 12px 14px 8px;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
        }

        .chart-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .chart-title {
          font-weight: 700;
          font-size: 13px;
        }

        .chart-legend {
          display: flex;
          gap: 10px;
          color: var(--muted);
          font-size: 11px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          display: inline-block;
          margin-right: 6px;
        }

        .range-buttons {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .range-buttons button {
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 4px 10px;
          background: #fff;
          color: var(--muted);
          font-size: 11px;
          cursor: pointer;
        }

        .range-buttons button.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 720px) {
          .overview-topbar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="overview-wrap">
        <header className="overview-topbar">
          <div className="date-pill">01/02/2026 - 21/02/2026</div>
          <div className="overview-actions">
            <button className="overview-btn" type="button">Export</button>
            <button className="overview-btn" type="button" onClick={() => navigate("/reports")}>Back</button>
          </div>
        </header>

        <section className="overview-cards">
          <div className="overview-card">
            <div>
              <span className="label">Sales Amount</span>
              <div className="value">0.00</div>
            </div>
            <span className="icon-badge" style={{ background: "#f97316" }}>B</span>
          </div>
          <div className="overview-card">
            <div>
              <span className="label">Sales Order Count</span>
              <div className="value">0</div>
            </div>
            <span className="icon-badge" style={{ background: "#f59e0b" }}>O</span>
          </div>
        </section>

        <section className="overview-chart">
          <div className="chart-head">
            <div>
              <div className="chart-title">Sales Trends</div>
              <div className="chart-legend">
                <span><span className="legend-dot" style={{ background: "#22c55e" }} />Sales Amount</span>
                <span><span className="legend-dot" style={{ background: "#f59e0b" }} />Sales Order Count</span>
              </div>
            </div>
            <div className="range-buttons">
              {Object.keys(RANGE_LABELS).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={range === key ? "active" : ""}
                  onClick={() => setRange(key)}
                >
                  {RANGE_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={series} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="sales" name="Sales Amount" stroke="#22c55e" strokeWidth={2} fill="url(#salesLine)" />
              <Area type="monotone" dataKey="orders" name="Sales Order Count" stroke="#f59e0b" strokeWidth={2} fill="url(#ordersLine)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
