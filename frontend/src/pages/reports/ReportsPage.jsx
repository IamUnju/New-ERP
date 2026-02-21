import { Fragment, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const REPORT_GROUPS = [
  {
    group: "Sales",
    items: [
      { id: "sales-overview", name: "Sales Overview", lastVisited: "-" },
      { id: "sales-top-products", name: "Top Products", lastVisited: "-" },
      { id: "sales-top-customers", name: "Top Customers", lastVisited: "-" },
      { id: "sales-top-salesperson", name: "Top Salesperson", lastVisited: "-" },
      { id: "sales-custom", name: "Custom Sales Report", lastVisited: "-" },
      { id: "sales-delivery", name: "Delivery Summary", lastVisited: "-" },
    ],
  },
  {
    group: "Retail",
    items: [
      { id: "retail-overview", name: "Store Overview", lastVisited: "-" },
      { id: "retail-top-stores", name: "Top Stores", lastVisited: "-" },
      { id: "retail-top-products", name: "Top Products", lastVisited: "-" },
      { id: "retail-cashier", name: "Store Cashier Report", lastVisited: "-" },
      { id: "retail-profit", name: "Store Profit Report", lastVisited: "-" },
      { id: "retail-custom", name: "Custom Retail Report", lastVisited: "-" },
    ],
  },
  {
    group: "Finance",
    items: [
      { id: "finance-overview", name: "Cash Flow Overview", lastVisited: "-" },
      { id: "finance-income", name: "Income Summary", lastVisited: "-" },
      { id: "finance-expense", name: "Expense Summary", lastVisited: "-" },
      { id: "finance-profit", name: "Profit and Loss", lastVisited: "-" },
      { id: "finance-ar", name: "Accounts Receivable", lastVisited: "-" },
      { id: "finance-ap", name: "Accounts Payable", lastVisited: "-" },
    ],
  },
];

const NAV_SECTIONS = ["Sales", "Retail", "Finance"];

export default function ReportsPage() {
  const [activeSection, setActiveSection] = useState("Sales");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState(() => new Set());
  const navigate = useNavigate();

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const groups = REPORT_GROUPS.filter((group) =>
      activeSection ? group.group === activeSection : true
    );

    if (!query) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.name.toLowerCase().includes(query)),
      }))
      .filter((group) => group.items.length > 0);
  }, [activeSection, search]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="reports-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        .reports-shell {
          --ink: #0f172a;
          --muted: #6b7280;
          --line: #e6e9ef;
          --panel: #ffffff;
          --surface: #f6f7fb;
          --accent: #22c55e;
          --accent-weak: #e8f9ee;
          min-height: calc(100vh - 64px);
          background: #f6f7fb;
          padding: 20px 18px 28px;
          font-family: "Space Grotesk", "IBM Plex Sans", "Segoe UI", sans-serif;
          color: var(--ink);
        }

        .reports-layout {
          display: grid;
          grid-template-columns: minmax(190px, 220px) minmax(0, 1fr);
          gap: 16px;
        }

        .reports-sidebar {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
        }

        .reports-sidebar h4 {
          margin: 0 0 14px;
          font-size: 14px;
          font-weight: 700;
          color: #111827;
        }

        .reports-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .reports-nav button {
          border: none;
          background: transparent;
          text-align: left;
          padding: 8px 10px 8px 12px;
          border-radius: 8px;
          color: #0f172a;
          font-weight: 500;
          cursor: pointer;
          position: relative;
        }

        .reports-nav button.active {
          background: var(--accent-weak);
          color: #166534;
        }

        .reports-nav button.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3px;
          border-radius: 4px;
          background: var(--accent);
        }

        .reports-sidebar .push-title {
          margin: 18px 0 8px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .reports-main {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
          animation: rise 0.35s ease;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reports-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 10px;
        }

        .reports-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .reports-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .reports-search {
          flex: 1;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 12px;
          background: #ffffff;
        }

        .reports-button {
          border: 1px solid var(--line);
          background: #f3f4f6;
          border-radius: 10px;
          padding: 8px 12px;
          font-weight: 600;
          cursor: pointer;
          font-size: 12px;
        }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .reports-table th {
          text-align: left;
          color: #64748b;
          font-weight: 600;
          padding: 10px 12px;
          border-bottom: 1px solid var(--line);
          background: #f8fafc;
        }

        .reports-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #eef2f7;
        }

        .report-row {
          cursor: pointer;
        }

        .report-row:hover {
          background: #f8fafc;
        }

        .reports-group {
          background: #eef2f7;
          font-weight: 600;
          color: #1e293b;
        }

        .fav-button {
          border: 1px solid var(--line);
          background: #ffffff;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 12px;
          cursor: pointer;
        }

        .fav-button.active {
          border-color: var(--accent);
          background: var(--accent-weak);
          color: #166534;
        }

        @media (max-width: 980px) {
          .reports-layout {
            grid-template-columns: 1fr;
          }
          .reports-sidebar {
            order: 2;
          }
        }
      `}</style>

      <div className="reports-layout">
        <aside className="reports-sidebar">
          <h4>Report Center</h4>
          <div className="reports-nav">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section}
                className={section === activeSection ? "active" : ""}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </button>
            ))}
          </div>
          <div className="push-title">Push Services</div>
          <div className="reports-nav">
            <button type="button">BOSS Assistant</button>
          </div>
        </aside>

        <section className="reports-main">
          <div className="reports-header">
            <h2>All Reports</h2>
            <button className="reports-button" type="button">My Favorites</button>
          </div>
          <div className="reports-toolbar">
            <input
              className="reports-search"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <table className="reports-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Last Visited</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <Fragment key={group.group}>
                  <tr className="reports-group">
                    <td colSpan={3}>{group.group}</td>
                  </tr>
                  {group.items.map((item) => (
                    <tr
                      key={item.id}
                      className="report-row"
                      onClick={() => navigate(`/reports/${item.id}`)}
                    >
                      <td>{item.name}</td>
                      <td>{item.lastVisited}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className={`fav-button ${favorites.has(item.id) ? "active" : ""}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                        >
                          Fav
                        </button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0" }}>
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
