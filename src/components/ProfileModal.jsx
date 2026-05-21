import { useState } from 'react'
import Modal from './Modal.jsx'
import Btn   from './Btn.jsx'

export default function ProfileModal({ open, user, onClose, onSave }) {
  const [phone,    setPhone]    = useState(user?.phone    || '')
  const [oldPass,  setOldPass]  = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [err,      setErr]      = useState('')
  const [showOld,  setShowOld]  = useState(false)
  const [showNew,  setShowNew]  = useState(false)

  const inp = {
    width:'100%', background:'var(--card2)', border:'1px solid var(--border)',
    borderRadius:'var(--rs2)', padding:'.55rem .8rem', color:'var(--text)',
    fontFamily:'inherit', fontSize:'.88rem', outline:'none',
  }

  function handleSave() {
    setErr('')
    const changes = {}

    // تحديث الهاتف
    changes.phone = phone.trim()

    // تحديث كلمة المرور إن طُلب
    if (oldPass || newPass) {
      if (!oldPass)          { setErr('أدخل كلمة المرور الحالية'); return }
      if (oldPass !== user.password) { setErr('كلمة المرور الحالية غير صحيحة'); return }
      if (!newPass)          { setErr('كلمة المرور الجديدة لا يمكن أن تكون فارغة'); return }
      changes.password = newPass
    }

    onSave(changes)
    setOldPass('')
    setNewPass('')
    setErr('')
  }

  if (!user) return null

  const roleLabel = user.role==='student'?'طالب':user.role==='teacher'?'معلم':'مشرف'

  return (
    <Modal open={open} onClose={() => { setErr(''); onClose() }} title="⚙️ إعدادات حسابي" maxWidth={400}>
      {/* معلومات ثابتة */}
      <div style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rs2)', padding:'.85rem', marginBottom:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--gs)', color:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'.95rem', flexShrink:0 }}>
            {user.avatar || user.name?.slice(0,2)}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:'.9rem' }}>{user.name}</div>
            <div style={{ fontSize:'.72rem', color:'var(--text2)', marginTop:'.1rem' }}>
              @{user.username} · {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* رقم الهاتف */}
      <div style={{ marginBottom:'.85rem' }}>
        <div style={{ fontSize:'.76rem', color:'var(--text2)', fontWeight:700, marginBottom:'.3rem' }}>رقم الجوال</div>
        <input
          value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="05xxxxxxxx"
          style={inp}
          onFocus={e => e.target.style.borderColor='rgba(34,197,94,.5)'}
          onBlur={e  => e.target.style.borderColor='var(--border)'}
        />
      </div>

      {/* تغيير كلمة المرور */}
      <div style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rs2)', padding:'.85rem', marginBottom:'.85rem' }}>
        <div style={{ fontSize:'.8rem', fontWeight:800, marginBottom:'.65rem' }}>🔒 تغيير كلمة المرور</div>

        <div style={{ marginBottom:'.55rem' }}>
          <div style={{ fontSize:'.74rem', color:'var(--text2)', fontWeight:700, marginBottom:'.28rem' }}>كلمة المرور الحالية</div>
          <div style={{ position:'relative' }}>
            <input
              type={showOld?'text':'password'} value={oldPass}
              onChange={e => { setOldPass(e.target.value); setErr('') }}
              placeholder="أدخل كلمة المرور الحالية"
              style={{...inp, paddingLeft:'2.5rem'}}
              onFocus={e => e.target.style.borderColor='rgba(34,197,94,.5)'}
              onBlur={e  => e.target.style.borderColor='var(--border)'}
            />
            <button type="button" onClick={() => setShowOld(v=>!v)} style={{ position:'absolute', left:'.65rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'.9rem' }}>
              {showOld?'🙈':'👁️'}
            </button>
          </div>
        </div>

        <div>
          <div style={{ fontSize:'.74rem', color:'var(--text2)', fontWeight:700, marginBottom:'.28rem' }}>كلمة المرور الجديدة</div>
          <div style={{ position:'relative' }}>
            <input
              type={showNew?'text':'password'} value={newPass}
              onChange={e => { setNewPass(e.target.value); setErr('') }}
              placeholder="أي كلمة مرور غير فارغة"
              style={{...inp, paddingLeft:'2.5rem'}}
              onFocus={e => e.target.style.borderColor='rgba(34,197,94,.5)'}
              onBlur={e  => e.target.style.borderColor='var(--border)'}
            />
            <button type="button" onClick={() => setShowNew(v=>!v)} style={{ position:'absolute', left:'.65rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'.9rem' }}>
              {showNew?'🙈':'👁️'}
            </button>
          </div>
          <div style={{ fontSize:'.68rem', color:'var(--text3)', marginTop:'.25rem' }}>
            تُقبل أي كلمة مرور بشرط ألا تكون فارغة
          </div>
        </div>
      </div>

      {err && (
        <div style={{ background:'var(--rs)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'var(--rx)', padding:'.45rem .75rem', fontSize:'.76rem', color:'var(--red)', marginBottom:'.75rem', textAlign:'center' }}>
          ⚠️ {err}
        </div>
      )}

      <div style={{ display:'flex', gap:'.5rem' }}>
        <Btn style={{ flex:1, justifyContent:'center' }} onClick={() => { setErr(''); setOldPass(''); setNewPass(''); onClose() }}>إلغاء</Btn>
        <Btn variant="p" style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>💾 حفظ التعديلات</Btn>
      </div>
    </Modal>
  )
}
