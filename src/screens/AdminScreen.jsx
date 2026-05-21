import { useState, useEffect } from 'react'
import Avatar       from '../components/Avatar.jsx'
import Btn          from '../components/Btn.jsx'
import Modal        from '../components/Modal.jsx'
import ProfileModal from '../components/ProfileModal.jsx'

// ─── NAV ────────────────────────────────────────────────────────────
const NAV = [
  { id:'overview',  icon:'📊', label:'الإحصاء العام',   group:'الرئيسية' },
  { id:'students',  icon:'👤', label:'الطلاب',          group:'الأشخاص' },
  { id:'teachers',  icon:'🎓', label:'المعلمون',        group:'الأشخاص' },
  { id:'assign',    icon:'🔗', label:'الربط',           group:'الأشخاص' },
  { id:'missing',   icon:'⚠️', label:'المتخلفون',       group:'المتابعة', badge:5 },
  { id:'warnings',  icon:'🚨', label:'الإنذارات',       group:'المتابعة', badge:2 },
  { id:'reports',   icon:'📋', label:'التقارير',        group:'المتابعة' },
  { id:'pages',     icon:'📄', label:'صفحات الحفظ',    group:'النقاط والمكافآت' },
  { id:'points',    icon:'⭐', label:'النقاط',          group:'النقاط والمكافآت' },
  { id:'rewards',   icon:'🏆', label:'المكافآت',        group:'النقاط والمكافآت' },
  { id:'data',      icon:'💾', label:'البيانات',        group:'النظام' },
  { id:'admins',    icon:'🛡️', label:'المستخدمون',     group:'النظام' },
  { id:'sysconfig', icon:'⚙️', label:'إعدادات النظام', group:'النظام' },
]
const TITLES = Object.fromEntries(NAV.map(n => [n.id, `${n.icon} ${n.label}`]))
const GROUPS = [...new Set(NAV.map(n => n.group))]

