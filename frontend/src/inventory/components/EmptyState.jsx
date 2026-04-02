export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="inv-empty">
      <div className="inv-empty-icon">{icon || '💎'}</div>
      <h3>{title || 'No items found'}</h3>
      <p>{description || 'Nothing to display here yet.'}</p>
      {action}
    </div>
  );
}
