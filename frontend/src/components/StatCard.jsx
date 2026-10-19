
export default function StatCard({
  label,
  value = 0,
  tone = "blue",
  icon = "▤",
}) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>

      <div>
        <p>{label}</p>
        <strong>{value ?? 0}</strong>
      </div>
    </article>
  );
}
