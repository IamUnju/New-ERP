import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye, Check, X } from "lucide-react";
import api from "../../api/axios.js";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    store: "",
    status: "",
  });

  const paymentStatuses = ["Pending", "Completed", "Failed", "Refunded"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const storesRes = await api.get("/api/v1/stores/");
      setStores(storesRes.data.results || storesRes.data);

      // Load payments
      try {
        const paymentsRes = await api.get("/api/v1/retail-payments/");
        setPayments(paymentsRes.data.results || paymentsRes.data);
      } catch {
        setPayments([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filters.store && payment.store !== parseInt(filters.store)) return false;
    if (filters.status && payment.status !== filters.status) return false;
    return true;
  });

  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : `Store #${storeId}`;
  };

  const getStatusIcon = (status) => {
    if (status === "Completed") return <Check size={16} style={{ color: "#18b34a" }} />;
    if (status === "Failed") return <X size={16} style={{ color: "#dc3545" }} />;
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "#fef3c7", color: "#92400e" };
      case "Completed":
        return { bg: "#d1fae5", color: "#065f46" };
      case "Failed":
        return { bg: "#fee2e2", color: "#7f1d1d" };
      case "Refunded":
        return { bg: "#e0e7ff", color: "#3730a3" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const completedAmount = filteredPayments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  if (loading) {
    return (
      <div className="page-card">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>Order Payments</h1>
          <p>Manage and track retail store order payments</p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            backgroundColor: "#18b34a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <Plus size={18} /> Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px" }}>Total Amount</p>
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#18b34a", margin: 0 }}>
            ${totalAmount.toFixed(2)}
          </h3>
        </div>
        <div
          style={{
            backgroundColor: "#f3f4f6",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px" }}>Completed Payments</p>
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#374151", margin: 0 }}>
            ${completedAmount.toFixed(2)}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
            Filter by Store
          </label>
          <select
            value={filters.store}
            onChange={(e) => setFilters({ ...filters, store: e.target.value })}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <option value="">All Stores</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
            Filter by Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <option value="">All Status</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef", backgroundColor: "#f8f9fa" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Payment ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Order ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Store</th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>Amount</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Payment Method</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Date</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => {
                const statusColor = getStatusColor(payment.status);
                return (
                  <tr key={payment.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "12px" }}>#{payment.id}</td>
                    <td style={{ padding: "12px" }}>#{payment.order_id}</td>
                    <td style={{ padding: "12px" }}>{getStoreName(payment.store)}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "#18b34a" }}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px" }}>{payment.payment_method || "Cash"}</td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor: statusColor.bg,
                            color: statusColor.color,
                            gap: "4px",
                          }}
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px", color: "#6b7280" }}>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#e3f2fd",
                          border: "1px solid #90caf9",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          color: "#1976d2",
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #dee2e6",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#fff5f5",
                          border: "1px solid #f5aaaa",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "#dc3545",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