// ─── مكوّنات مساعدة ─────────────────────────────────────────────────
function Tag({ label, color='g' }) {
  const C = { g:{bg:'var(--gs)',color:'var(--green)'}, b:{bg:'var(--bs)',color:'var(--blue)'}, o:{bg:'var(--golds)',color:'var(--gold)'}, r:{bg:'var(--rs)',color:'var(--red)'}, gray:{bg:'var(--card3)',color:'var(--text3)'} }
  const s = C[color]||C.gray
  return <span style={{ fontSize:'.66rem', padding:'.15rem .55rem', borderRadius:12, fontWeight:800, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>{label}</span>
}
function Sw({ checked, onChange }) {
  return (
    <label style={{ position:'relative', width:36, height:19, flexShrink:0, cursor:'pointer', display:'inline-block' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity:0, width:0, height:0 }}/>
      <span style={{ position:'absolute', inset:0, borderRadius:10, transition:'.2s', background: checked?'var(--green)':'var(--card3)' }}>
        <span style={{ position:'absolute', width:13, height:13, borderRadius:'50%', top:3, right:checked?20:3, transition:'.2s', background:checked?'#fff':'var(--text3)' }}/>
      </span>
    </label>
  )
}
function PBar({ pts, max }) {
  return (
    <div style={{ height:3, background:'var(--card3)', borderRadius:2, marginTop:'.3rem' }}>
      <div style={{ height:'100%', borderRadius:2, width:`${max?Math.round(pts/max*100):0}%`, background:'linear-gradient(90deg,var(--green),var(--green2))' }}/>
    </div>
  )
}
function FIn({ label, placeholder, type='text' }) {
  return (
    <div style={{ marginBottom:'.55rem' }}>
      {label && <div style={{ fontSize:'.72rem', color:'var(--text2)', marginBottom:'.25rem', fontWeight:700 }}>{label}</div>}
      <input type={type} placeholder={placeholder} style={{ width:'100%', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rx)', padding:'.48rem .7rem', color:'var(--text)', fontFamily:'inherit', fontSize:'.8rem' }}/>
    </div>
  )
}
function FF({ label, val, set, ph, type='text' }) {
  const s = { width:'100%', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rx)', padding:'.5rem .75rem', color:'var(--text)', fontFamily:'inherit', fontSize:'.84rem', marginBottom:'.6rem' }
  return (
    <div>
      <div style={{ fontSize:'.74rem', color:'var(--text2)', fontWeight:700, marginBottom:'.25rem' }}>{label}</div>
      <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={s}/>
    </div>
  )
}
const inpSt = { background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rx)', padding:'.42rem .65rem', color:'var(--text)', fontFamily:'inherit', fontSize:'.8rem', outline:'none', width:'100%' }

// ─── نماذج مستقلة بـ state داخلي ────────────────────────────────────
function EditUserModal({ open, user, onClose, onSave }) {
  const [name,setName]=useState(''); const [uname,setUname]=useState('')
  const [pass,setPass]=useState(''); const [phone,setPhone]=useState('')
  const [level,setLevel]=useState(''); const [perm,setPerm]=useState(false)
  const [superA,setSuperA]=useState(false); const [perms,setPerms]=useState({})
  const [err,setErr]=useState('')
  useEffect(() => {
    if (!user) return
    setName(user.name||''); setUname(user.username||''); setPass('')
    setPhone(user.phone||''); setLevel(user.level||'')
    setPerm(user.canViewMissing||false); setSuperA(user.isSuperAdmin||false)
    setPerms(user.perms||{}); setErr('')
  }, [user])
  function handle() {
    if (!name.trim()||!uname.trim()) { setErr('الاسم واسم المستخدم مطلوبان'); return }
    const ch = { name:name.trim(), username:uname.trim(), phone:phone.trim() }
    if (pass) ch.password = pass
    if (user?.role==='student') ch.level = level.trim()
    if (user?.role==='teacher') ch.canViewMissing = perm
    if (user?.role==='admin')   { ch.isSuperAdmin=superA; ch.perms=superA?{students:true,editStudents:true,teachers:true,editTeachers:true,reports:true,warnings:true,backup:true,restore:true}:perms }
    onSave(ch)
  }
  const pL=[['students','الطلاب (عرض)'],['editStudents','الطلاب (تعديل)'],['teachers','المعلمون (عرض)'],['editTeachers','المعلمون (تعديل)'],['reports','التقارير'],['warnings','الإنذارات'],['backup','نسخ احتياطي'],['restore','استعادة']]
  if (!user) return null
  return (
    <Modal open={open} onClose={onClose} title={`✏️ تعديل: ${user.name}`} maxWidth={420}>
      <FF label="الاسم *" val={name} set={setName} ph="الاسم الكامل"/>
      <FF label="اسم المستخدم *" val={uname} set={setUname} ph="username"/>
      <FF label="كلمة مرور جديدة (اتركها فارغة للإبقاء)" val={pass} set={setPass} ph="••••" type="password"/>
      <FF label="الجوال" val={phone} set={setPhone} ph="05xxxxxxxx"/>
      {user.role==='student' && <FF label="مستوى الحفظ" val={level} set={setLevel} ph="الجزء..."/>}
      {user.role==='teacher' && <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.82rem',cursor:'pointer',marginBottom:'.7rem'}}><input type="checkbox" checked={perm} onChange={e=>setPerm(e.target.checked)} style={{accentColor:'var(--green)',width:15,height:15}}/>صلاحية المشرف</label>}
      {user.role==='admin' && <>
        <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.82rem',cursor:'pointer',marginBottom:'.7rem'}}><input type="checkbox" checked={superA} onChange={e=>setSuperA(e.target.checked)} style={{accentColor:'var(--green)',width:15,height:15}}/>مدير عام</label>
        {!superA && <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.75rem',marginBottom:'.65rem'}}>{pL.map(([k,l])=><label key={k} style={{display:'flex',alignItems:'center',gap:'.45rem',fontSize:'.78rem',marginBottom:'.3rem',cursor:'pointer'}}><input type="checkbox" checked={!!perms[k]} onChange={e=>setPerms(p=>({...p,[k]:e.target.checked}))} style={{accentColor:'var(--green)',width:14,height:14}}/>{l}</label>)}</div>}
      </>}
      {err && <div style={{color:'var(--red)',fontSize:'.76rem',marginBottom:'.5rem'}}>⚠️ {err}</div>}
      <div style={{display:'flex',gap:'.5rem'}}><Btn style={{flex:1,justifyContent:'center'}} onClick={onClose}>إلغاء</Btn><Btn variant="p" style={{flex:1,justifyContent:'center'}} onClick={handle}>💾 حفظ</Btn></div>
    </Modal>
  )
}
function AddStudentModal({ open, onClose, onSave }) {
  const [name,setName]=useState(''); const [user,setUser]=useState(''); const [pass,setPass]=useState(''); const [phone,setPhone]=useState(''); const [level,setLevel]=useState(''); const [err,setErr]=useState('')
  function reset(){setName('');setUser('');setPass('');setPhone('');setLevel('');setErr('')}
  function handle(){
    if(!name.trim()||!user.trim()||!pass){setErr('الاسم واسم المستخدم وكلمة المرور مطلوبة');return}
    onSave({name:name.trim(),username:user.trim(),password:pass,phone:phone.trim(),level:level.trim()});reset()
  }
  return (<Modal open={open} onClose={()=>{reset();onClose()}} title="👤 إضافة طالب">
    <FF label="الاسم *" val={name} set={setName} ph="الاسم الكامل"/>
    <FF label="اسم المستخدم *" val={user} set={setUser} ph="username"/>
    <FF label="كلمة المرور *" val={pass} set={setPass} ph="كلمة مرور" type="password"/>
    <FF label="الجوال (اختياري)" val={phone} set={setPhone} ph="05xxxxxxxx"/>
    <FF label="مستوى الحفظ (اختياري)" val={level} set={setLevel} ph="الجزء العاشر..."/>
    {err&&<div style={{color:'var(--red)',fontSize:'.76rem',marginBottom:'.5rem'}}>⚠️ {err}</div>}
    <div style={{display:'flex',gap:'.5rem'}}><Btn style={{flex:1,justifyContent:'center'}} onClick={()=>{reset();onClose()}}>إلغاء</Btn><Btn variant="p" style={{flex:1,justifyContent:'center'}} onClick={handle}>💾 حفظ</Btn></div>
  </Modal>)
}
function AddTeacherModal({ open, onClose, onSave }) {
  const [name,setName]=useState(''); const [user,setUser]=useState(''); const [pass,setPass]=useState(''); const [phone,setPhone]=useState(''); const [perm,setPerm]=useState(false); const [err,setErr]=useState('')
  function reset(){setName('');setUser('');setPass('');setPhone('');setPerm(false);setErr('')}
  function handle(){
    if(!name.trim()||!user.trim()||!pass){setErr('الاسم واسم المستخدم وكلمة المرور مطلوبة');return}
    onSave({name:name.trim(),username:user.trim(),password:pass,phone:phone.trim(),canViewMissing:perm});reset()
  }
  return (<Modal open={open} onClose={()=>{reset();onClose()}} title="🎓 إضافة معلم">
    <FF label="الاسم *" val={name} set={setName} ph="الاسم الكامل"/>
    <FF label="اسم المستخدم *" val={user} set={setUser} ph="username"/>
    <FF label="كلمة المرور *" val={pass} set={setPass} ph="كلمة مرور" type="password"/>
    <FF label="الجوال (اختياري)" val={phone} set={setPhone} ph="05xxxxxxxx"/>
    <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.82rem',cursor:'pointer',marginBottom:'.7rem'}}><input type="checkbox" checked={perm} onChange={e=>setPerm(e.target.checked)} style={{accentColor:'var(--green)',width:15,height:15}}/>صلاحية المشرف</label>
    {err&&<div style={{color:'var(--red)',fontSize:'.76rem',marginBottom:'.5rem'}}>⚠️ {err}</div>}
    <div style={{display:'flex',gap:'.5rem'}}><Btn style={{flex:1,justifyContent:'center'}} onClick={()=>{reset();onClose()}}>إلغاء</Btn><Btn variant="p" style={{flex:1,justifyContent:'center'}} onClick={handle}>💾 حفظ</Btn></div>
  </Modal>)
}
function AddAdminModal({ open, onClose, onSave }) {
  const [name,setName]=useState(''); const [user,setUser]=useState(''); const [pass,setPass]=useState(''); const [superA,setSuperA]=useState(false); const [perms,setPerms]=useState({}); const [err,setErr]=useState('')
  function reset(){setName('');setUser('');setPass('');setSuperA(false);setPerms({});setErr('')}
  function handle(){
    if(!name.trim()||!user.trim()||!pass){setErr('جميع الحقول مطلوبة');return}
    onSave({name:name.trim(),username:user.trim(),password:pass,isSuperAdmin:superA,perms:superA?{students:true,editStudents:true,teachers:true,editTeachers:true,reports:true,warnings:true,backup:true,restore:true}:perms});reset()
  }
  const pL=[['students','الطلاب (عرض)'],['editStudents','الطلاب (تعديل)'],['teachers','المعلمون (عرض)'],['editTeachers','المعلمون (تعديل)'],['reports','التقارير'],['warnings','الإنذارات'],['backup','نسخ احتياطي'],['restore','استعادة']]
  return (<Modal open={open} onClose={()=>{reset();onClose()}} title="🛡️ إضافة مشرف">
    <FF label="الاسم *" val={name} set={setName} ph="الاسم الكامل"/>
    <FF label="اسم المستخدم *" val={user} set={setUser} ph="admin_user"/>
    <FF label="كلمة المرور *" val={pass} set={setPass} ph="كلمة مرور" type="password"/>
    <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.82rem',cursor:'pointer',marginBottom:'.7rem'}}><input type="checkbox" checked={superA} onChange={e=>setSuperA(e.target.checked)} style={{accentColor:'var(--green)',width:15,height:15}}/>مدير عام (جميع الصلاحيات)</label>
    {!superA&&<div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.75rem',marginBottom:'.65rem'}}>{pL.map(([k,l])=><label key={k} style={{display:'flex',alignItems:'center',gap:'.45rem',fontSize:'.78rem',marginBottom:'.3rem',cursor:'pointer'}}><input type="checkbox" checked={!!perms[k]} onChange={e=>setPerms(p=>({...p,[k]:e.target.checked}))} style={{accentColor:'var(--green)',width:14,height:14}}/>{l}</label>)}</div>}
    {err&&<div style={{color:'var(--red)',fontSize:'.76rem',marginBottom:'.5rem'}}>⚠️ {err}</div>}
    <div style={{display:'flex',gap:'.5rem'}}><Btn style={{flex:1,justifyContent:'center'}} onClick={()=>{reset();onClose()}}>إلغاء</Btn><Btn variant="p" style={{flex:1,justifyContent:'center'}} onClick={handle}>💾 حفظ</Btn></div>
  </Modal>)
}

// ─── المكوّن الرئيسي ─────────────────────────────────────────────────
export default function AdminScreen({
  currentUser, allUsers, plans, assignments, rewardRules, sysSettings,
  pointsCycles, pagesPeriods,
  onLogout, onUpdateUser, onUpdateUsers, onUpdatePlans,
  onUpdateAssignments, onUpdateSysSettings, onUpdateRewardRules,
  onUpdatePointsCycles, onUpdatePagesPeriods,
  onResetToDefaults, showToast,
}) {
  const [page,setPage]                   = useState('overview')
  const [confirmData,setConfirmData]     = useState(null)
  const [logData,setLogData]             = useState(null)
  const [editingUser,setEditingUser]     = useState(null)
  const [showProfile,setShowProfile]     = useState(false)
  const [showAddStu,setShowAddStu]       = useState(false)
  const [showAddTea,setShowAddTea]       = useState(false)
  const [showAddAdm,setShowAddAdm]       = useState(false)
  const [showAddRule,setShowAddRule]     = useState(false)
  const [reportVis,setReportVis]         = useState(false)
  const [phasePlan,setPhasePlan]         = useState(true)
  const [dlInput,setDlInput]             = useState(String(sysSettings?.reportDeadlineHour??8))
  const [selTeacher,setSelTeacher]       = useState(null)
  const [pendStu,setPendStu]             = useState([])
  // Points page state
  const [viewArchive,setViewArchive]     = useState(false)
  const [showArchived,setShowArchived]   = useState(null)
  // Pages period state
  const [viewPeriodId,setViewPeriodId]   = useState(null)
  const [showAddPeriod,setShowAddPeriod] = useState(false)
  const [newPName,setNewPName]           = useState('')
  const [newPStart,setNewPStart]         = useState('')
  const [newPEnd,setNewPEnd]             = useState('')
  const [editPages,setEditPages]         = useState({})

  const users     = allUsers   || []
  const rules     = rewardRules|| []
  const asgn      = assignments|| {}
  const cycles    = pointsCycles|| []
  const periods   = pagesPeriods|| []
  const dlHour    = sysSettings?.reportDeadlineHour??8
  const students  = users.filter(u=>u.role==='student')
  const teachers  = users.filter(u=>u.role==='teacher')
  const admins    = users.filter(u=>u.role==='admin')

  function goPage(id){setPage(id);setReportVis(false)}
  function confirm2(title,msg,cb){setConfirmData({title,msg,cb})}

  // ── helpers ──────────────────────────────────────────────────────
  function calcCyclePoints(cycle) {
    if (!cycle) return []
    const cs = new Date(cycle.startDate)
    return students.map(stu => {
      const sp = (plans||[]).filter(p=>p.studentId===stu.id&&p.evaluation&&new Date(p.evaluation.date||p.startDate)>=cs).slice(0,cycle.planLimit)
      const total = sp.reduce((s,p)=>s+(p.evaluation?.points||0),0)
      const logs  = sp.map(p=>({type:p.type,date:p.evaluation?.date||p.startDate,pts:p.evaluation?.points||0}))
      return {studentId:stu.id,name:stu.name,avatar:stu.avatar,color:stu.color,total,plansCount:sp.length,planLimit:cycle.planLimit,logs}
    }).sort((a,b)=>b.total-a.total)
  }

  function calcReward(pages,phaseScore,phasePass) {
    if (!phasePass||!pages||pages<=0) return 0
    const rule = rules.find(r=>r.active)
    if (!rule) return 0
    const slab = rule.slabs.find(sl=>phaseScore>=sl.min&&phaseScore<=sl.max)
    return slab ? pages*slab.rate : 0
  }

  const activeCycle   = cycles.find(c=>!c.archived)||null
  const cyclePoints   = calcCyclePoints(activeCycle)
  const maxCyclePts   = cyclePoints[0]?.total||1

  const activePeriod  = periods.find(p=>!p.archived)||null
  const effPeriodId   = viewPeriodId || activePeriod?.id
  const currentPeriod = periods.find(p=>p.id===effPeriodId)||activePeriod

  // ── Sidebar ──────────────────────────────────────────────────────
  const Sidebar = (
    <div style={{width:200,background:'var(--bg2)',borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',flexShrink:0}}>
      <div style={{padding:'1rem .85rem .75rem',borderBottom:'1px solid var(--border)'}}>
        <div style={{fontWeight:900,fontSize:'.95rem',marginBottom:'.3rem'}}>⚙️ أشبال القرآن</div>
        <div onClick={()=>setShowProfile(true)} style={{fontSize:'.68rem',color:'var(--text2)',cursor:'pointer'}}>🛡️ {currentUser?.name} ⚙️</div>
      </div>
      <nav style={{flex:1,padding:'.6rem .5rem',overflowY:'auto'}}>
        {GROUPS.map(group=>(
          <div key={group}>
            <div style={{fontSize:'.6rem',fontWeight:800,color:'var(--text3)',letterSpacing:'.08em',padding:'.5rem .4rem .25rem',marginTop:'.3rem'}}>{group}</div>
            {NAV.filter(n=>n.group===group).map(item=>(
              <div key={item.id} onClick={()=>goPage(item.id)} style={{display:'flex',alignItems:'center',gap:'.55rem',padding:'.52rem .65rem',borderRadius:'var(--rx)',cursor:'pointer',fontSize:'.8rem',fontWeight:700,color:page===item.id?'var(--green)':'var(--text2)',background:page===item.id?'var(--gs)':'transparent',marginBottom:'.08rem'}}>
                <span style={{width:18,textAlign:'center',flexShrink:0}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {item.badge&&<span style={{fontSize:'.6rem',background:'var(--red)',color:'#fff',borderRadius:20,padding:'.05rem .4rem',fontWeight:800}}>{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:'.75rem .7rem',borderTop:'1px solid var(--border)'}}>
        <button onClick={onLogout} style={{width:'100%',background:'var(--rs)',color:'var(--red)',border:'1px solid rgba(239,68,68,.2)',borderRadius:'var(--rx)',padding:'.45rem',fontSize:'.76rem',fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>خروج ←</button>
      </div>
    </div>
  )

  // ── صفحة الإحصاء ────────────────────────────────────────────────
  const PageOverview = (
    <>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'.6rem',marginBottom:'.8rem'}}>
        {[['48','طالب نشط','var(--green)'],['6','معلم','var(--blue)'],['87%','الالتزام','var(--gold)'],['5','متخلفون','var(--red)']].map(([n,l,c])=>(
          <div key={l} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.9rem 1rem'}}>
            <div style={{fontSize:'1.8rem',fontWeight:900,color:c,lineHeight:1}}>{n}</div>
            <div style={{fontSize:'.7rem',color:'var(--text2)',marginTop:'.2rem'}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'1.1rem',marginBottom:'.75rem'}}>
        <div style={{fontSize:'.9rem',fontWeight:800,marginBottom:'.7rem'}}>🏆 أفضل الطلاب</div>
        {cyclePoints.slice(0,3).map((d,i)=>(
          <div key={d.studentId} onClick={()=>setLogData(d)} style={{display:'flex',alignItems:'center',gap:'.6rem',background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.7rem .85rem',marginBottom:'.4rem',cursor:'pointer'}}>
            <div style={{width:28,textAlign:'center'}}>{['🥇','🥈','🥉'][i]}</div>
            <div style={{flex:1}}><div style={{fontSize:'.82rem',fontWeight:700}}>{d.name}</div><PBar pts={d.total} max={maxCyclePts}/></div>
            <div style={{fontSize:'1.1rem',fontWeight:900,color:'var(--green)'}}>{d.total}</div>
          </div>
        ))}
      </div>
    </>
  )

  // ── صفحة الطلاب ─────────────────────────────────────────────────
  const PageStudents = students.map(s=>(
    <div key={s.id} style={{display:'flex',alignItems:'center',gap:'.6rem',background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.75rem .9rem',marginBottom:'.4rem'}}>
      <Avatar text={s.avatar} color={s.color} size={36}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'.82rem',fontWeight:700}}>{s.name}</div>
        <div style={{fontSize:'.68rem',color:'var(--text2)',marginTop:'.1rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>@{s.username} · {s.level}{s.phone?` · ${s.phone}`:''}
          {s.suspended&&<span style={{color:'var(--red)'}}> · موقوف</span>}
        </div>
      </div>
      <div style={{display:'flex',gap:'.3rem'}}>
        <Btn size="sm" onClick={()=>setEditingUser(s)}>تعديل</Btn>
        <Btn variant="d" size="sm" onClick={()=>confirm2('حذف الطالب؟',`حذف ${s.name}`,()=>{onUpdateUsers(p=>p.filter(u=>u.id!==s.id));showToast('🗑️ تم الحذف','ok')})}>حذف</Btn>
      </div>
    </div>
  ))

  // ── صفحة المعلمين ────────────────────────────────────────────────
  const PageTeachers = teachers.map(t=>(
    <div key={t.id} style={{display:'flex',alignItems:'center',gap:'.6rem',background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.75rem .9rem',marginBottom:'.4rem'}}>
      <Avatar text={t.avatar} color={t.color} size={36}/>
      <div style={{flex:1}}>
        <div style={{fontSize:'.82rem',fontWeight:700}}>{t.name}</div>
        <div style={{fontSize:'.68rem',marginTop:'.1rem',color:t.canViewMissing?'var(--gold)':'var(--text2)'}}>{t.canViewMissing?'🔶 صلاحية المشرف':'صلاحية المشرف: غير مفعّلة'}</div>
      </div>
      <div style={{display:'flex',gap:'.3rem'}}>
        <Btn size="sm" onClick={()=>{onUpdateUsers(p=>p.map(u=>u.id===t.id?{...u,canViewMissing:!u.canViewMissing}:u));showToast('🔄 تم')}}>
          {t.canViewMissing?'تعطيل':'تفعيل'}
        </Btn>
        <Btn size="sm" onClick={()=>setEditingUser(t)}>تعديل</Btn>
        <Btn variant="d" size="sm" onClick={()=>confirm2('حذف المعلم؟',`حذف ${t.name}`,()=>{onUpdateUsers(p=>p.filter(u=>u.id!==t.id));showToast('🗑️ تم')})} >حذف</Btn>
      </div>
    </div>
  ))

  // ── صفحة الربط ──────────────────────────────────────────────────
  const PageAssign = (
    <>
      <div style={{marginBottom:'.85rem'}}>
        <div style={{fontSize:'.78rem',color:'var(--text2)',fontWeight:700,marginBottom:'.45rem'}}>اختر المعلم</div>
        {teachers.map(t=>{const sel=selTeacher===t.id; return (
          <div key={t.id} onClick={()=>{setSelTeacher(t.id);setPendStu([...(asgn[t.id]||[])])}} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.65rem .85rem',borderRadius:'var(--rs2)',marginBottom:'.35rem',border:`2px solid ${sel?'var(--green)':'var(--border)'}`,background:sel?'var(--gs)':'var(--card2)',cursor:'pointer'}}>
            <Avatar text={t.avatar} color={t.color} size={34}/>
            <div style={{flex:1}}>
              <div style={{fontSize:'.84rem',fontWeight:700,color:sel?'var(--green)':'var(--text)'}}>{t.name}</div>
              <div style={{fontSize:'.68rem',color:'var(--text2)'}}>{(asgn[t.id]||[]).length?`${(asgn[t.id]||[]).length} طالب مرتبط`:'لا يوجد'}</div>
            </div>
            {sel&&<span style={{color:'var(--green)',fontWeight:900}}>✓</span>}
          </div>
        )})}
      </div>
      {selTeacher&&(
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'1rem',marginBottom:'.75rem'}}>
          <div style={{fontSize:'.82rem',fontWeight:800,marginBottom:'.65rem'}}>طلاب {teachers.find(t=>t.id===selTeacher)?.name}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.4rem',marginBottom:'.8rem'}}>
            {students.map(s=>{const chk=pendStu.includes(s.id); return (
              <div key={s.id} onClick={()=>setPendStu(p=>p.includes(s.id)?p.filter(id=>id!==s.id):[...p,s.id])} style={{display:'flex',alignItems:'center',gap:'.55rem',padding:'.55rem .75rem',borderRadius:'var(--rs2)',border:`1px solid ${chk?'rgba(34,197,94,.3)':'var(--border)'}`,background:chk?'rgba(34,197,94,.07)':'var(--card2)',cursor:'pointer'}}>
                <div style={{width:18,height:18,borderRadius:4,flexShrink:0,border:`2px solid ${chk?'var(--green)':'var(--border2)'}`,background:chk?'var(--green)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.72rem',color:'#fff'}}>{chk?'✓':''}</div>
                <Avatar text={s.avatar} color={s.color} size={26}/>
                <span style={{fontSize:'.8rem',fontWeight:700,color:chk?'var(--green)':'var(--text)'}}>{s.name}</span>
              </div>
            )})}
          </div>
          <div style={{display:'flex',gap:'.5rem'}}>
            <Btn style={{flex:1,justifyContent:'center'}} onClick={()=>{setSelTeacher(null);setPendStu([])}}>إلغاء</Btn>
            <Btn variant="p" style={{flex:1,justifyContent:'center'}} onClick={()=>{onUpdateAssignments(p=>({...p,[selTeacher]:[...pendStu]}));setSelTeacher(null);setPendStu([]);showToast('✅ تم حفظ الارتباطات','ok')}}>💾 حفظ</Btn>
          </div>
        </div>
      )}
    </>
  )

  // ── المتخلفون ────────────────────────────────────────────────────
  const DAYS_AR_FULL = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
  const today = new Date(); const todayDay = today.getDay()
  const weekDays = Array.from({length:todayDay+1},(_,i)=>i)
  const reportMatrix = students.map(stu=>{
    const now=new Date();now.setHours(0,0,0,0)
    const stuPlan=(plans||[]).find(p=>{
      if(p.studentId!==stu.id)return false
      const s=new Date(p.startDate);s.setHours(0,0,0,0)
      const e=new Date(s);e.setDate(e.getDate()+6)
      return now>=s&&now<=e
    })
    let teacherName='—'
    for(const[tid,sids]of Object.entries(asgn)){if(sids.includes(stu.id)){const t=teachers.find(t=>t.id===Number(tid));if(t)teacherName=t.name;break}}
    const reported=stuPlan?Object.keys(stuPlan.dailyReports||{}).map(Number):[]
    const dayStatus=weekDays.map(d=>({day:d,name:DAYS_AR_FULL[d],sent:reported.includes(d),hasPlan:!!stuPlan}))
    const missingDays=dayStatus.filter(d=>d.hasPlan&&!d.sent&&d.day!==6).length
    return {stu,teacherName,dayStatus,missingDays,hasPlan:!!stuPlan}
  })
  const PageMissing = (
    <>
      <div style={{background:'rgba(59,130,246,.07)',border:'1px solid rgba(59,130,246,.15)',borderRadius:'var(--rs2)',padding:'.65rem .9rem',marginBottom:'.85rem',fontSize:'.76rem',color:'var(--blue)',lineHeight:1.6}}>
        📋 من الأحد حتى {DAYS_AR_FULL[todayDay]} — الأسبوع الحالي
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.76rem',minWidth:400}}>
          <thead>
            <tr style={{background:'var(--card3)'}}>
              <th style={{textAlign:'right',padding:'.5rem .75rem',fontWeight:700,color:'var(--text2)',borderBottom:'1px solid var(--border)'}}>الطالب</th>
              <th style={{padding:'.5rem .5rem',fontWeight:700,color:'var(--text2)',borderBottom:'1px solid var(--border)'}}>المعلم</th>
              {weekDays.map(d=><th key={d} style={{padding:'.5rem .4rem',fontWeight:700,borderBottom:'1px solid var(--border)',color:d===todayDay?'var(--green)':'var(--text2)',textAlign:'center'}}>{DAYS_AR_FULL[d].slice(0,3)}</th>)}
              <th style={{padding:'.5rem .5rem',fontWeight:700,color:'var(--text2)',borderBottom:'1px solid var(--border)',textAlign:'center'}}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {reportMatrix.map(({stu,teacherName,dayStatus,missingDays,hasPlan})=>(
              <tr key={stu.id} style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'.55rem .75rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <Avatar text={stu.avatar} color={stu.color} size={28}/>
                    <span style={{fontWeight:700,fontSize:'.8rem'}}>{stu.name}</span>
                  </div>
                </td>
                <td style={{padding:'.55rem .5rem',color:'var(--text2)',fontSize:'.72rem',whiteSpace:'nowrap'}}>{teacherName}</td>
                {dayStatus.map(d=>(
                  <td key={d.day} style={{padding:'.55rem .4rem',textAlign:'center'}}>
                    {!hasPlan?<span style={{color:'var(--text3)'}}>—</span>:d.day===6?<span style={{color:'var(--text3)',fontSize:'.72rem'}}>تقييم</span>:d.sent?<span style={{color:'var(--green)'}}>✓</span>:<span style={{color:'var(--red)'}}>✕</span>}
                  </td>
                ))}
                <td style={{padding:'.55rem .5rem',textAlign:'center'}}>
                  {!hasPlan?<Tag label="بدون مقرر" color="gray"/>:missingDays===0?<Tag label="ملتزم ✓" color="g"/>:missingDays<=1?<Tag label={`غاب ${missingDays}`} color="o"/>:<Tag label={`غاب ${missingDays}`} color="r"/>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.5rem',marginTop:'.85rem'}}>
        {[[reportMatrix.filter(r=>r.hasPlan&&r.missingDays===0).length,'ملتزمون','var(--green)'],[reportMatrix.filter(r=>r.hasPlan&&r.missingDays===1).length,'غياب خفيف','var(--gold)'],[reportMatrix.filter(r=>r.hasPlan&&r.missingDays>1).length,'غياب متكرر','var(--red)']].map(([n,l,c])=>(
          <div key={l} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.75rem',textAlign:'center'}}>
            <div style={{fontSize:'1.6rem',fontWeight:900,color:c,lineHeight:1}}>{n}</div>
            <div style={{fontSize:'.7rem',color:'var(--text2)',marginTop:'.2rem'}}>{l}</div>
          </div>
        ))}
      </div>
    </>
  )

  // ── الإنذارات ────────────────────────────────────────────────────
  const PageWarnings = (
    <>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.5rem',marginBottom:'.75rem'}}>
        {[[students.length,'إجمالي','var(--text)'],[students.filter(s=>!s.suspended&&!s.warned).length,'نشطون','var(--green)'],[students.filter(s=>(s.warned||0)>0&&!s.suspended).length,'لديهم إنذارات','var(--gold)'],[students.filter(s=>s.suspended).length,'موقوفون','var(--red)']].map(([n,l,c])=>(
          <div key={l} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.8rem .6rem',textAlign:'center'}}>
            <div style={{fontSize:'1.6rem',fontWeight:900,color:c,lineHeight:1}}>{n}</div>
            <div style={{fontSize:'.66rem',color:'var(--text2)',marginTop:'.2rem'}}>{l}</div>
          </div>
        ))}
      </div>
      {students.map(s=>{
        const w=s.warned||0; const isSusp=s.suspended
        const bc=isSusp?'rgba(239,68,68,.28)':w===2?'rgba(245,158,11,.32)':w===1?'rgba(245,158,11,.18)':'var(--border)'
        return (
          <div key={s.id} style={{background:isSusp?'rgba(239,68,68,.03)':'var(--card2)',border:`1px solid ${bc}`,borderRadius:'var(--rs2)',padding:'.85rem',marginBottom:'.45rem'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.55rem'}}>
              <div>
                <div style={{fontSize:'.84rem',fontWeight:700}}>{s.name}</div>
                <div style={{fontSize:'.68rem',marginTop:'.1rem',color:isSusp?'var(--red)':w>0?'var(--gold)':'var(--green)'}}>{isSusp?'🚫 موقوف':w===0?'● نشط':`⚠️ ${w===1?'إنذار':'إنذاران'}`}</div>
              </div>
              <div style={{display:'flex',gap:'.18rem',fontSize:'.95rem'}}>
                {[1,2,3].map(i=><span key={i} style={{color:i<=w?'var(--gold)':'var(--text3)'}}>{i<=w?'★':'☆'}</span>)}
                <span style={{fontSize:'.68rem',color:'var(--text3)',marginRight:'.3rem'}}>{w}/3</span>
              </div>
            </div>
            <div style={{display:'flex',gap:'.35rem',flexWrap:'wrap'}}>
              <Btn size="sm" disabled={isSusp} onClick={()=>{onUpdateUsers(p=>p.map(u=>u.id===s.id?{...u,warned:Math.min((u.warned||0)+1,3),suspended:(u.warned||0)+1>=3}:u));showToast('تم','ok')}}>+ إنذار</Btn>
              <Btn size="sm" disabled={w===0&&!isSusp} onClick={()=>{onUpdateUsers(p=>p.map(u=>u.id===s.id?{...u,warned:0,suspended:false}:u));showToast('تم','ok')}}>إعادة تعيين</Btn>
              {!isSusp?<Btn variant="d" size="sm" disabled={w<2} onClick={()=>confirm2('إيقاف الطالب؟',`إيقاف ${s.name}`,()=>onUpdateUsers(p=>p.map(u=>u.id===s.id?{...u,suspended:true,warned:3}:u)))}>وقف</Btn>:<Btn variant="p" size="sm" onClick={()=>{onUpdateUsers(p=>p.map(u=>u.id===s.id?{...u,suspended:false,warned:0}:u));showToast('تم رفع الوقف','ok')}}>رفع الوقف</Btn>}
            </div>
          </div>
        )
      })}
    </>
  )

  // ── التقارير ─────────────────────────────────────────────────────
  const PageReports = (
    <>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'.85rem',marginBottom:'.75rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem',marginBottom:'.65rem'}}>
          <FIn label="من تاريخ" type="date"/><FIn label="إلى تاريخ" type="date"/>
        </div>
        <Btn variant="p" style={{width:'100%',justifyContent:'center'}} onClick={()=>setReportVis(true)}>🔍 عرض التقرير</Btn>
      </div>
      {reportVis&&(
        <div style={{overflowX:'auto',border:'1px solid var(--border)',borderRadius:'var(--rs2)'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.76rem'}}>
            <thead><tr>{['الطالب','المقررات','مُقيَّمة','غير مُقيَّمة','أيام غياب','متوسط'].map(h=><th key={h} style={{textAlign:'right',padding:'.45rem .65rem',background:'var(--card3)',color:'var(--text2)',fontWeight:700,borderBottom:'1px solid var(--border)'}}>{h}</th>)}</tr></thead>
            <tbody>
              {students.map(s=>{
                const sp=(plans||[]).filter(p=>p.studentId===s.id)
                const ev=sp.filter(p=>p.evaluation)
                const uev=sp.filter(p=>!p.evaluation&&new Date(p.startDate)<today)
                const avgRaw=ev.length?Math.round(ev.reduce((sum,p)=>{const e=p.evaluation;return sum+(p.type==='حفظ'?((e.newScore||0)+(e.recentScore||0)+(e.oldScore||0)):p.type==='سرد'?(e.revScore||0):(e.phaseScore||0))},0)/ev.length):0
                const col=avgRaw>=80?'var(--green)':avgRaw>=60?'var(--gold)':'var(--red)'
                return <tr key={s.id}><td style={{padding:'.5rem .65rem',borderBottom:'1px solid var(--border)',fontWeight:600}}>{s.name}</td><td style={{padding:'.5rem .65rem',borderBottom:'1px solid var(--border)',textAlign:'center'}}>{sp.length}</td><td style={{padding:'.5rem .65rem',borderBottom:'1px solid var(--border)',textAlign:'center'}}>{ev.length}</td><td style={{padding:'.5rem .65rem',borderBottom:'1px solid var(--border)',textAlign:'center'}}>{uev.length}</td><td style={{padding:'.5rem .65rem',borderBottom:'1px solid var(--border)',textAlign:'center'}}>{reportMatrix.find(r=>r.stu.id===s.id)?.missingDays||0}</td><td style={{padding:'.5rem .65rem',borderBottom:'1px solid var(--border)',textAlign:'center'}}><span style={{color:col,fontWeight:800}}>{ev.length?avgRaw:'—'}</span></td></tr>
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )

  // ── صفحات الحفظ ─────────────────────────────────────────────────
  const PagePages = (
    <>
      <div style={{display:'flex',gap:'.4rem',overflowX:'auto',paddingBottom:'.3rem',marginBottom:'.85rem'}}>
        {periods.map(p=>(
          <button key={p.id} onClick={()=>setViewPeriodId(p.id)} style={{flexShrink:0,padding:'.38rem .85rem',borderRadius:'var(--rs2)',border:`2px solid ${effPeriodId===p.id?'var(--green)':'var(--border)'}`,background:effPeriodId===p.id?'var(--gs)':'var(--card2)',color:effPeriodId===p.id?'var(--green)':'var(--text2)',fontSize:'.76rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            {p.name} {p.archived?'📦':'🟢'}
          </button>
        ))}
        <button onClick={()=>setShowAddPeriod(v=>!v)} style={{flexShrink:0,padding:'.38rem .85rem',borderRadius:'var(--rs2)',border:'1px dashed var(--border)',background:'transparent',color:'var(--text3)',fontSize:'.76rem',cursor:'pointer',fontFamily:'inherit'}}>+ فترة جديدة</button>
      </div>

      {showAddPeriod&&(
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'1rem',marginBottom:'.85rem'}}>
          <div style={{fontSize:'.84rem',fontWeight:800,marginBottom:'.65rem'}}>➕ فترة جديدة</div>
          <div style={{marginBottom:'.5rem'}}>
            <div style={{fontSize:'.72rem',color:'var(--text2)',fontWeight:700,marginBottom:'.25rem'}}>اسم الفترة *</div>
            <input value={newPName} onChange={e=>setNewPName(e.target.value)} placeholder="مثال: الفترة الثالثة" style={{...inpSt}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem',marginBottom:'.65rem'}}>
            <div><div style={{fontSize:'.72rem',color:'var(--text2)',fontWeight:700,marginBottom:'.25rem'}}>من تاريخ *</div><input type="date" value={newPStart} onChange={e=>setNewPStart(e.target.value)} style={{...inpSt}}/></div>
            <div><div style={{fontSize:'.72rem',color:'var(--text2)',fontWeight:700,marginBottom:'.25rem'}}>إلى تاريخ (اختياري)</div><input type="date" value={newPEnd} onChange={e=>setNewPEnd(e.target.value)} style={{...inpSt}}/></div>
          </div>
          <div style={{display:'flex',gap:'.5rem'}}>
            <Btn style={{flex:1,justifyContent:'center'}} onClick={()=>setShowAddPeriod(false)}>إلغاء</Btn>
            <Btn variant="p" style={{flex:1,justifyContent:'center'}} onClick={()=>{
              if(!newPName.trim()||!newPStart){showToast('⚠️ الاسم والتاريخ مطلوبان','warn');return}
              const id=Math.max(...periods.map(p=>p.id),0)+1
              onUpdatePagesPeriods(p=>[...p,{id,name:newPName.trim(),startDate:newPStart,endDate:newPEnd||null,archived:false,studentPages:{}}])
              setNewPName('');setNewPStart('');setNewPEnd('');setShowAddPeriod(false)
              showToast('✅ تم فتح فترة جديدة','ok')
            }}>💾 إنشاء</Btn>
          </div>
        </div>
      )}

      {currentPeriod&&(
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.75rem'}}>
            <div>
              <div style={{fontSize:'.9rem',fontWeight:800}}>{currentPeriod.name}</div>
              <div style={{fontSize:'.72rem',color:'var(--text2)',marginTop:'.1rem'}}>
                {currentPeriod.startDate} {currentPeriod.endDate?`← ${currentPeriod.endDate}`:'← مفتوحة'} · القاعدة: {rules.find(r=>r.active)?.name||'لا توجد'}
              </div>
            </div>
            {!currentPeriod.archived&&(
              <Btn size="sm" onClick={()=>confirm2('أرشفة الفترة؟','ستُغلق الفترة ولا يمكن التعديل بعدها.',()=>{onUpdatePagesPeriods(p=>p.map(x=>x.id===currentPeriod.id?{...x,archived:true,endDate:new Date().toISOString().slice(0,10)}:x));showToast('✅ تم الأرشفة','ok')})}>📦 أرشفة</Btn>
            )}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 65px 75px 65px 85px 80px',gap:'.35rem',padding:'.4rem .75rem',background:'var(--card3)',borderRadius:'var(--rs2)',marginBottom:'.4rem',fontSize:'.68rem',color:'var(--text2)',fontWeight:700}}>
            <span>الطالب</span><span style={{textAlign:'center'}}>الصفحات</span><span style={{textAlign:'center'}}>تقييم/100</span><span style={{textAlign:'center'}}>يُجاز</span><span style={{textAlign:'center'}}>المكافأة</span><span style={{textAlign:'center'}}>إجراء</span>
          </div>

          {students.map(s=>{
            const saved=currentPeriod.studentPages?.[s.id]||{}
            const isEditing=s.id in editPages
            const entry=isEditing?editPages[s.id]:saved
            const reward=calcReward(Number(entry.pages||0),Number(entry.phaseScore||0),!!entry.phasePass)
            const hasData=saved.pages!==undefined
            return (
              <div key={s.id} style={{display:'grid',gridTemplateColumns:'1fr 65px 75px 65px 85px 80px',gap:'.35rem',alignItems:'center',background:'var(--card2)',border:`1px solid ${hasData?'rgba(34,197,94,.15)':'var(--border)'}`,borderRadius:'var(--rs2)',padding:'.5rem .75rem',marginBottom:'.35rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'.45rem'}}>
                  <Avatar text={s.avatar} color={s.color} size={28}/>
                  <div style={{fontSize:'.78rem',fontWeight:700}}>{s.name}</div>
                </div>
                <div style={{textAlign:'center'}}>
                  {!currentPeriod.archived
                    ?<input type="number" min="0" value={entry.pages??''} onChange={e=>setEditPages(p=>({...p,[s.id]:{...(p[s.id]||saved),pages:e.target.value}}))} onFocus={()=>!isEditing&&setEditPages(p=>({...p,[s.id]:{...saved}}))} style={{...inpSt,width:55,textAlign:'center',padding:'.3rem .3rem'}}/>
                    :<span style={{fontSize:'1rem',fontWeight:900,color:'var(--green)'}}>{saved.pages||'—'}</span>
                  }
                </div>
                <div style={{textAlign:'center'}}>
                  {!currentPeriod.archived
                    ?<input type="number" min="0" max="100" value={entry.phaseScore??''} onChange={e=>setEditPages(p=>({...p,[s.id]:{...(p[s.id]||saved),phaseScore:e.target.value}}))} onFocus={()=>!isEditing&&setEditPages(p=>({...p,[s.id]:{...saved}}))} style={{...inpSt,width:65,textAlign:'center',padding:'.3rem .3rem'}}/>
                    :<span style={{fontSize:'.9rem',fontWeight:800,color:saved.phaseScore>=80?'var(--green)':saved.phaseScore>=60?'var(--gold)':'var(--red)'}}>{saved.phaseScore??'—'}</span>
                  }
                </div>
                <div style={{textAlign:'center'}}>
                  {!currentPeriod.archived
                    ?<input type="checkbox" checked={!!entry.phasePass} onChange={e=>{setEditPages(p=>({...p,[s.id]:{...(p[s.id]||saved),phasePass:e.target.checked}}))}} style={{width:16,height:16,accentColor:'var(--green)',cursor:'pointer'}}/>
                    :<span style={{fontSize:'1rem'}}>{saved.phasePass?'✓':'✕'}</span>
                  }
                </div>
                <div style={{textAlign:'center',fontSize:'.84rem',fontWeight:900,color:reward>0?'var(--gold)':'var(--text3)'}}>{reward>0?`${reward} ر.س`:'—'}</div>
                <div style={{textAlign:'center'}}>
                  {!currentPeriod.archived&&(
                    isEditing
                      ?<Btn variant="p" size="sm" onClick={()=>{
                          onUpdatePagesPeriods(p=>p.map(x=>x.id===currentPeriod.id?{...x,studentPages:{...x.studentPages,[s.id]:{pages:Number(entry.pages||0),phaseScore:Number(entry.phaseScore||0),phasePass:!!entry.phasePass}}}:x))
                          setEditPages(p=>{const n={...p};delete n[s.id];return n})
                          showToast('✅ تم الحفظ','ok')
                        }}>حفظ</Btn>
                      :<Btn size="sm" onClick={()=>setEditPages(p=>({...p,[s.id]:{...saved}}))}>تعديل</Btn>
                  )}
                  {currentPeriod.archived&&<span style={{fontSize:'.68rem',color:'var(--text3)'}}>مؤرشف</span>}
                </div>
              </div>
            )
          })}

          {Object.keys(currentPeriod.studentPages||{}).length>0&&(
            <div style={{background:'var(--golds)',border:'1px solid rgba(245,158,11,.2)',borderRadius:'var(--rs2)',padding:'.75rem 1rem',marginTop:'.65rem'}}>
              <div style={{fontSize:'.8rem',fontWeight:800,color:'var(--gold)',marginBottom:'.45rem'}}>🏆 ملخص المكافآت — {currentPeriod.name}</div>
              {students.filter(s=>currentPeriod.studentPages?.[s.id]?.pages).map(s=>{const d=currentPeriod.studentPages[s.id];const r=calcReward(d.pages,d.phaseScore,d.phasePass);return r>0?<div key={s.id} style={{display:'flex',justifyContent:'space-between',padding:'.3rem 0',borderBottom:'1px solid rgba(245,158,11,.15)',fontSize:'.8rem'}}><span>{s.name} · {d.pages} صفحة · {d.phaseScore}/100</span><strong style={{color:'var(--gold)'}}>{r} ر.س</strong></div>:null})}
              <div style={{display:'flex',justifyContent:'space-between',padding:'.35rem 0 0',fontSize:'.84rem',fontWeight:800}}><span>الإجمالي</span><span style={{color:'var(--gold)'}}>{students.reduce((sum,s)=>{const d=currentPeriod.studentPages?.[s.id];return d?sum+calcReward(d.pages,d.phaseScore,d.phasePass):sum},0)} ر.س</span></div>
            </div>
          )}
        </>
      )}
    </>
  )

  // ── النقاط ──────────────────────────────────────────────────────
  const PagePoints = (
    <>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'1rem',marginBottom:'.85rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.6rem'}}>
          <div>
            <div style={{fontSize:'.9rem',fontWeight:800}}>{activeCycle?.name||'لا توجد دورة'}</div>
            <div style={{fontSize:'.72rem',color:'var(--text2)',marginTop:'.15rem'}}>بدأت: {activeCycle?.startDate} · {activeCycle?.planLimit} مقررات</div>
          </div>
          <div style={{display:'flex',gap:'.4rem'}}>
            {cycles.filter(c=>c.archived).length>0&&<Btn size="sm" onClick={()=>setViewArchive(v=>!v)}>📂 الأرشيف</Btn>}
            <Btn variant="p" size="sm" onClick={()=>confirm2('أرشفة الدورة؟',`أرشفة "${activeCycle?.name}" وفتح دورة جديدة؟`,()=>{
              const newId=Math.max(...cycles.map(c=>c.id),0)+1
              onUpdatePointsCycles(p=>[...p.map(c=>c.id===activeCycle?.id?{...c,archived:true,endDate:new Date().toISOString().slice(0,10)}:c),{id:newId,name:`الدورة رقم ${newId}`,startDate:new Date().toISOString().slice(0,10),endDate:null,archived:false,planLimit:6}])
              showToast('✅ تم الأرشفة وفتح دورة جديدة','ok')
            })}>🗂️ أرشفة وفتح دورة جديدة</Btn>
          </div>
        </div>
        <div style={{display:'flex',gap:'.35rem',alignItems:'center'}}>
          {Array.from({length:activeCycle?.planLimit||6}).map((_,i)=>{
            const done=cyclePoints.some(s=>s.plansCount>i)
            return <div key={i} style={{flex:1,height:6,borderRadius:3,background:done?'var(--green)':'var(--card3)'}}/>
          })}
          <span style={{fontSize:'.72rem',color:'var(--text2)',flexShrink:0,marginRight:'.3rem'}}>{cyclePoints[0]?.plansCount||0}/{activeCycle?.planLimit||6}</span>
        </div>
      </div>

      {viewArchive&&(
        <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.85rem',marginBottom:'.85rem'}}>
          <div style={{fontSize:'.84rem',fontWeight:800,marginBottom:'.55rem'}}>📂 الدورات المؤرشفة</div>
          {cycles.filter(c=>c.archived).map(cycle=>{
            const pts=calcCyclePoints(cycle)
            return (
              <div key={cycle.id} style={{background:'var(--card3)',borderRadius:'var(--rx)',padding:'.6rem .85rem',marginBottom:'.35rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div><div style={{fontSize:'.82rem',fontWeight:700}}>{cycle.name}</div><div style={{fontSize:'.68rem',color:'var(--text2)'}}>{cycle.startDate} → {cycle.endDate}</div></div>
                <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                  <div style={{textAlign:'left'}}><div style={{fontSize:'.68rem',color:'var(--text3)'}}>الأول</div><div style={{fontSize:'.82rem',fontWeight:800,color:'var(--gold)'}}>{pts[0]?.name?.split(' ')[0]||'—'}</div></div>
                  <Btn size="sm" onClick={()=>setShowArchived(showArchived===cycle.id?null:cycle.id)}>{showArchived===cycle.id?'إخفاء':'عرض'}</Btn>
                </div>
              </div>
            )
          })}
          {showArchived&&(()=>{
            const arc=cycles.find(c=>c.archived&&c.id===showArchived)
            const pts=calcCyclePoints(arc)
            return <div style={{marginTop:'.5rem'}}>{pts.map((d,i)=><div key={d.studentId} style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.45rem .65rem',background:'var(--card2)',borderRadius:'var(--rx)',marginBottom:'.25rem'}}><span style={{width:22,textAlign:'center'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</span><Avatar text={d.avatar} color={d.color} size={28}/><span style={{flex:1,fontSize:'.8rem',fontWeight:700}}>{d.name}</span><span style={{fontWeight:900,color:'var(--green)'}}>{d.total}</span><span style={{fontSize:'.7rem',color:'var(--text2)'}}>/ {(arc?.planLimit||6)*100}</span></div>)}</div>
          })()}
        </div>
      )}

      <div style={{fontSize:'.88rem',fontWeight:800,marginBottom:'.55rem'}}>
        ترتيب الطلاب — {activeCycle?.name}
        {(cyclePoints[0]?.plansCount||0)>=(activeCycle?.planLimit||6)&&<span style={{fontSize:'.72rem',background:'var(--golds)',color:'var(--gold)',padding:'.2rem .6rem',borderRadius:10,marginRight:'.5rem',fontWeight:700}}>🏆 جاهزة للتكريم</span>}
      </div>
      {cyclePoints.map((d,i)=>(
        <div key={d.studentId} onClick={()=>setLogData(d)} style={{display:'flex',alignItems:'center',gap:'.6rem',background:i===0?'rgba(245,158,11,.04)':'var(--card2)',border:`1px solid ${i===0?'rgba(245,158,11,.3)':i===1?'rgba(148,163,184,.2)':'var(--border)'}`,borderRadius:'var(--rs2)',padding:'.75rem .85rem',marginBottom:'.4rem',cursor:'pointer'}}>
          <div style={{width:28,textAlign:'center',fontSize:i<3?'1rem':'.8rem',fontWeight:i>=3?800:400,color:i>=3?'var(--text2)':undefined}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'.82rem',fontWeight:700}}>{d.name}</div>
            <PBar pts={d.total} max={(activeCycle?.planLimit||6)*100}/>
            <div style={{fontSize:'.66rem',color:'var(--text3)',marginTop:'.25rem'}}>{d.total} / {(activeCycle?.planLimit||6)*100} نقطة — {d.plansCount} من {d.planLimit} مقرر</div>
          </div>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:'1.2rem',fontWeight:900,color:'var(--green)',lineHeight:1}}>{d.total}</div>
          </div>
        </div>
      ))}
    </>
  )

  // ── المكافآت ─────────────────────────────────────────────────────
  const PageRewards = (
    <>
      <div style={{background:'var(--gs)',border:'1px solid rgba(34,197,94,.2)',borderRadius:'var(--rs2)',padding:'.8rem',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.75rem'}}>
        <div><div style={{fontSize:'.82rem',fontWeight:800,color:'var(--green)'}}>⭐ مقرر تقييم المرحلة</div><div style={{fontSize:'.68rem',color:'var(--text2)',marginTop:'.1rem'}}>تفعيل/تعطيل إمكانية إضافة مقررات تقييم المرحلة</div></div>
        <Sw checked={phasePlan} onChange={e=>{setPhasePlan(e.target.checked);showToast(e.target.checked?'✅ تم التفعيل':'⛔ تم التعطيل')}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.7rem'}}>
        <div style={{fontSize:'.88rem',fontWeight:800}}>قواعد المكافآت</div>
        <div style={{display:'flex',gap:'.4rem'}}><Btn size="sm" onClick={()=>showToast('🧮 جاري الاحتساب...')}>احتساب</Btn><Btn variant="p" size="sm" onClick={()=>setShowAddRule(true)}>+ قاعدة</Btn></div>
      </div>
      {rules.map(r=>(
        <div key={r.id} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.9rem',marginBottom:'.55rem'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'.55rem'}}>
            <div><div style={{fontSize:'.84rem',fontWeight:800}}>{r.name}</div><div style={{fontSize:'.68rem',color:'var(--text2)',marginTop:'.15rem'}}>📅 كل {r.months} أشهر · <span style={{color:r.active?'var(--green)':'var(--text3)'}}>{r.active?'مفعّلة':'معطّلة'}</span></div></div>
            <div style={{display:'flex',alignItems:'center',gap:'.35rem'}}>
              <Sw checked={r.active} onChange={()=>onUpdateRewardRules(p=>p.map(x=>x.id===r.id?{...x,active:!x.active}:x))}/>
              <Btn size="sm" onClick={()=>showToast('✏️ تعديل')}>تعديل</Btn>
              <Btn variant="d" size="sm" onClick={()=>confirm2('حذف القاعدة؟',`حذف "${r.name}"`,()=>onUpdateRewardRules(p=>p.filter(x=>x.id!==r.id)))}>حذف</Btn>
            </div>
          </div>
          {r.slabs.map((sl,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'.32rem .6rem',background:'var(--card3)',borderRadius:4,marginBottom:'.25rem',fontSize:'.74rem'}}><span style={{color:'var(--text2)'}}>{sl.min===0?`أقل من ${r.slabs[i-1]?.min||70} درجة`:`${sl.min}–${sl.max} درجة`}</span><span style={{color:sl.rate>0?'var(--gold)':'var(--text3)',fontWeight:800}}>{sl.rate>0?`${sl.rate} ريال/صفحة`:'لا مكافأة'}</span></div>)}
        </div>
      ))}
    </>
  )

  // ── البيانات ──────────────────────────────────────────────────────
  const PageData = (
    <>
      <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.9rem',marginBottom:'.55rem'}}>
        <div style={{fontSize:'.84rem',fontWeight:800,marginBottom:'.35rem'}}>📥 تحميل نسخة احتياطية</div>
        <div style={{fontSize:'.74rem',color:'var(--text2)',marginBottom:'.65rem',lineHeight:1.55}}>تنزيل ملف JSON يحتوي على جميع البيانات المحفوظة.</div>
        <Btn variant="p" onClick={()=>{const d={users,plans,assignments:asgn,rewardRules:rules,sysSettings,pointsCycles:cycles,pagesPeriods:periods,exportedAt:new Date().toISOString()};const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`quran-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();showToast('📥 تم التحميل','ok')}}>💾 تحميل النسخة الاحتياطية</Btn>
      </div>
      <div style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.18)',borderRadius:'var(--rs2)',padding:'.9rem'}}>
        <div style={{fontSize:'.82rem',fontWeight:800,color:'var(--red)',marginBottom:'.3rem'}}>⚠️ منطقة الخطر</div>
        <div style={{fontSize:'.72rem',color:'var(--text2)',marginBottom:'.6rem',lineHeight:1.55}}>إعادة ضبط جميع البيانات للقيم الافتراضية. <strong>لا يمكن التراجع.</strong></div>
        <Btn variant="d" onClick={()=>confirm2('إعادة الضبط الكامل؟','⚠️ سيتم حذف جميع البيانات.',()=>{onResetToDefaults?.();showToast('✅ تم إعادة الضبط','ok')})}>🗑️ إعادة ضبط البيانات</Btn>
      </div>
    </>
  )

  // ── المستخدمون ───────────────────────────────────────────────────
  const PageAdmins = (
    <>
      {admins.map(a=>(
        <div key={a.id} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.85rem',marginBottom:'.45rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.5rem'}}>
            <div><div style={{display:'flex',alignItems:'center',gap:'.4rem',fontSize:'.84rem',fontWeight:800}}>{a.name}{a.isSuperAdmin&&<Tag label="مدير عام" color="b"/>}</div><div style={{fontSize:'.68rem',color:'var(--text2)',marginTop:'.1rem'}}>@{a.username}</div></div>
            <div style={{display:'flex',gap:'.3rem'}}>
              <Btn size="sm" onClick={()=>setEditingUser(a)}>تعديل</Btn>
              {!a.isSuperAdmin&&<Btn variant="d" size="sm" onClick={()=>confirm2('حذف المستخدم؟','',()=>{onUpdateUsers(p=>p.filter(u=>u.id!==a.id));showToast('🗑️ تم','ok')})}>حذف</Btn>}
            </div>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'.25rem'}}>{a.isSuperAdmin?<Tag label="جميع الصلاحيات" color="g"/>:<><Tag label={`الطلاب: ${a.perms?.editStudents?'عرض+تعديل':'عرض'}`} color="g"/>{a.perms?.reports&&<Tag label="التقارير" color="b"/>}{!a.perms?.warnings&&<Tag label="بدون إنذارات" color="r"/>}</>}</div>
        </div>
      ))}
    </>
  )

  // ── إعدادات النظام ───────────────────────────────────────────────
  const PageSysConfig = (
    <>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'1.1rem',marginBottom:'.75rem'}}>
        <div style={{fontSize:'.9rem',fontWeight:800,marginBottom:'.75rem'}}>⏰ وقت قطع إدخال التقارير</div>
        <div style={{background:'rgba(59,130,246,.08)',border:'1px solid rgba(59,130,246,.2)',borderRadius:'var(--rs2)',padding:'.65rem .85rem',marginBottom:'.85rem',fontSize:'.76rem',color:'var(--blue)',lineHeight:1.6}}>
          بعد هذه الساعة لا يمكن إدخال تقرير اليوم الماضي.
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'.85rem'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:'.76rem',color:'var(--text2)',fontWeight:700,marginBottom:'.35rem'}}>ساعة القطع (0–23)</div>
            <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
              <input type="number" min={0} max={23} value={dlInput} onChange={e=>setDlInput(e.target.value)} style={{width:80,background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rx)',padding:'.5rem .7rem',color:'var(--text)',fontFamily:'inherit',fontSize:'1.1rem',fontWeight:800,textAlign:'center'}}/>
              <span style={{fontSize:'.84rem',color:'var(--text2)'}}>:00 صباحاً</span>
            </div>
          </div>
          <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--rs2)',padding:'.75rem 1.1rem',textAlign:'center',flexShrink:0}}>
            <div style={{fontSize:'.68rem',color:'var(--text2)',marginBottom:'.2rem'}}>الحالي</div>
            <div style={{fontSize:'1.8rem',fontWeight:900,color:'var(--green)',lineHeight:1}}>{dlHour}</div>
            <div style={{fontSize:'.66rem',color:'var(--text2)',marginTop:'.1rem'}}>:00 ص</div>
          </div>
        </div>
        <Btn variant="p" style={{width:'100%',justifyContent:'center'}} onClick={()=>{const h=parseInt(dlInput);if(isNaN(h)||h<0||h>23){showToast('⚠️ أدخل رقماً بين 0 و23','warn');return};onUpdateSysSettings(p=>({...p,reportDeadlineHour:h}));showToast(`✅ تم التحديث إلى ${h}:00 صباحاً`,'ok')}}>💾 حفظ الإعداد</Btn>
      </div>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'1.1rem'}}>
        <div style={{fontSize:'.9rem',fontWeight:800,marginBottom:'.75rem'}}>🔧 إعدادات إضافية</div>
        {[['السماح بتقرير الأمس',true],['إشعار المعلم عند الغياب',true],['إيقاف الحساب عند 3 إنذارات',true]].map(([l,d])=>(
          <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.65rem 0',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontSize:'.82rem',fontWeight:600}}>{l}</span>
            <Sw checked={d} onChange={()=>showToast(`🔄 تم تغيير: ${l}`)}/>
          </div>
        ))}
      </div>
    </>
  )

  const pageMap = {
    overview:PageOverview, students:PageStudents, teachers:PageTeachers,
    assign:PageAssign, missing:PageMissing, warnings:PageWarnings,
    reports:PageReports, pages:PagePages, points:PagePoints,
    rewards:PageRewards, data:PageData, admins:PageAdmins, sysconfig:PageSysConfig,
  }

  return (
    <div style={{display:'flex',maxWidth:780,margin:'0 auto',minHeight:'100vh'}}>
      {Sidebar}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.65rem 1rem',background:'var(--bg2)',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:40}}>
          <div style={{fontSize:'.95rem',fontWeight:800}}>{TITLES[page]}</div>
          <div style={{display:'flex',gap:'.4rem'}}>
            {page==='students'&&<Btn variant="p" size="sm" onClick={()=>setShowAddStu(true)}>+ إضافة طالب</Btn>}
            {page==='teachers'&&<Btn variant="p" size="sm" onClick={()=>setShowAddTea(true)}>+ إضافة معلم</Btn>}
            {page==='admins'  &&<Btn variant="p" size="sm" onClick={()=>setShowAddAdm(true)}>+ إضافة مشرف</Btn>}
          </div>
        </div>
        <div style={{padding:'.85rem',flex:1,overflowY:'auto'}}>{pageMap[page]||null}</div>
      </div>

      <ProfileModal open={showProfile} user={currentUser} onClose={()=>setShowProfile(false)} onSave={ch=>{onUpdateUser(ch);setShowProfile(false);showToast('✅ تم حفظ التعديلات','ok')}}/>
      <EditUserModal open={!!editingUser} user={editingUser} onClose={()=>setEditingUser(null)} onSave={ch=>{onUpdateUsers(p=>p.map(u=>u.id===editingUser.id?{...u,...ch}:u));setEditingUser(null);showToast('✅ تم التعديل','ok')}}/>
      <AddStudentModal open={showAddStu} onClose={()=>setShowAddStu(false)} onSave={d=>{onUpdateUsers(p=>[...p,{...d,id:Date.now(),role:'student',avatar:d.name.slice(0,2),color:'g',warned:0,suspended:false}]);setShowAddStu(false);showToast('✅ تم إضافة الطالب','ok')}}/>
      <AddTeacherModal open={showAddTea} onClose={()=>setShowAddTea(false)} onSave={d=>{onUpdateUsers(p=>[...p,{...d,id:Date.now(),role:'teacher',avatar:d.name.slice(0,2),color:'b'}]);setShowAddTea(false);showToast('✅ تم إضافة المعلم','ok')}}/>
      <AddAdminModal  open={showAddAdm} onClose={()=>setShowAddAdm(false)} onSave={d=>{onUpdateUsers(p=>[...p,{...d,id:Date.now(),role:'admin'}]);setShowAddAdm(false);showToast('✅ تم إضافة المشرف','ok')}}/>

      <Modal open={!!logData} onClose={()=>setLogData(null)} title={`📊 سجل نقاط ${logData?.name||''}`}>
        {logData&&<>
          <div style={{display:'flex',justifyContent:'space-between',background:'var(--card3)',borderRadius:'var(--rx)',padding:'.55rem .75rem',marginBottom:'.65rem',fontSize:'.8rem'}}>
            <span>الإجمالي: <strong style={{color:'var(--green)'}}>{logData.total}</strong></span>
            <span>من {(activeCycle?.planLimit||6)*100} نقطة</span>
          </div>
          {(logData.logs||[]).map((l,i)=><div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.45rem .65rem',background:'var(--card3)',borderRadius:4,marginBottom:'.28rem'}}><span style={{fontSize:'.78rem'}}>{l.type} · {l.date}</span><span style={{fontWeight:900,color:'var(--green)'}}>+{l.pts}</span></div>)}
        </>}
      </Modal>

      <Modal open={!!confirmData} onClose={()=>setConfirmData(null)} title={`⚠️ ${confirmData?.title||''}`}>
        {confirmData&&<>
          <p style={{fontSize:'.8rem',color:'var(--text2)',marginBottom:'1.1rem',lineHeight:1.6}}>{confirmData.msg||'هل أنت متأكد؟'}</p>
          <div style={{display:'flex',gap:'.5rem'}}>
            <Btn style={{flex:1,justifyContent:'center'}} onClick={()=>setConfirmData(null)}>إلغاء</Btn>
            <Btn variant="d" style={{flex:1,justifyContent:'center'}} onClick={()=>{confirmData.cb?.();setConfirmData(null)}}>تأكيد</Btn>
          </div>
        </>}
      </Modal>

      <Modal open={showAddRule} onClose={()=>setShowAddRule(false)} title="🏆 إضافة قاعدة مكافآت">
        <FIn label="اسم القاعدة" placeholder="مكافآت ربع سنوية"/>
        <FIn label="الفترة (بالأشهر)" type="number" placeholder="3"/>
        <div style={{display:'flex',gap:'.5rem'}}><Btn style={{flex:1,justifyContent:'center'}} onClick={()=>setShowAddRule(false)}>إلغاء</Btn><Btn variant="p" style={{flex:1,justifyContent:'center'}} onClick={()=>{setShowAddRule(false);showToast('✅ تم','ok')}}>💾 حفظ</Btn></div>
      </Modal>
    </div>
  )
}
