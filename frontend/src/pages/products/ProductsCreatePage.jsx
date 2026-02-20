import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  createProduct, 
  generateSKU,
  getActiveMainCategories, 
  getActiveSubcategories,
  getSuppliers, 
  getWarehouses 
} from "../../api/products.js";
import FormWizardLayout from "../../components/common/FormWizardLayout.jsx";

const EMPTY = {
  sku: "",
  name: "",
  description: "",
  main_category: "",
  category: "",
  supplier: "",
  warehouse: "",
  price: "",
  stock_quantity: "",
  low_stock_threshold: "5",
  is_active: true,
};

const META_EMPTY = {
  brand: "",
  unit: "",
  markGift: false,
  multiSpec: false,
  serialManagement: false,
  tax: "",
};

const STEPS = [
  { title: "Basic Information", subtitle: "Product Details" },
  { title: "Pricing", subtitle: "Pricing Setup & Tax" },
  { title: "Inventory", subtitle: "Stock & Barcode" },
];

export default function ProductsCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [meta, setMeta] = useState(META_EMPTY);
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(1);

  // Load main categories, suppliers, warehouses, and generate SKU on mount
  useEffect(() => {
    Promise.all([
      generateSKU().catch(err => {
        console.error("Failed to generate SKU:", err);
        return { data: { sku: "SKU" + new Date().getTime() } };
      }),
      getActiveMainCategories().catch(err => {
        console.error("Failed to load main categories:", err);
        return { data: [] };
      }),
      getSuppliers().catch(err => {
        console.error("Failed to load suppliers:", err);
        return { data: [] };
      }),
      getWarehouses().catch(err => {
        console.error("Failed to load warehouses:", err);
        return { data: [] };
      })
    ]).then(([skuRes, m, s, w]) => {
      console.log("SKU generated:", skuRes.data.sku);
      console.log("Main categories loaded:", m.data);
      setForm((prev) => ({ ...prev, sku: skuRes.data.sku }));
      setMainCategories(m.data.results ?? m.data);
      setSuppliers(s.data.results ?? s.data);
      setWarehouses(w.data.results ?? w.data);
    });
  }, []);

  // Load subcategories when main category changes
  useEffect(() => {
    if (form.main_category) {
      console.log("Loading subcategories for parent:", form.main_category);
      getActiveSubcategories(form.main_category)
        .then((res) => {
          console.log("Subcategories loaded:", res.data);
          setSubcategories(res.data.results ?? res.data);
        })
        .catch(err => {
          console.error("Failed to load subcategories:", err);
          setSubcategories([]);
        });
    } else {
      setSubcategories([]);
    }
  }, [form.main_category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If changing main_category, reset subcategory
    if (name === "main_category") {
      setForm((prev) => ({ 
        ...prev, 
        main_category: value,
        category: "" // Clear subcategory when main category changes
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleMetaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeta((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
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
      await createProduct(payload);
      navigate("/products");
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const validateStep = (step) => {
    setError("");
    
    if (step === 1) {
      // Step 1: Required - SKU, Name, Main Category, Unit
      if (!form.sku.trim()) {
        setError("Product No. is required");
        return false;
      }
      if (!form.name.trim()) {
        setError("Product Name is required");
        return false;
      }
      if (!form.main_category) {
        setError("Main Category is required");
        return false;
      }
      if (!meta.unit.trim()) {
        setError("Unit of Measure is required");
        return false;
      }
    }
    
    if (step === 2) {
      // Step 2: Required - Price
      if (!form.price || parseFloat(form.price) <= 0) {
        setError("Price is required and must be greater than 0");
        return false;
      }
    }
    
    if (step === 3) {
      // Step 3: Required - Stock Quantity
      if (!form.stock_quantity || parseInt(form.stock_quantity, 10) < 0) {
        setError("Stock Quantity is required and must be 0 or greater");
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateStep(activeStep)) {
      return;
    }
    
    if (activeStep < 3) {
      setActiveStep((prev) => prev + 1);
      setError(""); // Clear error when moving to next step
      return;
    }
    handleSubmit();
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
      setError(""); // Clear error when going back
    } else {
      navigate("/products");
    }
  };

  const crumbs = [
    { label: "Home" },
    { label: "Products" },
    { label: "Add New Product", active: true },
  ];

  return (
    <FormWizardLayout
      title="Add New Product"
      crumbs={crumbs}
      steps={STEPS}
      activeStep={activeStep}
      onBack={handleBack}
      primaryAction={{
        label: activeStep < 3 ? "Next" : saving ? "Saving..." : "Save",
        onClick: handleNext,
        disabled: saving,
      }}
    >
      {error && <div className="wizard-alert">{error}</div>}

      <div className="wizard-card">
        {activeStep === 1 && (
          <div className="wizard-grid">
            <label className="wizard-field">
              Product No. *
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input 
                  name="sku" 
                  value={form.sku} 
                  readOnly 
                  style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                  title="Auto-generated product number"
                />
                <span style={{ fontSize: "11px", color: "#6b7280", whiteSpace: "nowrap" }}>Auto-generated</span>
              </div>
            </label>
            <label className="wizard-field">
              Product Name *
              <div className="wizard-inline">
                <input name="name" value={form.name} onChange={handleChange} required />
                <label className="wizard-toggle">
                  <span>Mark as Gift</span>
                  <input
                    name="markGift"
                    type="checkbox"
                    checked={meta.markGift}
                    onChange={handleMetaChange}
                  />
                  <span className="wizard-toggle-pill" />
                </label>
              </div>
            </label>
            <label className="wizard-field">
              Main Category *
              <select name="main_category" value={form.main_category} onChange={handleChange} required>
                <option value="">Select main category</option>
                {mainCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wizard-field">
              Subcategory
              <select 
                name="category" 
                value={form.category} 
                onChange={handleChange}
                disabled={!form.main_category}
              >
                <option value="">Select subcategory</option>
                {subcategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wizard-field">
              Brand
              <input name="brand" value={meta.brand} onChange={handleMetaChange} placeholder="Select or add brand" />
            </label>
            <label className="wizard-field">
              Unit of Measure *
              <input name="unit" value={meta.unit} onChange={handleMetaChange} placeholder="Select a unit of measure" />
            </label>
            <div className="wizard-checks">
              <label>
                <input
                  name="multiSpec"
                  type="checkbox"
                  checked={meta.multiSpec}
                  onChange={handleMetaChange}
                />
                Multi-Specification
              </label>
              <label>
                <input
                  name="serialManagement"
                  type="checkbox"
                  checked={meta.serialManagement}
                  onChange={handleMetaChange}
                />
                Serial Number Management
              </label>
            </div>
            <div className="wizard-upload">
              <div className="wizard-upload-box">⬆</div>
              <div className="wizard-upload-text">Supports .png, .jpg, .jpeg formats. Max 10 images (&lt;5MB each).</div>
            </div>
            <label className="wizard-field wizard-full">
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
            </label>
          </div>
        )}

        {activeStep === 2 && (
          <div className="wizard-grid">
            <label className="wizard-field">
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
            <label className="wizard-field">
              Supplier
              <select name="supplier" value={form.supplier} onChange={handleChange}>
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wizard-field">
              Tax
              <input name="tax" value={meta.tax || ""} onChange={handleMetaChange} placeholder="0%" />
            </label>
          </div>
        )}

        {activeStep === 3 && (
          <div className="wizard-grid">
            <label className="wizard-field">
              Warehouse
              <select name="warehouse" value={form.warehouse} onChange={handleChange}>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wizard-field">
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
            <label className="wizard-field">
              Low Stock Threshold
              <input
                name="low_stock_threshold"
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={handleChange}
              />
            </label>
            <label className="wizard-field wizard-toggle-row">
              <span>Active</span>
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
              />
            </label>
          </div>
        )}
      </div>
    </FormWizardLayout>
  );
}
