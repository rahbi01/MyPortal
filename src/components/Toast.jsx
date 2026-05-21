import { useEffect } from 'react'

export default function Toast({ msg, type, onDone }) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(onDone, 2700)
    return () => clearTimeout(t)
  }, [msg])

  if (!msg) return null

  const colors = {
    ok:   { bg:'rgba(34,197,94,.15)',   border:'rgba(34,197,94,.3)',   color:'#22c55e' },
    warn: { bg:'rgba(245,158,11,.15)',  border:'rgba(245,158,11,.3)',  color:'#f59e0b' },
    err:  { bg:'rgba(239,68,68,.15)',   border:'rgba(239,68,68,.3)',   color:'#ef4444' },
    '':   { bg:'var(--card2)',          border:'var(--border2)',       color:'var(--text)' },
  }
  const c = colors[type] || colors['']

  return (
    <div style={{
      position:'fixed', top:'1rem', left:'50%',
      transform:'translateX(-50%)',
      background:c.bg, border:`1px solid ${c.border}`, color:c.color,
      padding:'.5rem 1.2rem', borderRadius:'20px', fontSize:'.82rem',
      fontWeight:700, zIndex:999,
      boxShadow:'0 8px 24px rgba(0,0,0,.4)',
      animation:'fadeDown .3s cubic-bezier(.34,1.56,.64,1)',
    }}>
      {msg}
      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}
