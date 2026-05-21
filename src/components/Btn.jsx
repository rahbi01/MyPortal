export default function Btn({ variant='g', size='md', onClick, children, disabled, style={}, className='' }) {
  const base = {
    border:'none', borderRadius:'var(--rs2)',
    fontFamily:'inherit', fontWeight:800, cursor: disabled ? 'not-allowed' : 'pointer',
    display:'inline-flex', alignItems:'center', gap:'.3rem',
    transition:'all .15s', opacity: disabled ? .45 : 1,
    padding: size==='sm' ? '.28rem .6rem' : '.5rem .9rem',
    fontSize: size==='sm' ? '.72rem' : '.8rem',
  }
  const variants = {
    p:  { background:'linear-gradient(135deg,var(--green),var(--green2))', color:'#fff' },
    g:  { background:'var(--card2)', color:'var(--text2)', border:'1px solid var(--border)' },
    d:  { background:'var(--rs)', color:'var(--red)', border:'1px solid rgba(239,68,68,.2)' },
    out:{ background:'var(--rs)', color:'var(--red)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'var(--rx)' },
  }
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}
