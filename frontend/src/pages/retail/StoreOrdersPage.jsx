import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import api from "../../api/axios.js";

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    store: "",
    product: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load stores and products for filtering
      const [storesRes, productsRes] = await Promise.all([
        api.get("/api/v1/stores/"),
        api.get("/api/v1/products/"),
      ]);
      setStores(storesRes.data.results || storesRes.data);
      setProducts(productsRes.data.results || productsRes.data);
      
      // Load orders (would be retail orders endpoint)
      try {
        const ordersRes = await api.get("/api/v1/retail-orders/");
        setOrders(ordersRes.data.results || ordersRes.data);
      } catch {
        // If endpoint doesn't exist yet, show demo data
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on selected store and product
  const filteredOrders = orders.filter((order) => {
    if (filters.store && order.store !== parseInt(filters.store)) return false;
    if (filters.product && order.product !== parseInt(filters.product)) return false;
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
          <h1>Store Orders</h1>
          <p>Manage orders from retail stores</p>
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
          <Plus size={18} /> Create Order
        </button>
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
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Order ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Store</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Product</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Quantity</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "12px" }}>#{order.id}</td>
                  <td style={{ padding: "12px" }}>{getStoreName(order.store)}</td>
                  <td style={{ padding: "12px" }}>{getProductName(order.product)}</td>
                  <td style={{ padding: "12px" }}>{order.quantity}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        backgroundColor:
                          order.status === "pending"
                            ? "#fef3c7"
                            : order.status === "completed"
                            ? "#d1fae5"
                            : "#fee2e2",
                        color:
                          order.status === "pending"
                            ? "#92400e"
                            : order.status === "completed"
                            ? "#065f46"
                            : "#7f1d1d",
                      }}
                    >
                      {order.status}
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
                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
