export default function Modal({ open, onClose, title, children, maxWidth = 400 }) {
  if (!open) return null
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,.75)',
        backdropFilter:'blur(5px)', zIndex:200,
        display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
      }}
    >
      <div style={{
        background:'var(--bg2)', border:'1px solid var(--border2)',
        borderRadius:'var(--r)', padding:'1.4rem',
        width:'100%', maxWidth, maxHeight:'88vh', overflowY:'auto',
        animation:'fadeUp .22s ease',
      }}>
        <h3 style={{ fontSize:'.95rem', fontWeight:800, marginBottom:'1rem' }}>{title}</h3>
        {children}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
