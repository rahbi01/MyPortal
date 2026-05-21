import { useState, useEffect, useRef } from 'react'

// ─── Toast ────────────────────────────────────────────────────────
let _toastFn = null
export function useToastProvider() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)
  const show = (msg, type = '') => {
    clearTimeout(timerRef.current)
    setToast({ msg, type })
    timerRef.current = setTimeout(() => setToast(null), 2700)
  }
  _toastFn = show
  return { toast }
}
export function toast(msg, type = '') { _toastFn && _toastFn(msg, type) }

export function Toast({ toast: t }) {
  if (!t) return null
  const cls = { ok: '#22c55e', err: '#ef4444', warn: '#f59e0b' }
  return (
    <div style={{
      position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
      background: t.type ? `rgba(${t.type==='ok'?'34,197,94':t.type==='err'?'239,68,68':'245,158,11'},.15)` : 'var(--card2)',
      border: `1px solid ${t.type ? cls[t.type]+'44' : 'var(--border2)'}`,
      color: t.type ? cls[t.type] : 'var(--text)',
      padding: '.5rem 1.2rem', borderRadius: '20px', fontSize: '.82rem',
      fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap',
      animation: 'slideDown .28s ease',
    }}>{t.msg}</div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = '400px' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
      backdropFilter: 'blur(5px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 'var(--r)', padding: '1.4rem',
        width: '100%', maxWidth, maxHeight: '88vh', overflowY: 'auto',
        animation: 'fadeUp .22s ease',
      }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 800, marginBottom: '1rem' }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, msg }) {
  return (
    <Modal open={open} onClose={onClose} title={`⚠️ ${title}`}>
      <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginBottom: '1.1rem', lineHeight: 1.6 }}>{msg}</p>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <Btn ghost onClick={onClose} style={{ flex: 1 }}>إلغاء</Btn>
        <Btn danger onClick={() => { onConfirm(); onClose() }} style={{ flex: 1 }}>تأكيد</Btn>
      </div>
    </Modal>
  )
}

// ─── Button ───────────────────────────────────────────────────────
export function Btn({ children, onClick, primary, ghost, danger, small, style = {}, disabled }) {
  const base = {
    border: 'none', borderRadius: 'var(--rs2)',
    padding: small ? '.28rem .6rem' : '.5rem .9rem',
    fontSize: small ? '.7rem' : '.8rem', fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', transition: 'all .15s',
    display: 'inline-flex', alignItems: 'center', gap: '.3rem',
    opacity: disabled ? .4 : 1,
  }
  const variants = primary
    ? { background: 'linear-gradient(135deg,var(--green),var(--green2))', color: '#fff', border: 'none' }
    : danger
    ? { background: 'var(--rs)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }
    : { background: 'var(--card2)', color: 'var(--text2)', border: '1px solid var(--border)' }
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants, ...style }}>
      {children}
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────
const AV_COLORS = {
  g: { bg: 'var(--gs)', color: 'var(--green)' },
  b: { bg: 'var(--bs)', color: 'var(--blue)' },
  o: { bg: 'var(--golds)', color: 'var(--gold)' },
  r: { bg: 'var(--rs)', color: 'var(--red)' },
  p: { bg: 'var(--ps)', color: 'var(--purple)' },
}
export function Avatar({ initials, color = 'g', size = 38 }) {
  const c = AV_COLORS[color] || AV_COLORS.g
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.bg, color: c.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * .22, fontWeight: 800, flexShrink: 0,
    }}>{initials}</div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────
const BADGE_COLORS = {
  g: { bg: 'var(--gs)', color: 'var(--green)' },
  b: { bg: 'var(--bs)', color: 'var(--blue)' },
  o: { bg: 'var(--golds)', color: 'var(--gold)' },
  r: { bg: 'var(--rs)', color: 'var(--red)' },
  gray: { bg: 'var(--card3)', color: 'var(--text3)' },
}
export function Badge({ children, color = 'g' }) {
  const c = BADGE_COLORS[color] || BADGE_COLORS.g
  return (
    <span style={{
      fontSize: '.64rem', padding: '.15rem .5rem', borderRadius: 12,
      fontWeight: 800, whiteSpace: 'nowrap', ...c,
    }}>{children}</span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--r)', padding: '1.1rem', marginBottom: '.75rem', ...style,
    }}>{children}</div>
  )
}

// ─── Input ────────────────────────────────────────────────────────
export function Inp({ label, type = 'text', placeholder, value, onChange, style = {} }) {
  return (
    <div style={{ marginBottom: '.55rem' }}>
      {label && <div style={{ fontSize: '.72rem', color: 'var(--text2)', marginBottom: '.25rem', fontWeight: 700 }}>{label}</div>}
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{
          width: '100%', background: 'var(--card2)', border: '1px solid var(--border)',
          borderRadius: 'var(--rx)', padding: '.48rem .7rem', color: 'var(--text)',
          fontFamily: 'inherit', fontSize: '.8rem', outline: 'none', ...style,
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.4)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 19, borderRadius: 10, flexShrink: 0,
        background: checked ? 'var(--green)' : 'var(--card3)',
        position: 'relative', cursor: 'pointer', transition: '.2s',
      }}
    >
      <div style={{
        position: 'absolute', width: 13, height: 13,
        borderRadius: '50%', top: 3, transition: '.2s',
        right: checked ? 20 : 3,
        background: checked ? '#fff' : 'var(--text3)',
      }} />
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────
export function SH({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.7rem' }}>
      <div>
        <div style={{ fontSize: '.88rem', fontWeight: 800 }}>{title}</div>
        {sub && <div style={{ fontSize: '.7rem', color: 'var(--text2)', marginTop: '.1rem' }}>{sub}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}

// ─── Stars display ────────────────────────────────────────────────
export function Stars({ count = 0, max = 3 }) {
  return (
    <span style={{ color: 'var(--gold)', fontSize: '.82rem' }}>
      {'★'.repeat(count)}<span style={{ color: 'var(--text3)' }}>{'★'.repeat(max - count)}</span>
    </span>
  )
}

// ─── Pass Button Pair ─────────────────────────────────────────────
export function PassBtns({ value, onChange }) {
  const base = { flex: 1, padding: '.38rem', borderRadius: 'var(--rx)', border: '1px solid var(--border)', background: 'var(--card2)', fontSize: '.76rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: '.15s', textAlign: 'center' }
  return (
    <div style={{ display: 'flex', gap: '.4rem', marginTop: '.4rem' }}>
      <button onClick={() => onChange(true)}  style={{ ...base, ...(value === true  ? { background: 'rgba(34,197,94,.18)', borderColor: 'var(--green)', color: 'var(--green)' } : { color: 'var(--text2)' }) }}>✓ يُجاز</button>
      <button onClick={() => onChange(false)} style={{ ...base, ...(value === false ? { background: 'var(--rs)', borderColor: 'var(--red)', color: 'var(--red)' } : { color: 'var(--text2)' }) }}>✕ لا يُجاز</button>
    </div>
  )
}
