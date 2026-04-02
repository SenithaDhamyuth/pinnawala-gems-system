export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="inv-loading">
      <div className="inv-spinner" />
      <span style={{ fontSize: 14 }}>{text}</span>
    </div>
  );
}
