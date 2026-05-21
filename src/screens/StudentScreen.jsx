import { useState, useMemo } from 'react'
import Btn from '../components/Btn.jsx'
import Modal from '../components/Modal.jsx'
import { TASKS_HAFIZ, DAYS_AR, DAYS_SHORT } from '../data.js'
import ProfileModal from '../components/ProfileModal.jsx'

// ── منطق التواريخ والأذونات ──────────────────────────────────────────
function getAllowedDays(deadlineHour) {
  const now = new Date()
  const todayIdx = now.getDay()
  const hour = now.getHours()
  const yesterdayIdx = todayIdx === 0 ? 6 : todayIdx - 1
  const canAddYesterday = hour < deadlineHour
  return { todayIdx, yesterdayIdx, canAddYesterday }
}

function isDayAllowed(dayIdx, todayIdx, yesterdayIdx, canAddYesterday) {
  if (dayIdx === todayIdx) return true
  if (dayIdx === yesterdayIdx && canAddYesterday) return true
  return false
}

// ── مساعدات العرض ────────────────────────────────────────────────────
function typeMeta(plan) {
  if (plan.type === 'حفظ')
    return { label:'📖 حفظ', bg:'var(--gs)', color:'var(--green)' }
  if (plan.type === 'سرد' && plan.sardSubtype === 'full')
    return { label:'🎙️ سرد كامل', bg:'var(--bs)', color:'var(--blue)' }
  if (plan.type === 'سرد' && plan.sardSubtype === 'review')
    return { label:'🔁 سرد مراجعة (مقاطع)', bg:'var(--golds)', color:'var(--gold)' }
  if (plan.type === 'تقييم مرحلة')
    return { label:'⭐ تقييم مرحلة', bg:'var(--golds)', color:'var(--gold)' }
  return { label:plan.type, bg:'var(--card3)', color:'var(--text2)' }
}

function PlanContent({ plan }) {
  if (plan.type === 'حفظ') return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.22rem' }}>
      {[['الجديد',plan.newMem],['القريب',plan.recentMem],['القديم',plan.oldMem]].map(([l,v]) => v ? (
        <div key={l} style={{ display:'flex', gap:'.5rem', fontSize:'.8rem' }}>
          <span style={{ color:'var(--text3)', minWidth:46, flexShrink:0, fontSize:'.72rem' }}>{l}</span>
          <span style={{ fontWeight:600, color:'var(--text)' }}>{v}</span>
        </div>
      ) : null)}
    </div>
  )
  if (plan.type === 'سرد') return (
    <div style={{ display:'flex', gap:'.5rem', fontSize:'.8rem' }}>
      <span style={{ color:'var(--text3)', minWidth:46, fontSize:'.72rem' }}>المقرر</span>
      <span style={{ fontWeight:600 }}>{plan.sardText}</span>
    </div>
  )
  if (plan.type === 'تقييم مرحلة') return (
    <div style={{ display:'flex', gap:'.5rem', fontSize:'.8rem' }}>
      <span style={{ color:'var(--text3)', minWidth:46, fontSize:'.72rem' }}>المرحلة</span>
      <span style={{ fontWeight:600 }}>{plan.phaseDesc}</span>
    </div>
  )
  return null
}

function ReportedDays({ dailyReports }) {
  const reported = Object.keys(dailyReports || {}).map(Number)
  if (reported.length === 0) return (
    <span style={{ fontSize:'.68rem', color:'var(--text3)', fontStyle:'italic' }}>لم يُرسل أي تقرير بعد</span>
  )
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem' }}>
      {reported.sort((a,b)=>a-b).map(d => (
        <span key={d} style={{ fontSize:'.66rem', padding:'.18rem .55rem', borderRadius:8, background:'rgba(34,197,94,.15)', color:'var(--green)', fontWeight:700 }}>
          ✓ {DAYS_SHORT[d]}
        </span>
      ))}
    </div>
  )
}

