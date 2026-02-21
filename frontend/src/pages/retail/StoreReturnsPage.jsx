import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye, AlertCircle } from "lucide-react";
import api from "../../api/axios.js";

export default function StoreReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    store: "",
    product: "",
    reason: "",
  });

  const returnReasons = [
    "Damaged",
    "Defective",
    "Wrong Item",
    "Quality Issue",
    "Customer Request",
    "Expired",
    "Other",
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storesRes, productsRes] = await Promise.all([
        api.get("/api/v1/stores/"),
        api.get("/api/v1/products/"),
      ]);
      setStores(storesRes.data.results || storesRes.data);
      setProducts(productsRes.data.results || productsRes.data);

      // Load returns (would be retail returns endpoint)
      try {
        const returnsRes = await api.get("/api/v1/retail-returns/");
        setReturns(returnsRes.data.results || returnsRes.data);
      } catch {
        setReturns([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter((ret) => {
    if (filters.store && ret.store !== parseInt(filters.store)) return false;
    if (filters.product && ret.product !== parseInt(filters.product)) return false;
    if (filters.reason && ret.reason !== filters.reason) return false;
    return true;
  });

  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : `Store #${storeId}`;
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

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
          <h1>Store Returns</h1>
          <p>Manage product returns from retail stores</p>
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
          <Plus size={18} /> Create Return
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
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
            Filter by Product
          </label>
          <select
            value={filters.product}
            onChange={(e) => setFilters({ ...filters, product: e.target.value })}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
            Filter by Return Reason
          </label>
          <select
            value={filters.reason}
            onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <option value="">All Reasons</option>
            {returnReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
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
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Return ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Store</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Product</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Qty</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Return Reason</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((ret) => (
                <tr key={ret.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "12px" }}>#{ret.id}</td>
                  <td style={{ padding: "12px" }}>{getStoreName(ret.store)}</td>
                  <td style={{ padding: "12px" }}>{getProductName(ret.product)}</td>
                  <td style={{ padding: "12px" }}>{ret.quantity}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertCircle size={14} style={{ color: "#dc3545" }} />
                      {ret.reason}
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        backgroundColor:
                          ret.status === "pending"
                            ? "#fef3c7"
                            : ret.status === "approved"
                            ? "#d1fae5"
                            : ret.status === "rejected"
                            ? "#fee2e2"
                            : "#e0e7ff",
                        color:
                          ret.status === "pending"
                            ? "#92400e"
                            : ret.status === "approved"
                            ? "#065f46"
                            : ret.status === "rejected"
                            ? "#7f1d1d"
                            : "#3730a3",
                      }}
                    >
                      {ret.status}
                    </span>
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
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                  No returns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
