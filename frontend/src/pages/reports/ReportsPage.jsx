import { useEffect, useState } from "react";
import { getFinanceSummary } from "../../api/finance.js";
import { getCustomers } from "../../api/customers.js";

function StatCard({ label, value, sub, color = "#18b34a" }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"20px 24px" }}>
      <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, color }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFinanceSummary({ year: new Date().getFullYear() }),
      getCustomers({ is_active: true }),
    ]).then(([sr, cr]) => {
      setSummary(sr.data);
      setCustomers(cr.data.results ?? cr.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:24, color:"#6b7280" }}>Loading reports…</div>;

  const totalReceivable = customers.reduce((s, c) => s + parseFloat(c.balance || 0), 0);

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header"><h1>Reports</h1></div>

      <h3 style={{ color:"#374151", fontWeight:600, marginBottom:12 }}>
        Financial Overview — {new Date().getFullYear()}
      </h3>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:32 }}>
        <StatCard label="Total Income"           value={`$${parseFloat(summary?.total_income||0).toLocaleString(undefined,{minimumFractionDigits:2})}`} color="#18b34a" />
        <StatCard label="Total Expenses"         value={`$${parseFloat(summary?.total_expenses||0).toLocaleString(undefined,{minimumFractionDigits:2})}`} color="#dc2626" />
        <StatCard label="Net Profit"             value={`$${parseFloat(summary?.net_profit||0).toLocaleString(undefined,{minimumFractionDigits:2})}`} color={parseFloat(summary?.net_profit||0)>=0?"#2563eb":"#dc2626"} />
        <StatCard label="Customer Receivables"   value={`$${totalReceivable.toLocaleString(undefined,{minimumFractionDigits:2})}`} color="#d97706" sub={`${customers.length} active customers`} />
      </div>

      <h3 style={{ color:"#374151", fontWeight:600, marginBottom:12 }}>Customer Receivable Balance</h3>
      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Name</th><th>City</th><th>Balance</th></tr></thead>
          <tbody>
            {customers.filter(c => parseFloat(c.balance||0) !== 0).slice(0, 20).map(c => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.name}</td>
                <td>{c.city || "—"}</td>
                <td style={{ color: parseFloat(c.balance)>0?"#dc2626":"#18b34a", fontWeight:600 }}>
                  ${parseFloat(c.balance).toFixed(2)}
                </td>
              </tr>
            ))}
            {customers.filter(c => parseFloat(c.balance||0) !== 0).length === 0 && (
              <tr><td colSpan={4} style={{ textAlign:"center", color:"#9ca3af", padding:"32px 0" }}>No outstanding balances</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
