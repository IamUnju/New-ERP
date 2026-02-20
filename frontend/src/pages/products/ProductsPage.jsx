import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  getSuppliers,
  getWarehouses,
  updateProduct,
} from "../../api/products.js";
import Badge from "../../components/common/Badge.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Modal from "../../components/common/Modal.jsx";

/* ─── Empty form state ──────────────────────────────────────────────────────── */
const EMPTY = {
  sku: "",
  name: "",
  description: "",
  category: "",
  supplier: "",
  warehouse: "",
  price: "",
  stock_quantity: "",
  low_stock_threshold: "5",
  is_active: true,
};

/* ─── Table column definitions ──────────────────────────────────────────────── */
const COLUMNS = [
  { key: "sku", label: "SKU" },
  { key: "name", label: "Name" },
  { key: "category_name", label: "Category" },
  { key: "supplier_name", label: "Supplier" },
  { key: "price", label: "Price", render: (r) => `$${parseFloat(r.price).toFixed(2)}` },
  { key: "stock_quantity", label: "Stock" },
  {
    key: "is_low_stock",
    label: "Status",
    render: (r) =>
      r.is_low_stock ? (
        <Badge label="Low Stock" variant="danger" />
      ) : r.is_active ? (
        <Badge label="Active" variant="success" />
      ) : (
        <Badge label="Inactive" variant="warning" />
      ),
  },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); /* null = create, object = edit */
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* Support entities for dropdowns */
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  /* ── Fetch product list ─────────────────────────────────────────────────── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ search });
      setProducts(res.data.results ?? res.data);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── Load dropdowns once on mount ──────────────────────────────────────── */
  useEffect(() => {
    Promise.all([getCategories(), getSuppliers(), getWarehouses()]).then(([c, s, w]) => {
      setCategories(c.data.results ?? c.data);
      setSuppliers(s.data.results ?? s.data);
      setWarehouses(w.data.results ?? w.data);
    });
  }, []);

  /* ── Open edit modal ────────────────────────────────────────────────────── */
  const openEdit = (product) => {
    setEditing(product);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category ?? "",
      supplier: product.supplier ?? "",
      warehouse: product.warehouse ?? "",
      price: product.price,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      is_active: product.is_active,
    });
    setError("");
    setShowModal(true);
  };

  /* ── Handle form field change ───────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /* ── Submit create / update ─────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity, 10),
        low_stock_threshold: parseInt(form.low_stock_threshold, 10),
        category: form.category || null,
        supplier: form.supplier || null,
        warehouse: form.warehouse || null,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Confirm + execute delete ───────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteProduct(confirmDelete.id);
      setConfirmDelete(null);
      fetchProducts();
    } catch {
      setError("Delete failed.");
    }
  };

  return (
    <section className="page">
      {/* ── Page header ── */}
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn primary" onClick={() => navigate("/products/new")}>
          + New Product
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Search by SKU or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* ── Data table ── */}
      <DataTable
        columns={COLUMNS}
        rows={products}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setConfirmDelete(row)}
      />

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <Modal
          title={editing ? "Edit Product" : "New Product"}
          onClose={() => setShowModal(false)}
          size="lg"
        >
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="field">
                SKU *
                <input name="sku" value={form.sku} onChange={handleChange} required />
              </label>
              <label className="field">
                Name *
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
            </div>

            <label className="field">
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
            </label>

            <div className="form-row">
              <label className="field">
                Category
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Supplier
                <select name="supplier" value={form.supplier} onChange={handleChange}>
                  <option value="">— None —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                Warehouse
                <select name="warehouse" value={form.warehouse} onChange={handleChange}>
                  <option value="">— None —</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Price *
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                Stock Quantity *
                <input
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field">
                Low Stock Threshold
                <input
                  name="low_stock_threshold"
                  type="number"
                  min="0"
                  value={form.low_stock_threshold}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label className="field checkbox-field">
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
              />
              Active
            </label>

            {error && <div className="alert error">{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p>
            Delete product <strong>{confirmDelete.name}</strong> ({confirmDelete.sku})? This cannot be undone.
          </p>
          <div className="form-actions">
            <button className="btn" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
            <button className="btn danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
