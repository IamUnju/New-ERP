import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="auth">
      <div className="auth-card">
        <h1>Unauthorized</h1>
        <p>You do not have access to this page.</p>
        <Link to="/dashboard" className="btn primary">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
