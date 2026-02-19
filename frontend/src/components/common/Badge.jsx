/**
 * Small status badge.
 * Props: label (string), variant ("success" | "danger" | "warning" | "info")
 */
export default function Badge({ label, variant = "info" }) {
  return <span className={`badge badge-${variant}`}>{label}</span>;
}
