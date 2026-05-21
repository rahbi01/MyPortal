import { useState } from 'react'


export default function LoginScreen({ allUsers, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    setError('')

    if (!username.trim()) { setError('يرجى إدخال اسم المستخدم'); return }
    if (!password)        { setError('كلمة المرور لا يمكن أن تكون فارغة'); return }

    setLoading(true)
    setTimeout(() => {
      const user = (allUsers||[]).find(u => u.username === username.trim() && u.password === password)
      if (!user) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
        setLoading(false)
        return
      }
      if (user.suspended) {
        setError('حسابك موقوف — تواصل مع المشرف')
        setLoading(false)
        return
      }
      setLoading(false)
      onLogin(user)
    }, 600)
  }

  const inp = {
    width:'100%', background:'var(--card2)', border:'1px solid var(--border)',
    borderRadius:'var(--rs2)', padding:'.65rem .85rem', color:'var(--text)',
    fontFamily:'inherit', fontSize:'.92rem', outline:'none', transition:'border-color .18s',
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:'1.5rem', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      {/* glow */}
      <div style={{ position:'fixed', width:500, height:280, background:'radial-gradient(ellipse,rgba(34,197,94,.1),transparent 70%)', top:-80, left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }}/>

      {/* card */}
      <div style={{ width:'100%', maxWidth:380, background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--r)', padding:'2rem 1.75rem', boxShadow:'0 16px 48px rgba(0,0,0,.5)' }}>

        {/* logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:72, height:72, background:'linear-gradient(135deg,var(--green),var(--green2))', borderRadius:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto .85rem', boxShadow:'0 0 32px rgba(34,197,94,.22)' }}>📖</div>
          <h1 style={{ fontSize:'1.7rem', fontWeight:900, background:'linear-gradient(135deg,#fff 40%,var(--green))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:0 }}>أشبال القرآن</h1>
          <p style={{ color:'var(--text2)', fontSize:'.82rem', marginTop:'.3rem' }}>منصة تتبع الحفظ الذكية</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* username */}
          <div style={{ marginBottom:'.85rem' }}>
            <label style={{ fontSize:'.76rem', color:'var(--text2)', fontWeight:700, display:'block', marginBottom:'.3rem' }}>اسم المستخدم</label>
            <input
              value={username} onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="أدخل اسم المستخدم"
              autoComplete="username"
              onFocus={e => e.target.style.borderColor='rgba(34,197,94,.5)'}
              onBlur={e  => e.target.style.borderColor='var(--border)'}
              style={inp}
            />
          </div>

          {/* password */}
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ fontSize:'.76rem', color:'var(--text2)', fontWeight:700, display:'block', marginBottom:'.3rem' }}>كلمة المرور</label>
            <div style={{ position:'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="أدخل كلمة المرور"
                autoComplete="current-password"
                onFocus={e => e.target.style.borderColor='rgba(34,197,94,.5)'}
                onBlur={e  => e.target.style.borderColor='var(--border)'}
                style={{ ...inp, paddingLeft:'2.8rem' }}
              />
              <button type="button" onClick={() => setShowPass(v=>!v)} style={{ position:'absolute', left:'.7rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'1rem', padding:0, lineHeight:1 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* error */}
          {error && (
            <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'var(--rx)', padding:'.5rem .75rem', fontSize:'.78rem', color:'var(--red)', marginBottom:'.85rem', textAlign:'center' }}>
              ⚠️ {error}
            </div>
          )}

          {/* submit */}
          <button type="submit" disabled={loading} style={{
            width:'100%', padding:'.75rem', borderRadius:'var(--rs2)', border:'none',
            background: loading ? 'var(--card3)' : 'linear-gradient(135deg,var(--green),var(--green2))',
            color: loading ? 'var(--text3)' : '#fff',
            fontSize:'.92rem', fontWeight:800, cursor: loading ? 'default' : 'pointer',
            fontFamily:'inherit', transition:'all .18s',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(34,197,94,.25)',
          }}>
            {loading ? '⏳ جاري التحقق...' : '🔓 دخول'}
          </button>
        </form>

        {/* hint */}
        <div style={{ marginTop:'1.25rem', padding:'.75rem', background:'var(--card2)', borderRadius:'var(--rs2)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:'.7rem', color:'var(--text3)', fontWeight:700, marginBottom:'.4rem' }}>حسابات تجريبية:</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'.3rem' }}>
            {[['👤 طالب','yousef','1234'],['🎓 معلم','omar','omar123'],['⚙️ مشرف','admin','admin123']].map(([role,u,p]) => (
              <button key={u} type="button" onClick={() => { setUsername(u); setPassword(p); setError('') }} style={{
                background:'var(--card3)', border:'1px solid var(--border)', borderRadius:'var(--rx)',
                padding:'.4rem .3rem', fontSize:'.68rem', color:'var(--text2)', cursor:'pointer',
                fontFamily:'inherit', textAlign:'center', transition:'all .15s',
              }}>
                {role}<br/>
                <span style={{ color:'var(--text3)', fontSize:'.62rem' }}>{u}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
