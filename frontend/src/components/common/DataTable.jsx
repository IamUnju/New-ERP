/**
 * Reusable data table.
 * Props:
 *   columns  – array of { key, label, render? }
 *   rows     – array of data objects
 *   loading  – boolean
 *   onEdit   – (row) => void
 *   onDelete – (row) => void
 *   showActions – boolean (default true)
 */
export default function DataTable({ columns, rows, loading, onEdit, onDelete, showActions = true }) {
  if (loading) return <div className="table-loading">Loading…</div>;

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (showActions ? 1 : 0)} className="table-empty">
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.id ?? idx}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : (row[col.key] ?? "—")}</td>
                ))}
                {showActions && (
                  <td className="table-actions">
                    <button className="btn-icon edit" onClick={() => onEdit?.(row)} title="Edit">
                      ✏️
                    </button>
                    <button className="btn-icon delete" onClick={() => onDelete?.(row)} title="Delete">
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
