import { useContext, useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import api from "../api";
import { getCustomers } from "../api/customers.js";
import { getFinanceSummary } from "../api/finance.js";
import { UserContext } from "../context/Context";

/* ── Tiny stat card ─────────────────────────────────────────────────── */
function StatCard({ label, value, color = "#18b34a", icon }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
      padding: "18px 22px", display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{value}</div>
      </div>
    </div>
  );
}

/* ── Pending orders widget ──────────────────────────────────────────── */
function PendingTile({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "14px 8px", borderRight: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ── Section card wrapper ───────────────────────────────────────────── */
function Card({ title, action, children, style: extraStyle }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", ...extraStyle }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #e5e7eb" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

/* ── Recharts custom tooltip ────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#1c2130", color: "#fff", padding: "8px 14px", borderRadius: 6, fontSize: 12 }}>
        <div style={{ marginBottom: 4, color: "#9ca3af" }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name}>{p.name}: <strong>${Number(p.value).toLocaleString()}</strong></div>
        ))}
      </div>
    );
  }
  return null;
}

/* ── Stub sales data (last 7 days) — replaced by real API later ─────── */
function buildChartData(salesData) {
  if (!salesData?.length) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d) => ({ day: d, Sales: 0, Revenue: 0 }));
  }
  return salesData;
}

/* ══════════════════════════════════════════════════════════════════════
   Dashboard Component
   ══════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [stats, setStats]         = useState(null);
  const [financeSummary, setFin]  = useState(null);
  const [customers, setCust]      = useState([]);
  const [chartRange, setRange]    = useState("week");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/v1/reports/dashboard/").catch(() => ({ data: {} })),
      getFinanceSummary({ year: new Date().getFullYear() }).catch(() => ({ data: {} })),
      getCustomers({ is_active: true }).catch(() => ({ data: [] })),
    ]).then(([sr, fr, cr]) => {
      setStats(sr.data);
      setFin(fr.data);
      setCust(cr.data.results ?? cr.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const chartData = buildChartData(stats?.sales_chart);
  const totalReceivable = customers.reduce((s, c) => s + parseFloat(c.balance || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: 32, color: "#9ca3af", display: "flex", alignItems: "center", gap: 10 }}>
        <span>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, overflowY: "auto" }}>
      {/* Welcome banner */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Welcome back, {user?.username || "User"} 👋
        </h2>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
          Here's what's happening in your business today.
        </p>
      </div>

      {/* Top stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Products"    value={stats?.total_products ?? 0}                           color="#2563eb" icon="📦" />
        <StatCard label="Low Stock Alerts"  value={stats?.low_stock_count ?? 0}                          color="#dc2626" icon="⚠️" />
        <StatCard label="Total Orders"      value={stats?.total_orders ?? 0}                             color="#18b34a" icon="🛒" />
        <StatCard label="YTD Revenue"       value={`$${Number(financeSummary?.total_income || 0).toLocaleString()}`} color="#d97706" icon="💰" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Sales Overview chart */}
        <Card
          title="Sales Overview"
          action={
            <div style={{ display: "flex", gap: 4 }}>
              {["week", "month", "year"].map(r => (
                <button key={r} onClick={() => setRange(r)}
                  style={{ padding: "3px 10px", border: "1px solid #e5e7eb", borderRadius: 4, background: chartRange === r ? "#18b34a" : "none", color: chartRange === r ? "#fff" : "#6b7280", cursor: "pointer", fontSize: 11 }}>
                  {r}
                </button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18b34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#18b34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Sales" stroke="#18b34a" strokeWidth={2} fill="url(#gSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Finance summary */}
        <Card title="Finance Summary">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Total Income",   value: financeSummary?.total_income   || 0, color: "#18b34a" },
              { label: "Total Expenses", value: financeSummary?.total_expenses || 0, color: "#dc2626" },
              { label: "Net Profit",     value: financeSummary?.net_profit     || 0, color: parseFloat(financeSummary?.net_profit || 0) >= 0 ? "#2563eb" : "#dc2626" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f9fafb", borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color }}>${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending Orders + Customer Receivables row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Pending Orders */}
        <Card title="Pending Orders">
          <div style={{ display: "flex", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <PendingTile label="Pending Approval" value={stats?.pending_approval ?? 0} />
            <PendingTile label="Not Shipped"       value={stats?.not_shipped ?? 0} />
            <PendingTile label="Not Invoiced"      value={stats?.not_invoiced ?? 0} />
            <div style={{ flex: 1, textAlign: "center", padding: "14px 8px" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>{stats?.unpaid ?? 0}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Unpaid</div>
            </div>
          </div>
        </Card>

        {/* Customer Receivable Balance */}
        <Card title="Customer Receivable Balance" action={
          <span style={{ fontSize: 18, fontWeight: 800, color: "#d97706" }}>
            ${totalReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        }>
          {customers.filter(c => parseFloat(c.balance || 0) > 0).slice(0, 4).length === 0
            ? <div style={{ textAlign: "center", color: "#9ca3af", padding: "16px 0", fontSize: 13 }}>No outstanding balances</div>
            : <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", color: "#9ca3af", fontWeight: 500, padding: "0 0 8px" }}>Customer</th>
                    <th style={{ textAlign: "right", color: "#9ca3af", fontWeight: 500, padding: "0 0 8px" }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.filter(c => parseFloat(c.balance || 0) > 0).slice(0, 4).map(c => (
                    <tr key={c.id}>
                      <td style={{ padding: "5px 0", color: "#374151" }}>{c.name}</td>
                      <td style={{ padding: "5px 0", textAlign: "right", color: "#d97706", fontWeight: 600 }}>${parseFloat(c.balance).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Card>
      </div>

      {/* Low Stock Products */}
      {stats?.low_stock_products?.length > 0 && (
        <Card title="⚠ Low Stock Products">
          <table className="data-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Threshold</th></tr></thead>
            <tbody>
              {stats.low_stock_products.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td style={{ color: "#dc2626", fontWeight: 600 }}>{p.stock_quantity}</td>
                  <td>{p.low_stock_threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;


