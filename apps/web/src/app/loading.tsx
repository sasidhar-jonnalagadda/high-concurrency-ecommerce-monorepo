/**
 * Global loading boundary for the application.
 * Displays a subtle, elegant loading state for all async route transitions.
 */
export default function Loading() {
  return (
    <div className="container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh' 
    }}>
      <div className="skeleton" style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '50%', 
        marginBottom: '16px',
        animation: 'pulse 1.5s infinite' 
      }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
        Loading experience...
      </p>
    </div>
  );
}
