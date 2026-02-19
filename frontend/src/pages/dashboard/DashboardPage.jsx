export default function DashboardPage() {
  return (
    <section className="page">
      <h1>Dashboard</h1>
      <div className="cards">
        <div className="card">
          <h3>Monthly Sales</h3>
          <p>Use the reports API to render analytics.</p>
        </div>
        <div className="card">
          <h3>Low Stock Alerts</h3>
          <p>Track products below threshold.</p>
        </div>
      </div>
    </section>
  );
}
