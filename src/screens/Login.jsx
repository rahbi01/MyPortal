export default function Login({ onLogin }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', width: 500, height: 300,
        background: 'radial-gradient(ellipse,rgba(34,197,94,.1),transparent 70%)',
        top: -80, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.2rem', animation: 'fadeUp .5s ease' }}>
        <div style={{
          width: 80, height: 80,
          background: 'linear-gradient(135deg,var(--green),var(--green2))',
          borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem', margin: '0 auto .9rem',
          boxShadow: '0 0 36px rgba(34,197,94,.25)',
        }}>📖</div>
        <h1 style={{
          fontSize: '2rem', fontWeight: 900, lineHeight: 1.2,
          background: 'linear-gradient(135deg,#fff 40%,var(--green))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>أشبال القرآن</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginTop: '.3rem' }}>منصة تتبع الحفظ الذكية</p>
      </div>

      {/* Role cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.75rem', width: '100%', maxWidth: 520, animation: 'fadeUp .5s ease .1s both' }}>
        {[
          { role: 'student', label: 'طالب',  icon: '👤', sub: 'تتبع حفظك وتقدمك',  color: 'var(--green)', bg: 'var(--gs)' },
          { role: 'teacher', label: 'معلم',  icon: '🎓', sub: 'تقييم ومتابعة الطلاب', color: 'var(--blue)',  bg: 'var(--bs)' },
          { role: 'admin',   label: 'مشرف', icon: '⚙️', sub: 'إدارة النظام',        color: 'var(--gold)',  bg: 'var(--golds)' },
        ].map(r => (
          <div
            key={r.role}
            onClick={() => onLogin(r.role)}
            style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', padding: '1.4rem .8rem', textAlign: 'center',
              cursor: 'pointer', transition: 'all .22s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: r.bg, color: r.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', margin: '0 auto .7rem',
            }}>{r.icon}</div>
            <h3 style={{ fontSize: '.95rem', fontWeight: 800, marginBottom: '.2rem' }}>{r.label}</h3>
            <p style={{ fontSize: '.72rem', color: 'var(--text2)' }}>{r.sub}</p>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1.3rem', color: 'var(--text3)', fontSize: '.78rem' }}>
        نموذج تجريبي — اضغط على دورك للدخول
      </p>
    </div>
  )
}
