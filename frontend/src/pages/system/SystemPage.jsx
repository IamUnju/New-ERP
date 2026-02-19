import { useContext } from "react";
import { UserContext } from "../../context/Context";
import { useNavigate } from "react-router-dom";

export default function SystemPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <h1>System</h1>
        <button className="btn primary" onClick={() => navigate("/system/masters")}>Open Masters</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
        {/* User Management */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:24 }}>
          <h3 style={{ margin:"0 0 8px", fontSize:16 }}>User Management</h3>
          <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 16px" }}>Manage system users and their roles.</p>
          <button className="btn primary" onClick={() => navigate("/users")}>Go to Users</button>
        </div>

        {/* Departments */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:24 }}>
          <h3 style={{ margin:"0 0 8px", fontSize:16 }}>Departments</h3>
          <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 16px" }}>Manage employee departments.</p>
          <button className="btn primary" onClick={() => navigate("/employees")}>Go to Employees</button>
        </div>

        {/* Warehouses */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:24 }}>
          <h3 style={{ margin:"0 0 8px", fontSize:16 }}>Warehouses</h3>
          <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 16px" }}>Configure warehouse locations.</p>
          <button className="btn primary" onClick={() => navigate("/stock")}>Go to Stock</button>
        </div>

        {/* Finance Accounts */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:24 }}>
          <h3 style={{ margin:"0 0 8px", fontSize:16 }}>Chart of Accounts</h3>
          <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 16px" }}>Set up financial accounts for ledger entries.</p>
          <button className="btn primary" onClick={() => navigate("/finance")}>Go to Finance</button>
        </div>

        {/* Masters */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:24 }}>
          <h3 style={{ margin:"0 0 8px", fontSize:16 }}>Master Data</h3>
          <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 16px" }}>Centralized master operations with import/export and audit log.</p>
          <button className="btn primary" onClick={() => navigate("/system/masters")}>Go to Masters</button>
        </div>
      </div>

      <div style={{ marginTop:32, background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:24 }}>
        <h3 style={{ margin:"0 0 12px", fontSize:16 }}>Session Info</h3>
        <table style={{ fontSize:13, borderCollapse:"collapse", width:"100%" }}>
          <tbody>
            <tr><td style={{ color:"#6b7280", padding:"4px 12px 4px 0" }}>Logged in as</td><td style={{ fontWeight:600 }}>{user?.email || "—"}</td></tr>
            <tr><td style={{ color:"#6b7280", padding:"4px 12px 4px 0" }}>Roles</td><td style={{ fontWeight:600 }}>{(user?.roles || []).join(", ") || "—"}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