// ── حقل إدخال مساعد ─────────────────────────────────────────────────
function Field({ label, placeholder, value, onChange, rows, optional }) {
  const s = { width:'100%', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rx)', padding:'.48rem .7rem', color:'var(--text)', fontFamily:'inherit', fontSize:'.8rem', marginBottom:'.6rem', resize:'none' }
  return (
    <div>
      <div style={{ fontSize:'.74rem', color:'var(--text2)', fontWeight:700, marginBottom:'.25rem', display:'flex', gap:'.3rem', alignItems:'center' }}>
        {label}
        {optional
          ? <span style={{ color:'var(--text3)', fontWeight:400 }}>(اختياري)</span>
          : <span style={{ color:'var(--red)' }}>*</span>
        }
      </div>
      {rows
        ? <textarea rows={rows} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} style={s}/>
        : <input placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} style={{...s, marginBottom:'.6rem'}}/>
      }
    </div>
  )
}

// ── نافذة التقرير اليومي ─────────────────────────────────────────────
function DailyReportModal({ open, plan, existingReport, selectedDay, onClose, onSave, deadlineHour }) {
  const { todayIdx, yesterdayIdx, canAddYesterday } = getAllowedDays(deadlineHour)

  const allowedDays = useMemo(() => {
    const d = [todayIdx]
    if (canAddYesterday) d.push(yesterdayIdx)
    return d
  }, [todayIdx, yesterdayIdx, canAddYesterday])

  const [activeDay,  setActiveDay]  = useState(() => allowedDays.includes(selectedDay ?? todayIdx) ? (selectedDay ?? todayIdx) : todayIdx)
  const [tasks,      setTasks]      = useState(existingReport?.tasks     || {})
  const [sardDone,   setSardDone]   = useState(existingReport?.sardDone  || false)
  const [sardText,   setSardText]   = useState(existingReport?.sardText  || '')
  const [sardNotes,  setSardNotes]  = useState(existingReport?.sardNotes || '')
  const [phaseMem,   setPhaseMem]   = useState(existingReport?.phaseMem  || '')
  const [oldMem,     setOldMem]     = useState(existingReport?.oldMem    || '')
  const [notes,      setNotes]      = useState(existingReport?.notes     || '')
  const [err,        setErr]        = useState('')

  const isEdit = !!existingReport

  function toggleTask(key) { setTasks(p => ({...p, [key]: !p[key]})); setErr('') }

  function handleSave() {
    setErr('')
    // التحقق من المهام الإلزامية
    if (plan.type === 'حفظ') {
      const missing = TASKS_HAFIZ.filter(t => !tasks[t.key]).map(t => t.label)
      if (missing.length > 0) { setErr('يرجى إكمال جميع مهام اليوم: ' + missing.map(l=>l.replace(/^[^\s]+ /,'')).join(' · ')); return }
    }
    if (plan.type === 'سرد' && !sardDone) { setErr('يرجى تأكيد إتمام السرد'); return }
    onSave(activeDay, { tasks, sardDone, sardText, sardNotes, phaseMem, oldMem, notes, submittedAt: new Date().toISOString() })
  }

  const dayTabSt = (d) => ({
    padding:'.42rem .85rem', borderRadius:'var(--rs2)', fontSize:'.78rem', fontWeight:700,
    cursor:'pointer', transition:'all .15s', flexShrink:0,
    background: activeDay===d ? 'var(--gs)' : 'var(--card2)',
    border:`1px solid ${activeDay===d ? 'rgba(34,197,94,.35)' : 'var(--border)'}`,
    color: activeDay===d ? 'var(--green)' : 'var(--text2)',
  })

  return (
    <Modal open={open} onClose={onClose}
      title={`${isEdit ? '✏️ تعديل تقرير' : '📋 تقرير'} يوم ${DAYS_AR[activeDay]} — ${plan.type}`}
      maxWidth={460}
    >
      {/* تبويب الأيام */}
      {allowedDays.length > 1 && (
        <div style={{ marginBottom:'.85rem' }}>
          <div style={{ fontSize:'.74rem', color:'var(--text2)', fontWeight:700, marginBottom:'.4rem' }}>اليوم</div>
          <div style={{ display:'flex', gap:'.4rem' }}>
            {allowedDays.map(d => (
              <div key={d} style={dayTabSt(d)} onClick={() => setActiveDay(d)}>
                {DAYS_AR[d]}
                {d === todayIdx && <span style={{ fontSize:'.6rem', marginRight:'.3rem', color:'var(--green)' }}>• اليوم</span>}
              </div>
            ))}
          </div>
          {canAddYesterday && (
            <div style={{ fontSize:'.68rem', color:'var(--text3)', marginTop:'.3rem' }}>
              ⏰ تقرير الأمس متاح حتى {deadlineHour}:00 صباحاً
            </div>
          )}
        </div>
      )}

      {/* مهام الحفظ */}
      {plan.type === 'حفظ' && (
        <>
          <div style={{ fontSize:'.76rem', color:'var(--text2)', fontWeight:700, marginBottom:'.5rem' }}>
            إنجازات اليوم <span style={{ color:'var(--red)' }}>* (جميعها إلزامية)</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.45rem', marginBottom:'.75rem' }}>
            {TASKS_HAFIZ.map(task => (
              <div key={task.key} onClick={() => toggleTask(task.key)} style={{
                display:'flex', alignItems:'center', gap:'.55rem',
                background: tasks[task.key] ? 'rgba(34,197,94,.07)' : 'var(--card2)',
                border:`1px solid ${tasks[task.key] ? 'rgba(34,197,94,.28)' : 'var(--border)'}`,
                borderRadius:'var(--rs2)', padding:'.65rem .8rem',
                cursor:'pointer', transition:'all .15s',
                gridColumn: task.span ? 'span 2' : 'auto',
              }}>
                <div style={{
                  width:20, height:20, borderRadius:'50%', flexShrink:0,
                  border:`2px solid ${tasks[task.key]?'var(--green)':'var(--border2)'}`,
                  background: tasks[task.key]?'var(--green)':'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'.72rem', color:'#fff', transition:'all .15s',
                }}>{tasks[task.key]?'✓':''}</div>
                <span style={{ fontSize:'.78rem', fontWeight:600, color:tasks[task.key]?'var(--text2)':'var(--text)', textDecoration:tasks[task.key]?'line-through':'none' }}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
          <Field label="حفظ المرحلة" placeholder="ما قمت بحفظه في المرحلة..." value={phaseMem} onChange={setPhaseMem} rows={2} optional/>
          <Field label="الحفظ السابق" placeholder="ما راجعته من الحفظ السابق..." value={oldMem} onChange={setOldMem} rows={2} optional/>
        </>
      )}

      {/* مهام السرد */}
      {plan.type === 'سرد' && (
        <>
          <div style={{ background:'var(--bs)', border:'1px solid rgba(59,130,246,.2)', borderRadius:'var(--rs2)', padding:'.65rem .85rem', marginBottom:'.7rem', fontSize:'.78rem' }}>
            <strong style={{ color:'var(--blue)' }}>{plan.sardSubtype==='full'?'سرد كامل':'مراجعة (مقاطع)'}</strong>
            <span style={{ color:'var(--text2)', marginRight:'.4rem' }}>· {plan.sardText}</span>
          </div>
          <div onClick={() => { setSardDone(v=>!v); setErr('') }} style={{
            display:'flex', alignItems:'center', gap:'.7rem',
            background: sardDone?'rgba(34,197,94,.07)':'var(--card2)',
            border:`1px solid ${sardDone?'rgba(34,197,94,.28)':'var(--border)'}`,
            borderRadius:'var(--rs2)', padding:'.9rem', cursor:'pointer', marginBottom:'.7rem', transition:'all .15s',
          }}>
            <div style={{ width:26, height:26, borderRadius:7, border:`2px solid ${sardDone?'var(--green)':'var(--border2)'}`, background:sardDone?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#fff', transition:'all .15s', flexShrink:0 }}>{sardDone?'✓':''}</div>
            <div>
              <div style={{ fontSize:'.86rem', fontWeight:700 }}>تم السرد <span style={{ color:'var(--red)', fontSize:'.7rem' }}>*</span></div>
              <div style={{ fontSize:'.7rem', color:'var(--text2)' }}>اضغط لتأكيد إتمام السرد</div>
            </div>
          </div>
          <Field label="نص السرد" placeholder="نص السرد الذي تم تنفيذه..." value={sardText} onChange={setSardText} optional/>
          <Field label="ملاحظات السرد" placeholder="ملاحظات..." value={sardNotes} onChange={setSardNotes} rows={2} optional/>
        </>
      )}

      {/* ملاحظات عامة */}
      <Field label="ملاحظات" placeholder="ملاحظات اليوم..." value={notes} onChange={setNotes} rows={2} optional/>

      {/* رسالة خطأ */}
      {err && (
        <div style={{ background:'var(--rs)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'var(--rx)', padding:'.5rem .75rem', fontSize:'.76rem', color:'var(--red)', marginBottom:'.65rem', lineHeight:1.5 }}>
          ⚠️ {err}
        </div>
      )}

      <div style={{ display:'flex', gap:'.5rem' }}>
        <Btn style={{ flex:1, justifyContent:'center' }} onClick={onClose}>إلغاء</Btn>
        <Btn variant="p" style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>
          {isEdit ? '💾 حفظ التعديل' : '☁️ إرسال التقرير'}
        </Btn>
      </div>
    </Modal>
  )
}

// ── الشاشة الرئيسية ──────────────────────────────────────────────────
export default function StudentScreen({ currentUser, plans: allPlans, sysSettings, onLogout, onUpdateUser, onUpdatePlans, showToast }) {
  const [plans,      setPlans]      = useState(allPlans || [])
  const [showProfile, setShowProfile] = useState(false)
  const [modalState, setModalState] = useState({ open:false, plan:null, day:null, existing:null })
  const [pastOpen,   setPastOpen]   = useState(false)
  const [futureOpen, setFutureOpen] = useState(false)

  const deadlineHour = sysSettings?.reportDeadlineHour ?? 8
  const { todayIdx, yesterdayIdx, canAddYesterday } = getAllowedDays(deadlineHour)

  // حساب حالة المقرر تلقائياً من التاريخ
  const computedPlans = useMemo(() => {
    const today = new Date()
    today.setHours(0,0,0,0)
    return plans
      .filter(p => p.studentId === currentUser.id)
      .map(p => {
        const start = new Date(p.startDate)
        start.setHours(0,0,0,0)
        const end   = new Date(start); end.setDate(end.getDate() + 6)
        let status
        if (today < start)        status = 'future'
        else if (today <= end)    status = 'current'
        else                      status = 'past'
        return { ...p, status }
      })
  }, [plans, currentUser.id])

  const myPlans     = computedPlans
  const currentPlan = useMemo(() => myPlans.find(p => p.status === 'current'), [myPlans])
  const pastPlans   = useMemo(() => myPlans.filter(p => p.status === 'past').sort((a,b) => b.startDate.localeCompare(a.startDate)), [myPlans])
  const futurePlans = useMemo(() => myPlans.filter(p => p.status === 'future').sort((a,b) => a.startDate.localeCompare(b.startDate)), [myPlans])

  const reportedDays      = Object.keys(currentPlan?.dailyReports || {}).map(Number)
  const todayReported     = reportedDays.includes(todayIdx)
  const yesterdayReported = reportedDays.includes(yesterdayIdx)
  const showYesterdayBtn  = canAddYesterday && !yesterdayReported  // ← شرط الإظهار

  function openReport(day, isEdit) {
    if (!currentPlan) return
    const existing = isEdit ? (currentPlan.dailyReports?.[day] || null) : null
    setModalState({ open:true, plan:currentPlan, day, existing })
  }

  function saveReport(dayIdx, data) {
    if (!isDayAllowed(dayIdx, todayIdx, yesterdayIdx, canAddYesterday)) {
      showToast('⛔ انتهت مهلة إدخال تقرير هذا اليوم', 'err'); return
    }
    const updater = prev => prev.map(p => {
      if (p.id !== currentPlan.id) return p
      return { ...p, dailyReports: { ...p.dailyReports, [dayIdx]: data } }
    })
    setPlans(updater)
    if (onUpdatePlans) onUpdatePlans(updater)
    setModalState({ open:false, plan:null, day:null, existing:null })
    showToast(modalState.existing ? '✏️ تم تعديل التقرير' : '✅ تم إرسال تقرير اليوم', 'ok')
  }

  function handleProfileSave(changes) {
    onUpdateUser(changes)
    setShowProfile(false)
    showToast('✅ تم حفظ التعديلات', 'ok')
  }

  const tm = currentPlan ? typeMeta(currentPlan) : null

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', maxWidth:680, margin:'0 auto' }}>
      <style>{`
        @keyframes pulse-border {
          0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,0); border-color:rgba(34,197,94,.38); }
          50%      { box-shadow:0 0 0 5px rgba(34,197,94,.11); border-color:rgba(34,197,94,.72); }
        }
      `}</style>

      {/* TOPBAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.7rem 1rem', background:'var(--bg2)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontWeight:800, fontSize:'1.05rem' }}>📖 أشبال القرآن</div>
        <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.35rem', background:'var(--card)', border:'1px solid var(--border)', borderRadius:20, padding:'.28rem .75rem', fontSize:'.76rem', fontWeight:600 }}>👤 {currentUser.name}</div>
          <Btn variant="out" size="sm" onClick={onLogout}>خروج</Btn>
        </div>
      </div>

      <div style={{ flex:1, padding:'1rem', overflowY:'auto' }}>

        {/* ── بطاقة الإنذار ── */}
        {currentUser.warned > 0 && !currentUser.suspended && (
          <div style={{
            display:'flex', alignItems:'center', gap:'.75rem',
            background:'rgba(245,158,11,.07)', border:'1px solid rgba(245,158,11,.3)',
            borderRadius:'var(--rs2)', padding:'.8rem 1rem', marginBottom:'.75rem',
          }}>
            <div style={{ fontSize:'1.4rem', flexShrink:0 }}>⚠️</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'.84rem', fontWeight:800, color:'var(--gold)' }}>
                لديك {currentUser.warned === 1 ? 'إنذار واحد' : currentUser.warned === 2 ? 'إنذاران' : 'ثلاثة إنذارات'}
              </div>
              <div style={{ fontSize:'.72rem', color:'var(--text2)', marginTop:'.15rem' }}>
                {'★'.repeat(currentUser.warned)}{'☆'.repeat(3 - currentUser.warned)} · الإنذار الثالث يوقف حسابك تلقائياً
              </div>
            </div>
            <div style={{ display:'flex', gap:'.2rem', flexShrink:0 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ width:10, height:10, borderRadius:'50%', background: i <= currentUser.warned ? 'var(--gold)' : 'var(--card3)', border:'1px solid rgba(245,158,11,.3)' }}/>
              ))}
            </div>
          </div>
        )}

        {/* ── بطاقة الوقف ── */}
        {currentUser.suspended && (
          <div style={{
            display:'flex', alignItems:'center', gap:'.75rem',
            background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.3)',
            borderRadius:'var(--rs2)', padding:'.8rem 1rem', marginBottom:'.75rem',
          }}>
            <div style={{ fontSize:'1.4rem', flexShrink:0 }}>🚫</div>
            <div>
              <div style={{ fontSize:'.84rem', fontWeight:800, color:'var(--red)' }}>حسابك موقوف</div>
              <div style={{ fontSize:'.72rem', color:'var(--text2)', marginTop:'.15rem' }}>تواصل مع المشرف لرفع الوقف</div>
            </div>
          </div>
        )}

        {/* ── بطاقة المكافأة ── */}
        {currentUser.reward && (
          <div style={{
            display:'flex', alignItems:'center', gap:'.75rem',
            background:'rgba(245,158,11,.07)', border:'1px solid rgba(245,158,11,.28)',
            borderRadius:'var(--rs2)', padding:'.8rem 1rem', marginBottom:'.75rem',
          }}>
            <div style={{ fontSize:'1.5rem', flexShrink:0 }}>🏆</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'.84rem', fontWeight:800, color:'var(--gold)' }}>
                مكافأة مستحقة: {currentUser.reward.amount} ريال
              </div>
              <div style={{ fontSize:'.72rem', color:'var(--text2)', marginTop:'.15rem' }}>
                {currentUser.reward.period} · تاريخ الاستحقاق: {currentUser.reward.date}
              </div>
            </div>
            <div style={{ fontSize:'1.3rem', fontWeight:900, color:'var(--gold)', flexShrink:0 }}>
              {currentUser.reward.amount}
              <span style={{ fontSize:'.65rem', marginRight:'.2rem' }}>ر.س</span>
            </div>
          </div>
        )}

        {/* ── إحصاءات ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.6rem', marginBottom:'1rem' }}>
          {[['15','جزء محفوظ','var(--green)'],['18','أسبوع متواصل','var(--gold)'],['94%','الالتزام','var(--blue)']].map(([n,l,c]) => (
            <div key={l} style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rs2)', padding:'.85rem', textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', fontWeight:900, color:c, lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:'.68rem', color:'var(--text2)', marginTop:'.2rem' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ── المقرر الحالي ── */}
        {currentPlan && (
          <div style={{
            background:'var(--card)', border:'2px solid rgba(34,197,94,.45)',
            borderRight:'4px solid var(--green)', borderRadius:'var(--r)',
            padding:'1.1rem', marginBottom:'.85rem',
            animation:'pulse-border 2.8s ease-in-out infinite',
          }}>
            {/* رأس البطاقة */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.7rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 8px var(--green)', flexShrink:0 }}/>
                <span style={{ fontSize:'.72rem', padding:'.18rem .65rem', borderRadius:12, fontWeight:800, background:tm.bg, color:tm.color }}>{tm.label}</span>
                <span style={{ fontSize:'.68rem', color:'var(--text3)' }}>{currentPlan.startDate}</span>
              </div>
              {/* زر التقرير */}
              <button onClick={() => openReport(todayIdx, todayReported)} style={{
                display:'flex', alignItems:'center', gap:'.35rem',
                background: todayReported ? 'rgba(34,197,94,.12)' : 'linear-gradient(135deg,var(--green),var(--green2))',
                color: todayReported ? 'var(--green)' : '#fff',
                border: todayReported ? '1px solid rgba(34,197,94,.3)' : 'none',
                borderRadius:'var(--rs2)', padding:'.38rem .8rem',
                fontSize:'.76rem', fontWeight:800, cursor:'pointer', fontFamily:'inherit',
              }}>
                {todayReported ? '✏️ تعديل اليوم' : '📋 تقرير اليوم'}
              </button>
            </div>

            {/* محتوى المقرر */}
            <PlanContent plan={currentPlan}/>

            {/* زر تقرير الأمس — يظهر فقط إذا لم يُدخل */}
            {showYesterdayBtn && (
              <div onClick={() => openReport(yesterdayIdx, false)} style={{
                display:'flex', alignItems:'center', gap:'.4rem', marginTop:'.65rem',
                padding:'.38rem .65rem', background:'rgba(245,158,11,.08)',
                border:'1px solid rgba(245,158,11,.2)', borderRadius:'var(--rx)',
                cursor:'pointer', fontSize:'.72rem', color:'var(--gold)',
              }}>
                ⏰ إضافة تقرير {DAYS_AR[yesterdayIdx]} — متاح حتى {deadlineHour}:00 ص
              </div>
            )}

            {/* تقييم المقرر الحالي إن صدر */}
            {currentPlan.evaluation && (() => {
              const ev = currentPlan.evaluation
              return (
                <div style={{ marginTop:'.65rem', background:'rgba(34,197,94,.06)', border:'1px solid rgba(34,197,94,.18)', borderRadius:'var(--rx)', padding:'.6rem .75rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.35rem' }}>
                    <span style={{ fontSize:'.72rem', fontWeight:800, color:'var(--green)' }}>📝 نتيجة التقييم</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'.35rem' }}>
                      <span style={{ fontSize:'.78rem', color:'var(--gold)' }}>{'★'.repeat(ev.stars||0)}{'☆'.repeat(3-(ev.stars||0))}</span>
                      <span style={{ fontSize:'.78rem', fontWeight:900, color:'var(--green)' }}>+{ev.points} نقطة</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem', marginBottom: ev.notes ? '.4rem' : 0 }}>
                    {currentPlan.type === 'حفظ' && ev.newScore !== undefined && <>
                      <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>جديد: <strong style={{color:'var(--text)'}}>{ev.newScore}/40</strong> {ev.newPass ? '✓' : '✕'}</span>
                      <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>قريب: <strong style={{color:'var(--text)'}}>{ev.recentScore}/20</strong></span>
                      <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>قديم: <strong style={{color:'var(--text)'}}>{ev.oldScore}/40</strong> {ev.oldPass ? '✓' : '✕'}</span>
                    </>}
                    {currentPlan.type === 'سرد' && ev.revScore !== undefined &&
                      <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>السرد: <strong style={{color:'var(--text)'}}>{ev.revScore}/100</strong> {ev.revPass ? '✓ يُجاز' : '✕ لا يُجاز'}</span>
                    }
                    {currentPlan.type === 'تقييم مرحلة' && ev.phaseScore !== undefined &&
                      <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>التقييم: <strong style={{color:'var(--text)'}}>{ev.phaseScore}/100</strong></span>
                    }
                  </div>
                  {ev.notes && <div style={{ fontSize:'.72rem', color:'var(--text2)', borderTop:'1px solid rgba(34,197,94,.15)', paddingTop:'.35rem', marginTop:'.35rem' }}>💬 {ev.notes}</div>}
                </div>
              )
            })()}

            {/* الأيام المُرسلة */}
            <div style={{ marginTop:'.75rem', paddingTop:'.65rem', borderTop:'1px solid var(--border)' }}>
              <div style={{ fontSize:'.68rem', color:'var(--text3)', marginBottom:'.35rem', fontWeight:700 }}>
                التقارير المُرسلة هذا الأسبوع
              </div>
              <ReportedDays dailyReports={currentPlan.dailyReports}/>
            </div>
          </div>
        )}

        {!currentPlan && (
          <div style={{ textAlign:'center', padding:'2rem', color:'var(--text3)', fontSize:'.85rem', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--r)', marginBottom:'.85rem' }}>
            لا يوجد مقرر حالي — انتظر مقررك القادم من المعلم
          </div>
        )}

        {/* ── المقررات القادمة (منطوية) ── */}
        {futurePlans.length > 0 && (
          <div style={{ marginBottom:'.65rem' }}>
            <div onClick={() => setFutureOpen(v=>!v)} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              cursor:'pointer', padding:'.55rem .75rem',
              background:'var(--card2)', border:'1px solid var(--border)',
              borderRadius: futureOpen ? 'var(--rs2) var(--rs2) 0 0' : 'var(--rs2)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.45rem', fontSize:'.82rem', fontWeight:800, color:'var(--blue)' }}>
                🔵 المقررات القادمة
                <span style={{ fontSize:'.68rem', background:'var(--bs)', color:'var(--blue)', padding:'.12rem .5rem', borderRadius:10, fontWeight:700 }}>{futurePlans.length}</span>
              </div>
              <span style={{ color:'var(--text3)', transition:'transform .2s', transform: futureOpen?'rotate(180deg)':'rotate(0deg)', display:'inline-block' }}>▾</span>
            </div>
            {futureOpen && (
              <div style={{ border:'1px solid var(--border)', borderTop:'none', borderRadius:'0 0 var(--rs2) var(--rs2)', padding:'.65rem' }}>
                {futurePlans.map(plan => {
                  const m = typeMeta(plan)
                  return (
                    <div key={plan.id} style={{ background:'var(--card2)', border:'1px solid rgba(59,130,246,.18)', borderRight:'3px solid var(--blue)', borderRadius:'var(--rs2)', padding:'.75rem .9rem', marginBottom:'.4rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.4rem', marginBottom:'.4rem' }}>
                        <span style={{ fontSize:'.68rem', padding:'.15rem .55rem', borderRadius:12, fontWeight:800, background:m.bg, color:m.color }}>{m.label}</span>
                        <span style={{ fontSize:'.65rem', color:'var(--text3)' }}>يبدأ {plan.startDate}</span>
                      </div>
                      <PlanContent plan={plan}/>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── المقررات السابقة (منطوية) ── */}
        {pastPlans.length > 0 && (
          <div style={{ marginBottom:'.65rem' }}>
            <div onClick={() => setPastOpen(v=>!v)} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              cursor:'pointer', padding:'.55rem .75rem',
              background:'var(--card2)', border:'1px solid var(--border)',
              borderRadius: pastOpen ? 'var(--rs2) var(--rs2) 0 0' : 'var(--rs2)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.45rem', fontSize:'.82rem', fontWeight:800, color:'var(--text2)' }}>
                ⚫ المقررات السابقة
                <span style={{ fontSize:'.68rem', background:'var(--card3)', color:'var(--text3)', padding:'.12rem .5rem', borderRadius:10, fontWeight:700 }}>{pastPlans.length}</span>
              </div>
              <span style={{ color:'var(--text3)', transition:'transform .2s', transform: pastOpen?'rotate(180deg)':'rotate(0deg)', display:'inline-block' }}>▾</span>
            </div>
            {pastOpen && (
              <div style={{ border:'1px solid var(--border)', borderTop:'none', borderRadius:'0 0 var(--rs2) var(--rs2)', padding:'.65rem' }}>
                {pastPlans.map(plan => {
                  const m = typeMeta(plan)
                  const ev = plan.evaluation
                  return (
                    <div key={plan.id} style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRight:'3px solid var(--text3)', borderRadius:'var(--rs2)', padding:'.75rem .9rem', marginBottom:'.4rem' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.4rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
                          <span style={{ fontSize:'.68rem', padding:'.15rem .55rem', borderRadius:12, fontWeight:800, background:m.bg, color:m.color }}>{m.label}</span>
                          <span style={{ fontSize:'.65rem', color:'var(--text3)' }}>{plan.startDate}</span>
                        </div>
                        {ev && (
                          <div style={{ display:'flex', alignItems:'center', gap:'.3rem' }}>
                            <span style={{ fontSize:'.75rem', color:'var(--gold)' }}>{'★'.repeat(ev.stars||0)}{'☆'.repeat(3-(ev.stars||0))}</span>
                            <span style={{ fontSize:'.72rem', fontWeight:800, color:'var(--green)' }}>+{ev.points}</span>
                          </div>
                        )}
                      </div>
                      <PlanContent plan={plan}/>
                      {ev && (
                        <div style={{ marginTop:'.5rem', background:'rgba(34,197,94,.06)', border:'1px solid rgba(34,197,94,.18)', borderRadius:'var(--rx)', padding:'.6rem .75rem' }}>
                          {/* درجات التقييم */}
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem', marginBottom: ev.notes ? '.45rem' : 0 }}>
                            {plan.type === 'حفظ' && ev.newScore !== undefined && <>
                              <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>جديد: <strong style={{color:'var(--text)'}}>{ev.newScore}/40</strong> {ev.newPass ? '✓' : '✕'}</span>
                              <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>قريب: <strong style={{color:'var(--text)'}}>{ev.recentScore}/20</strong></span>
                              <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>قديم: <strong style={{color:'var(--text)'}}>{ev.oldScore}/40</strong> {ev.oldPass ? '✓' : '✕'}</span>
                            </>}
                            {plan.type === 'سرد' && ev.revScore !== undefined &&
                              <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>السرد: <strong style={{color:'var(--text)'}}>{ev.revScore}/100</strong> {ev.revPass ? '✓ يُجاز' : '✕ لا يُجاز'}</span>
                            }
                            {plan.type === 'تقييم مرحلة' && ev.phaseScore !== undefined &&
                              <span style={{ fontSize:'.7rem', background:'var(--card3)', borderRadius:6, padding:'.15rem .5rem', color:'var(--text2)' }}>التقييم: <strong style={{color:'var(--text)'}}>{ev.phaseScore}/100</strong></span>
                            }
                          </div>
                          {ev.notes && (
                            <div style={{ fontSize:'.72rem', color:'var(--text2)', borderTop: '1px solid rgba(34,197,94,.15)', paddingTop:'.35rem', marginTop:'.35rem' }}>
                              💬 {ev.notes}
                            </div>
                          )}
                        </div>
                      )}
                      {plan.dailyReports && Object.keys(plan.dailyReports).length > 0 && (
                        <div style={{ marginTop:'.4rem' }}>
                          <ReportedDays dailyReports={plan.dailyReports}/>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* TABBAR */}
      <div style={{ display:'flex', background:'var(--bg2)', borderTop:'1px solid var(--border)', position:'sticky', bottom:0 }}>
        {[['🏠','مقرراتي',true],['📊','إحصاءاتي',false]].map(([ico,lbl,active]) => (
          <div key={lbl} onClick={() => !active && showToast(`${ico} ${lbl} — قريباً`)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'.15rem', padding:'.65rem .3rem', cursor:'pointer', fontSize:'.66rem', fontWeight:700, color: active?'var(--green)':'var(--text3)' }}>
            <div style={{ fontSize:'1.25rem' }}>{ico}</div>{lbl}
          </div>
        ))}
      </div>

      {/* نافذة الملف الشخصي */}
      <ProfileModal open={showProfile} user={currentUser} onClose={() => setShowProfile(false)} onSave={handleProfileSave}/>

      {/* نافذة التقرير */}
      {modalState.open && (
        <DailyReportModal
          open={modalState.open}
          plan={modalState.plan}
          existingReport={modalState.existing}
          selectedDay={modalState.day}
          onClose={() => setModalState({ open:false, plan:null, day:null, existing:null })}
          onSave={saveReport}
          deadlineHour={deadlineHour}
        />
      )}
    </div>
  )
}
