import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import api from "../../api/axios.js";
import Modal from "../../components/common/Modal.jsx";

export default function CategoryManagementPage() {
  const navigate = useNavigate();
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit
  const [modalType, setModalType] = useState("main"); // main, sub
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", parent: null });
  const [expandedMain, setExpandedMain] = useState(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [mainRes, subRes] = await Promise.all([
        api.get("/api/v1/main-categories/"),
        api.get("/api/v1/subcategories/")
      ]);
      setMainCategories(mainRes.data);
      setSubcategories(subRes.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal to add/edit category
  const handleOpenModal = (type, category = null, mode = "add") => {
    setModalType(type);
    setModalMode(mode);
    if (category) {
      setSelectedCategory(category);
      setFormData({ 
        name: category.name, 
        description: category.description || "",
        parent: category.parent || null 
      });
    } else {
      setFormData({ name: "", description: "", parent: null });
      setSelectedCategory(null);
    }
    setShowModal(true);
  };

  // Save category
  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const endpoint = modalType === "main" ? "/api/v1/main-categories/" : "/api/v1/subcategories/";
      const url = modalMode === "edit" ? `${endpoint}${selectedCategory.id}/` : endpoint;
      const method = modalMode === "edit" ? "patch" : "post";

      const payload = {
        name: formData.name,
        description: formData.description,
      };

      // Add parent for subcategory
      if (modalType === "sub" && formData.parent) {
        payload.parent = formData.parent;
      }

      if (method === "patch") {
        await api.patch(url, payload);
      } else {
        await api.post(url, payload);
      }

      setShowModal(false);
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category: " + (error.response?.data?.name?.[0] || error.message));
    }
  };

  // Delete category
  const handleDeleteCategory = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const endpoint = type === "main" ? "/api/v1/main-categories/" : "/api/v1/subcategories/";
      await api.delete(`${endpoint}${id}/`);
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error deleting category");
    }
  };

  // Get sub-categories for a main category
  const getSubcategoriesForMain = (mainCategoryId) => {
    return subcategories.filter(sub => sub.parent === mainCategoryId);
  };

  // Get parent category name
  const getParentName = (parentId) => {
    const parent = mainCategories.find(cat => cat.id === parentId);
    return parent ? parent.name : "Unknown";
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
          <h1>Category Management</h1>
          <p>Manage Main Categories and Subcategories</p>
        </div>
      </div>

      {/* Main Categories Section */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Main Categories</h2>
          <button
            onClick={() => handleOpenModal("main", null, "add")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "#18b34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            <Plus size={18} /> Add Main Category
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
          {mainCategories.map((mainCat) => {
            const subs = getSubcategoriesForMain(mainCat.id);
            const isExpanded = expandedMain === mainCat.id;

            return (
              <div key={mainCat.id}>
                {/* Main Category Row */}
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: subs.length > 0 ? "pointer" : "default",
                  }}
                  onClick={() => subs.length > 0 && setExpandedMain(isExpanded ? null : mainCat.id)}
                >
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                    {subs.length > 0 && (
                      <ChevronRight
                        size={18}
                        style={{
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                          color: "#666"
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>
                        {mainCat.name}
                      </h3>
                      {mainCat.description && (
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>
                          {mainCat.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#666", marginRight: "10px" }}>
                      {subs.length} subcategories
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal("main", mainCat, "edit");
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory("main", mainCat.id);
                      }}
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
                  </div>
                </div>

                {/* Subcategories List */}
                {isExpanded && subs.length > 0 && (
                  <div style={{ paddingLeft: "20px", marginTop: "8px" }}>
                    {subs.map((subCat) => (
                      <div
                        key={subCat.id}
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e9ecef",
                          borderRadius: "4px",
                          padding: "10px 12px",
                          marginBottom: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <h4 style={{ margin: "0", fontSize: "13px", fontWeight: "500" }}>
                            {subCat.name}
                          </h4>
                          {subCat.description && (
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#999" }}>
                              {subCat.description}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => handleOpenModal("sub", subCat, "edit")}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                              cursor: "pointer",
                              color: "#666",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory("sub", subCat.id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#fff5f5",
                              border: "1px solid #f5aaaa",
                              borderRadius: "4px",
                              cursor: "pointer",
                              color: "#dc3545",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Subcategory Button */}
                {isExpanded && (
                  <button
                    onClick={() => {
                      setFormData({ name: "", description: "", parent: mainCat.id });
                      setModalType("sub");
                      setModalMode("add");
                      setSelectedCategory(null);
                      setShowModal(true);
                    }}
                    style={{
                      marginTop: "8px",
                      marginLeft: "20px",
                      padding: "6px 12px",
                      backgroundColor: "#e8f5e9",
                      border: "1px dashed #18b34a",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#18b34a",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    + Add Subcategory
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {mainCategories.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            No main categories yet. Click "Add Main Category" to get started.
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <Modal
          title={`${modalMode === "add" ? "Add" : "Edit"} ${modalType === "main" ? "Main" : "Sub"} Category`}
          onClose={() => setShowModal(false)}
          onConfirm={handleSaveCategory}
          confirmText={modalMode === "add" ? "Create" : "Update"}
        >
          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: "80px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {modalType === "sub" && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
                  Parent Main Category *
                </label>
                <select
                  value={formData.parent || ""}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value ? parseInt(e.target.value) : null })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select a main category</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
