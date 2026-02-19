import React, { useEffect, useState } from "react";
import api from "../../api";

const STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function SalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadOrders = () => {
    setLoading(true);
    api
      .get("/api/v1/orders/")
      .then((res) => {
        const data = res.data?.results ?? res.data ?? [];
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter(
    (o) =>
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Sales Orders</h2>
        <input
          type="text"
          placeholder="Search orders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, width: 220 }}
        />
      </div>

      {loading && <div>Loading orders…</div>}
      {error && <div style={{ color: "#ef4444" }}>{error}</div>}

      {!loading && !error && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#6b7280", padding: "32px 0" }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order, idx) => (
                  <tr key={order.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                    <td>{order.customer_name || "—"}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                          background: `${STATUS_COLORS[order.status] || "#6b7280"}20`,
                          color: STATUS_COLORS[order.status] || "#6b7280",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>${Number(order.total_amount || 0).toFixed(2)}</td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

