import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import api from "../../api/axios.js";

export default function AdjustPaymentsPage() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    store: "",
    type: "",
  });

  const adjustmentTypes = ["Discount", "Refund", "Credit", "Debit", "Charge"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const storesRes = await api.get("/api/v1/stores/");
      setStores(storesRes.data.results || storesRes.data);

      // Load payment adjustments
      try {
        const adjustmentsRes = await api.get("/api/v1/payment-adjustments/");
        setAdjustments(adjustmentsRes.data.results || adjustmentsRes.data);
      } catch {
        setAdjustments([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdjustments = adjustments.filter((adj) => {
    if (filters.store && adj.store !== parseInt(filters.store)) return false;
    if (filters.type && adj.type !== filters.type) return false;
    return true;
  });

  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : `Store #${storeId}`;
  };

  const getAdjustmentIcon = (type) => {
    switch (type) {
      case "Discount":
        return "🏷️";
      case "Refund":
        return "↩️";
      case "Credit":
        return "✅";
      case "Debit":
        return "❌";
      case "Charge":
        return "💰";
      default:
        return "•";
    }
  };

  const getAdjustmentColor = (type) => {
    switch (type) {
      case "Discount":
        return { bg: "#fef3c7", color: "#92400e" };
      case "Refund":
        return { bg: "#d1fae5", color: "#065f46" };
      case "Credit":
        return { bg: "#dbeafe", color: "#0c4a6e" };
      case "Debit":
        return { bg: "#fee2e2", color: "#7f1d1d" };
      case "Charge":
        return { bg: "#f3e8ff", color: "#5b21b6" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const totalAdjustment = filteredAdjustments.reduce((sum, a) => {
    const amount = parseFloat(a.amount) || 0;
    return a.type === "Refund" || a.type === "Discount" ? sum - amount : sum + amount;
  }, 0);

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
          <h1>Adjust Payments</h1>
          <p>Manage payment adjustments and modifications</p>
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
          <Plus size={18} /> Create Adjustment
        </button>
      </div>

      {/* Summary Card */}
      <div
        style={{
          backgroundColor: totalAdjustment < 0 ? "#fef3c7" : "#d1fae5",
          border: totalAdjustment < 0 ? "1px solid #fcd34d" : "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px" }}>Total Adjustment Amount</p>
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: totalAdjustment < 0 ? "#92400e" : "#065f46",
            margin: 0,
          }}
        >
          {totalAdjustment < 0 ? "-" : "+"}${Math.abs(totalAdjustment).toFixed(2)}
        </h3>
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
            Filter by Adjustment Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <option value="">All Types</option>
            {adjustmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
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
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Adjustment ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Store</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Order ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Type</th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>Amount</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Reason</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Date</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdjustments.length > 0 ? (
              filteredAdjustments.map((adj) => {
                const adjColor = getAdjustmentColor(adj.type);
                return (
                  <tr key={adj.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "12px" }}>#{adj.id}</td>
                    <td style={{ padding: "12px" }}>{getStoreName(adj.store)}</td>
                    <td style={{ padding: "12px" }}>#{adj.order_id}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          backgroundColor: adjColor.bg,
                          color: adjColor.color,
                          marginRight: "4px",
                        }}
                      >
                        {getAdjustmentIcon(adj.type)} {adj.type}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                      <span style={{ color: adj.type === "Refund" || adj.type === "Discount" ? "#dc3545" : "#18b34a" }}>
                        {adj.type === "Refund" || adj.type === "Discount" ? "-" : "+"}${parseFloat(adj.amount).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px" }}>{adj.reason || "-"}</td>
                    <td style={{ padding: "12px", fontSize: "12px", color: "#6b7280" }}>
                      {new Date(adj.created_at).toLocaleDateString()}
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
                  No adjustments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
