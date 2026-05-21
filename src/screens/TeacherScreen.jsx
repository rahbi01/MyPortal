import { useState, useMemo, useEffect } from 'react'
import Avatar from '../components/Avatar.jsx'
import Btn from '../components/Btn.jsx'
import Modal from '../components/Modal.jsx'
import { TASKS_HAFIZ, DAYS_AR } from '../data.js'
import ProfileModal from '../components/ProfileModal.jsx'

// ── ثوابت ─────────────────────────────────────────────────────────────
// MY_STUDENT_IDS derived from assignments prop
const TEACHER_ID_DEFAULT = 1

const TYPE_META = {
  'حفظ':           { label:'📖 حفظ',               bg:'var(--gs)',    color:'var(--green)'  },
  'سرد-full':      { label:'🎙️ سرد كامل',           bg:'var(--bs)',    color:'var(--blue)'   },
  'سرد-review':    { label:'🔁 سرد مراجعة (مقاطع)', bg:'var(--golds)', color:'var(--gold)'   },
  'تقييم مرحلة':  { label:'⭐ تقييم مرحلة',         bg:'var(--golds)', color:'var(--gold)'   },
}
function planKey(p) { return p.type === 'سرد' ? `سرد-${p.sardSubtype}` : p.type }
function typeMeta(p) { return TYPE_META[planKey(p)] || { label:p.type, bg:'var(--card3)', color:'var(--text2)' } }

const STU_STATUS = { 1:'excellent', 2:'good', 5:'good', 4:'absent', 3:'needs' }
const STATUS_LABELS = {
  excellent:{ label:'ممتاز',        bg:'var(--gs)',    color:'var(--green)' },
  good:     { label:'جيد',           bg:'var(--bs)',    color:'var(--blue)'  },
  needs:    { label:'يحتاج متابعة', bg:'var(--golds)', color:'var(--gold)'  },
  absent:   { label:'غائب',         bg:'var(--rs)',    color:'var(--red)'   },
}

// ── مكوّن شارة النوع ──────────────────────────────────────────────────
function TypeBadge({ plan, size = '.68rem' }) {
  if (!plan) return null
  const m = typeMeta(plan)
  return (
    <span style={{ fontSize:size, padding:'.15rem .55rem', borderRadius:12, fontWeight:800, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>
      {m.label}
    </span>
  )
}

// ── مكوّن شارة حالة المقرر ────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    past:    { label:'سابق',  bg:'var(--card3)', color:'var(--text3)' },
    current: { label:'حالي',  bg:'var(--gs)',    color:'var(--green)' },
    future:  { label:'قادم',  bg:'var(--bs)',    color:'var(--blue)'  },
  }
  const s = map[status] || map.past
  return (
    <span style={{ fontSize:'.62rem', padding:'.12rem .5rem', borderRadius:10, fontWeight:800, background:s.bg, color:s.color }}>
      {s.label}
    </span>
  )
}

// ── عرض ملخص محتوى المقرر ────────────────────────────────────────────
function PlanSummary({ plan }) {
  if (plan.type === 'حفظ') return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.18rem', marginTop:'.35rem' }}>
      {[['الجديد', plan.newMem], ['القريب', plan.recentMem], ['القديم', plan.oldMem]].map(([l, v]) => v ? (
        <div key={l} style={{ display:'flex', gap:'.4rem', fontSize:'.75rem' }}>
          <span style={{ color:'var(--text3)', minWidth:42, flexShrink:0 }}>{l}</span>
          <span style={{ color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</span>
        </div>
      ) : null)}
    </div>
  )
  if (plan.type === 'سرد') return (
    <div style={{ fontSize:'.75rem', color:'var(--text2)', marginTop:'.3rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
      {plan.sardText}
      {plan.sardNotes ? <span style={{ color:'var(--text3)' }}> · {plan.sardNotes}</span> : null}
    </div>
  )
  if (plan.type === 'تقييم مرحلة') return (
    <div style={{ fontSize:'.75rem', color:'var(--text2)', marginTop:'.3rem' }}>{plan.phaseDesc}</div>
  )
  return null
}

// ── عرض نتيجة التقييم ────────────────────────────────────────────────
function EvalResult({ plan }) {
  const ev = plan.evaluation
  if (!ev) return (
    <div style={{ display:'flex', alignItems:'center', gap:'.4rem', marginTop:'.45rem', padding:'.35rem .6rem', background:'var(--card3)', borderRadius:'var(--rx)', fontSize:'.72rem', color:'var(--text3)' }}>
      <span>⏳</span>
      <span>{plan.status === 'future' ? 'لم يبدأ بعد' : 'في انتظار التقييم'}</span>
    </div>
  )

  const pts = ev.points || 0
  const stars = ev.stars || 0

  let scoreText = ''
  if (plan.type === 'حفظ') {
    const total = (ev.newScore||0) + (ev.recentScore||0) + (ev.oldScore||0)
    scoreText = `${ev.newScore}/40 · ${ev.recentScore}/20 · ${ev.oldScore}/40 = ${total}/100`
  } else if (plan.type === 'سرد') {
    scoreText = `${ev.revScore}/100 · ${ev.revPass ? 'يُجاز ✓' : 'لا يُجاز ✕'}`
  } else if (plan.type === 'تقييم مرحلة') {
    scoreText = `${ev.phaseScore}/80`
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'.45rem', padding:'.4rem .65rem', background:'rgba(34,197,94,.06)', border:'1px solid rgba(34,197,94,.15)', borderRadius:'var(--rx)' }}>
      <div>
        <div style={{ fontSize:'.7rem', color:'var(--text2)' }}>{scoreText}</div>
        {ev.notes ? <div style={{ fontSize:'.68rem', color:'var(--text3)', marginTop:'.1rem' }}>{ev.notes}</div> : null}
      </div>
      <div style={{ textAlign:'left', flexShrink:0 }}>
        <div style={{ fontSize:'.82rem', fontWeight:900, color:'var(--green)', lineHeight:1 }}>+{pts}</div>
        <div style={{ fontSize:'.75rem', color:'var(--gold)' }}>{'★'.repeat(stars)}{'☆'.repeat(3-stars)}</div>
      </div>
    </div>
  )
}

// ── بطاقة طالب مع كل مقرراته ─────────────────────────────────────────
function StudentCard({ stu, plans, onEval, onAddPlan }) {
  const [expanded, setExpanded] = useState(false)
  const st = STATUS_LABELS[STU_STATUS[stu.id]] || STATUS_LABELS.good

  const currentPlan = plans.find(p => p.status === 'current')
  const pastPlans   = plans.filter(p => p.status === 'past').sort((a,b) => b.startDate.localeCompare(a.startDate))
  const futurePlans = plans.filter(p => p.status === 'future').sort((a,b) => a.startDate.localeCompare(b.startDate))

  const hasFuture = futurePlans.length > 0

  return (
    <div style={{
      background:'var(--card)',
      border:'1px solid var(--border)',
      borderRadius:'var(--r)',
      marginBottom:'.75rem',
      overflow:'hidden',
    }}>
      {/* رأس البطاقة */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ display:'flex', alignItems:'center', gap:'.65rem', padding:'.85rem 1rem', cursor:'pointer', transition:'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.02)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >
        <Avatar text={stu.avatar} color={stu.color} size={40}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.4rem', marginBottom:'.2rem' }}>
            <span style={{ fontSize:'.88rem', fontWeight:800 }}>{stu.name}</span>
            <span style={{ fontSize:'.68rem', padding:'.12rem .5rem', borderRadius:10, fontWeight:800, background:st.bg, color:st.color }}>{st.label}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'.4rem', flexWrap:'wrap' }}>
            {currentPlan
              ? <TypeBadge plan={currentPlan}/>
              : <span style={{ fontSize:'.68rem', color:'var(--text3)' }}>لا يوجد مقرر حالي</span>
            }
            {hasFuture && (
              <span style={{ fontSize:'.62rem', color:'var(--blue)', background:'var(--bs)', padding:'.1rem .45rem', borderRadius:8, fontWeight:700 }}>
                +{futurePlans.length} قادم
              </span>
            )}
            {pastPlans.length > 0 && (
              <span style={{ fontSize:'.62rem', color:'var(--text3)' }}>{pastPlans.length} سابق</span>
            )}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', flexShrink:0 }}>
          {currentPlan && !currentPlan.evaluation && (
            <Btn variant="p" size="sm"
              onClick={e => { e.stopPropagation(); onEval(stu, currentPlan) }}
            >تقييم</Btn>
          )}
          <Btn size="sm"
            onClick={e => { e.stopPropagation(); onAddPlan(stu) }}
          >+ مقرر</Btn>
          <span style={{ color:'var(--text3)', fontSize:'.9rem', transition:'transform .2s', transform: expanded?'rotate(180deg)':'rotate(0deg)' }}>▾</span>
        </div>
      </div>

      {/* تفاصيل المقررات */}
      {expanded && (
        <div style={{ borderTop:'1px solid var(--border)', padding:'.75rem 1rem' }}>

          {/* المقرر الحالي */}
          {currentPlan && (
            <div style={{ marginBottom:'.75rem' }}>
              <div style={{ fontSize:'.72rem', fontWeight:800, color:'var(--text2)', marginBottom:'.4rem', display:'flex', alignItems:'center', gap:'.4rem' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px var(--green)', display:'inline-block' }}/>
                المقرر الحالي
              </div>
              <PlanItem plan={currentPlan} onEval={() => onEval(stu, currentPlan)} isCurrentOrFuture/>
            </div>
          )}

          {/* المقررات القادمة */}
          {futurePlans.length > 0 && (
            <div style={{ marginBottom:'.75rem' }}>
              <div style={{ fontSize:'.72rem', fontWeight:800, color:'var(--blue)', marginBottom:'.4rem', display:'flex', alignItems:'center', gap:'.4rem' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--blue)', display:'inline-block' }}/>
                المقررات القادمة
              </div>
              {futurePlans.map(plan => (
                <PlanItem key={plan.id} plan={plan} isCurrentOrFuture/>
              ))}
            </div>
          )}

          {/* المقررات السابقة */}
          {pastPlans.length > 0 && (
            <div>
              <div style={{ fontSize:'.72rem', fontWeight:800, color:'var(--text3)', marginBottom:'.4rem', display:'flex', alignItems:'center', gap:'.4rem' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--text3)', display:'inline-block' }}/>
                المقررات السابقة ({pastPlans.length})
              </div>
              {pastPlans.map(plan => (
                <PlanItem key={plan.id} plan={plan}/>
              ))}
            </div>
          )}

          {plans.length === 0 && (
            <div style={{ textAlign:'center', padding:'1rem', color:'var(--text3)', fontSize:'.8rem' }}>
              لا توجد مقررات بعد
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── بطاقة مقرر واحد ──────────────────────────────────────────────────
function PlanItem({ plan, onEval, isCurrentOrFuture }) {
  const m = typeMeta(plan)
  const borderColor = plan.status==='current' ? 'rgba(34,197,94,.25)' : plan.status==='future' ? 'rgba(59,130,246,.2)' : 'var(--border)'

  return (
    <div style={{
      background:'var(--card2)',
      border:`1px solid ${borderColor}`,
      borderRight:`3px solid ${m.color}`,
      borderRadius:'var(--rs2)',
      padding:'.7rem .85rem',
      marginBottom:'.45rem',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
          <TypeBadge plan={plan}/>
          <StatusPill status={plan.status}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
          <span style={{ fontSize:'.65rem', color:'var(--text3)' }}>{plan.startDate}</span>
          {plan.status === 'current' && !plan.evaluation && onEval && (
            <Btn variant="p" size="sm" onClick={onEval}>تقييم</Btn>
          )}
        </div>
      </div>
      <PlanSummary plan={plan}/>
      <EvalResult plan={plan}/>
    </div>
  )
}

// ── نموذج إضافة مقرر ─────────────────────────────────────────────────
function AddPlanModal({ open, targetStudent, students, teacherId, onClose, onSave }) {
  const [selectedStudentId, setSelectedStudentId] = useState(targetStudent?.id || null)
  const [planType,  setPlanType]  = useState('حفظ')
  const [sardType,  setSardType]  = useState('full')
  const [startDate, setStartDate] = useState('')
  const [newMem,    setNewMem]    = useState('')
  const [recentMem, setRecentMem] = useState('')
  const [oldMem,    setOldMem]    = useState('')
  const [sardText,  setSardText]  = useState('')
  const [sardNotes, setSardNotes] = useState('')
  const [phaseDesc, setPhaseDesc] = useState('')
  const [notes,     setNotes]     = useState('')

  // إعادة ضبط الطالب عند فتح المودال
  useEffect(() => { setSelectedStudentId(targetStudent?.id || null) }, [targetStudent])

  function reset() {
    setPlanType('حفظ'); setSardType('full'); setStartDate('')
    setNewMem(''); setRecentMem(''); setOldMem('')
    setSardText(''); setSardNotes(''); setPhaseDesc(''); setNotes('')
  }

  function handleSave() {
    if (!selectedStudentId) return
    const chosenDate = startDate || new Date().toISOString().slice(0,10)
    const today = new Date(); today.setHours(0,0,0,0)
    const start = new Date(chosenDate); start.setHours(0,0,0,0)
    const end   = new Date(start); end.setDate(end.getDate() + 6)
    const autoStatus = today < start ? 'future' : today <= end ? 'current' : 'past'
    const plan = {
      studentId: selectedStudentId,
      teacherId: teacherId,
      type: planType,
      sardSubtype: planType === 'سرد' ? sardType : null,
      startDate: chosenDate,
      newMem:    planType === 'حفظ' ? newMem    : null,
      recentMem: planType === 'حفظ' ? recentMem : null,
      oldMem:    planType === 'حفظ' ? oldMem    : null,
      sardText:  planType === 'سرد' ? sardText  : null,
      sardNotes: planType === 'سرد' ? sardNotes : null,
      phaseDesc: planType === 'تقييم مرحلة' ? phaseDesc : null,
      notes,
      status: autoStatus,
      evaluation: null,
      dailyReports: {},
    }
    onSave(plan)
    reset()
  }

  const inp = (label, val, setVal, ph, type='text') => (
    <div style={{ marginBottom:'.6rem' }}>
      <div style={{ fontSize:'.74rem', color:'var(--text2)', marginBottom:'.25rem', fontWeight:700 }}>{label}</div>
      <input type={type} value={val} onChange={e=>setVal(e.target.value)} placeholder={ph}
        style={{ width:'100%', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rx)', padding:'.48rem .7rem', color:'var(--text)', fontFamily:'inherit', fontSize:'.82rem' }}/>
    </div>
  )

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="➕ إضافة مقرر أسبوعي" maxWidth={460}>

      {/* اختيار الطالب */}
      <div style={{ marginBottom:'.85rem' }}>
        <div style={{ fontSize:'.78rem', color:'var(--text2)', fontWeight:700, marginBottom:'.4rem' }}>
          الطالب <span style={{ color:'var(--red)' }}>*</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'.3rem' }}>
          {students.map(s => (
            <div key={s.id} onClick={() => setSelectedStudentId(s.id)} style={{
              display:'flex', alignItems:'center', gap:'.6rem',
              padding:'.5rem .75rem', borderRadius:'var(--rs2)',
              border:`2px solid ${selectedStudentId===s.id ? 'var(--green)' : 'var(--border)'}`,
              background: selectedStudentId===s.id ? 'var(--gs)' : 'var(--card2)',
              cursor:'pointer', transition:'all .15s',
            }}>
              <Avatar text={s.avatar} color={s.color} size={30}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'.82rem', fontWeight:700, color: selectedStudentId===s.id ? 'var(--green)' : 'var(--text)' }}>{s.name}</div>
                <div style={{ fontSize:'.68rem', color:'var(--text3)' }}>{s.level}</div>
              </div>
              {selectedStudentId === s.id && <span style={{ color:'var(--green)', fontWeight:900 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* نوع المقرر */}
      <div style={{ marginBottom:'.75rem' }}>
        <div style={{ fontSize:'.78rem', color:'var(--text2)', fontWeight:700, marginBottom:'.4rem' }}>نوع المقرر</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.4rem' }}>
          {[['حفظ','📖','var(--green)','var(--gs)'],['سرد','🎙️','var(--purple)','var(--ps)'],['تقييم مرحلة','⭐','var(--gold)','var(--golds)']].map(([t,ico,c,bg]) => (
            <div key={t} onClick={() => setPlanType(t)} style={{
              background: planType===t ? bg : 'var(--card2)',
              border:`2px solid ${planType===t ? c : 'var(--border)'}`,
              borderRadius:'var(--rs2)', padding:'.7rem .4rem', textAlign:'center',
              cursor:'pointer', fontSize:'.78rem', fontWeight:700,
              color: planType===t ? c : 'var(--text2)', transition:'all .15s',
            }}>{ico} {t}</div>
          ))}
        </div>
      </div>

      {/* تاريخ البدء */}
      {inp('تاريخ البدء (الأحد)', startDate, setStartDate, '', 'date')}

      {/* حقول حفظ */}
      {planType === 'حفظ' && <>
        {inp('الحفظ الجديد', newMem, setNewMem, 'مثال: الآيات 1-10 من سورة البقرة')}
        {inp('الحفظ القريب', recentMem, setRecentMem, 'مثال: سورة الملك كاملة')}
        {inp('الحفظ القديم', oldMem, setOldMem, 'مثال: جزء عم كاملاً')}
      </>}

      {/* حقول سرد */}
      {planType === 'سرد' && <>
        <div style={{ marginBottom:'.6rem' }}>
          <div style={{ fontSize:'.74rem', color:'var(--text2)', fontWeight:700, marginBottom:'.35rem' }}>نوع السرد</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.4rem' }}>
            {[['full','📖 سرد كامل','سرد كامل للمقرر'],['review','🔁 مراجعة (مقاطع)','مراجعة مقاطع محددة']].map(([v,t,d]) => (
              <div key={v} onClick={() => setSardType(v)} style={{
                background: sardType===v ? 'var(--bs)' : 'var(--card2)',
                border:`2px solid ${sardType===v ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius:'var(--rs2)', padding:'.6rem', cursor:'pointer', textAlign:'center', transition:'all .15s',
              }}>
                <div style={{ fontSize:'.78rem', fontWeight:800, color: sardType===v ? 'var(--blue)' : 'var(--text)' }}>{t}</div>
                <div style={{ fontSize:'.66rem', color:'var(--text2)', marginTop:'.1rem' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
        {inp(sardType==='full'?'مقرر السرد الكامل':'مقاطع المراجعة', sardText, setSardText, sardType==='full'?'مثال: سورة الكهف كاملة':'مثال: آل عمران 1-50')}
        {inp('ملاحظات السرد (اختياري)', sardNotes, setSardNotes, 'ملاحظات...')}
      </>}

      {/* حقول تقييم مرحلة */}
      {planType === 'تقييم مرحلة' && <>
        <div style={{ background:'var(--golds)', border:'1px solid rgba(245,158,11,.2)', borderRadius:'var(--rx)', padding:'.55rem .8rem', marginBottom:'.6rem', fontSize:'.76rem', color:'var(--gold)' }}>
          ⭐ الدرجة من 80 — لتقييم تقدم الطالب في جزء محدد.
        </div>
        {inp('وصف المرحلة', phaseDesc, setPhaseDesc, 'مثال: تقييم جزء عم، سورة البقرة...')}
      </>}

      {/* ملاحظات عامة */}
      <div style={{ marginBottom:'.65rem' }}>
        <div style={{ fontSize:'.74rem', color:'var(--text2)', fontWeight:700, marginBottom:'.25rem' }}>ملاحظات عامة (اختياري)</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
          style={{ width:'100%', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rx)', padding:'.48rem .7rem', color:'var(--text)', fontFamily:'inherit', fontSize:'.8rem', resize:'none' }}/>
      </div>

      <div style={{ display:'flex', gap:'.5rem' }}>
        <Btn style={{ flex:1, justifyContent:'center' }} onClick={() => { reset(); onClose() }}>إلغاء</Btn>
        <Btn variant="p" style={{ flex:1, justifyContent:'center' }} disabled={!selectedStudentId} onClick={handleSave}>💾 حفظ المقرر</Btn>
      </div>
    </Modal>
  )
}

// ── نموذج التقييم ────────────────────────────────────────────────────
function EvalModal({ open, student, plan, onClose, onSave }) {
  const [scores, setScores] = useState({ new:35, recent:18, old:38, rev:88, phase:68 })
  const [passes, setPasses] = useState({ new:true, old:true, rev:true, phase:true })
  const [evalNotes, setEvalNotes] = useState('')

  if (!plan) return null

  const pts = () => {
    if (plan.type === 'حفظ') return Math.floor((scores.new + scores.recent + scores.old) / 10)
    if (plan.type === 'سرد') return Math.floor(scores.rev / 10)
    if (plan.type === 'تقييم مرحلة') return Math.floor(scores.phase / 10)
    return 0
  }
  const p = pts()
  const stars = p>=9?3:p>=6?2:p>=3?1:0

  function scoreField(label, key, max, showPass, passKey) {
    return (
      <div style={{ marginBottom:'.9rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', color:'var(--text2)', marginBottom:'.35rem' }}>
          <span>{label} <span style={{ color:'var(--text3)', fontSize:'.68rem' }}>من {max}</span></span>
          <strong style={{ color:'var(--text)', fontSize:'.92rem' }}>{scores[key]}</strong>
        </div>
        <input type="range" min={0} max={max} value={scores[key]}
          onChange={e => setScores(prev => ({...prev, [key]:+e.target.value}))}
          style={{ width:'100%' }}/>
        {showPass && (
          <div style={{ display:'flex', gap:'.4rem', marginTop:'.35rem' }}>
            {[true,false].map(v => (
              <button key={String(v)} onClick={() => setPasses(prev => ({...prev, [passKey]:v}))} style={{
                flex:1, padding:'.38rem', borderRadius:'var(--rx)', border:'1px solid var(--border)',
                background: passes[passKey]===v ? (v?'rgba(34,197,94,.18)':'var(--rs)') : 'var(--card2)',
                color: passes[passKey]===v ? (v?'var(--green)':'var(--red)') : 'var(--text2)',
                fontSize:'.76rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              }}>{v ? '✓ يُجاز' : '✕ لا يُجاز'}</button>
            ))}
          </div>
        )}
      </div>
    )
  }

  function handleSave() {
    const ev = {}
    if (plan.type === 'حفظ') {
      Object.assign(ev, { newScore:scores.new, recentScore:scores.recent, oldScore:scores.old, newPass:passes.new, oldPass:passes.old })
    } else if (plan.type === 'سرد') {
      Object.assign(ev, { revScore:scores.rev, revPass:passes.rev })
    } else {
      Object.assign(ev, { phaseScore:scores.phase, phasePass:passes.phase })
    }
    Object.assign(ev, { notes:evalNotes, points:p, stars, date:new Date().toISOString().slice(0,10) })
    onSave(plan.id, ev)
  }

  const m = typeMeta(plan)

  return (
    <Modal open={open} onClose={onClose} title={`📝 تقييم: ${student?.name || ''}`} maxWidth={420}>
      {/* info */}
      <div style={{ display:'flex', alignItems:'center', gap:'.5rem', padding:'.55rem .8rem', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rs2)', marginBottom:'1rem', fontSize:'.78rem' }}>
        <TypeBadge plan={plan}/>
        <span style={{ color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {plan.type==='حفظ' ? plan.newMem : plan.type==='سرد' ? plan.sardText : plan.phaseDesc}
        </span>
      </div>

      {plan.type==='حفظ' && <>
        {scoreField('الحفظ الجديد', 'new', 40, true, 'new')}
        {scoreField('الحفظ القريب', 'recent', 20, false, null)}
        {scoreField('الحفظ القديم', 'old', 40, true, 'old')}
      </>}
      {plan.type==='سرد' && scoreField('درجة السرد', 'rev', 100, true, 'rev')}
      {plan.type==='تقييم مرحلة' && scoreField('درجة التقييم', 'phase', 100, true, 'phase')}

      {/* نقاط */}
      <div style={{ background:'var(--gs)', border:'1px solid rgba(34,197,94,.2)', borderRadius:'var(--rs2)', padding:'.65rem', margin:'.75rem 0', textAlign:'center' }}>
        <div style={{ fontSize:'.68rem', color:'var(--green)', marginBottom:'.2rem' }}>النقاط المتوقعة</div>
        <div style={{ fontSize:'1.8rem', fontWeight:900, color:'var(--green)', lineHeight:1 }}>{p}</div>
        <div style={{ fontSize:'.9rem', color:'var(--gold)', marginTop:'.15rem' }}>{'★'.repeat(stars)}{'☆'.repeat(3-stars)}</div>
        <div style={{ fontSize:'.66rem', color:'var(--text2)', marginTop:'.15rem' }}>كل 30 نقطة = نجمة في الدورة</div>
      </div>

      <div style={{ marginBottom:'.65rem' }}>
        <div style={{ fontSize:'.74rem', color:'var(--text2)', fontWeight:700, marginBottom:'.25rem' }}>ملاحظات</div>
        <textarea value={evalNotes} onChange={e=>setEvalNotes(e.target.value)} rows={2} placeholder="ملاحظات التقييم..."
          style={{ width:'100%', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rx)', padding:'.48rem .7rem', color:'var(--text)', fontFamily:'inherit', fontSize:'.8rem', resize:'none' }}/>
      </div>

      <div style={{ display:'flex', gap:'.5rem' }}>
        <Btn style={{ flex:1, justifyContent:'center' }} onClick={onClose}>إلغاء</Btn>
        <Btn variant="p" style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>✓ حفظ التقييم</Btn>
      </div>
    </Modal>
  )
}

// ── الشاشة الرئيسية للمعلم ───────────────────────────────────────────
export default function TeacherScreen({ currentUser, allUsers, plans: allPlans, assignments, onLogout, onUpdateUser, onUpdatePlans, showToast }) {
  const myTeacherId = currentUser?.id || TEACHER_ID_DEFAULT
  const myStudentIds = assignments?.[myTeacherId] || []
  const allStudents = (allUsers || []).filter(u => u.role === 'student')
  const myStudents = allStudents.filter(s => myStudentIds.includes(s.id))
  const [showProfile, setShowProfile] = useState(false)

  const [plans, setPlans] = useState(allPlans || [])
  const [evalState, setEvalState] = useState({ open:false, student:null, plan:null })
  const [addState,  setAddState]  = useState({ open:false, student:null })

  // تجميع المقررات لكل طالب
  const plansByStudent = useMemo(() => {
    const map = {}
    myStudents.forEach(s => { map[s.id] = [] })
    plans.forEach(p => { if (map[p.studentId]) map[p.studentId].push(p) })
    return map
  }, [plans, myStudents, allPlans])

  // إحصاءات سريعة
  const pendingEvals = plans.filter(p => p.status === 'current' && !p.evaluation && myStudentIds.includes(p.studentId)).length
  const pct          = plans.filter(p => p.status === 'current' && p.evaluation  && myStudentIds.includes(p.studentId)).length
  const currentCount = plans.filter(p => p.status === 'current' && myStudentIds.includes(p.studentId)).length
  const commitPct = currentCount > 0 ? Math.round(pct/currentCount*100) : 0

  function openEval(stu, plan) {
    setEvalState({ open:true, student:stu, plan })
  }

  function saveEval(planId, evaluation) {
    const evalUpdater = prev => prev.map(p => p.id === planId ? {...p, evaluation} : p)
    setPlans(evalUpdater)
    if (onUpdatePlans) onUpdatePlans(evalUpdater)
    setEvalState({ open:false, student:null, plan:null })
    showToast('✅ تم حفظ التقييم بنجاح', 'ok')
  }

  function openAddPlan(stu = null) {
    setAddState({ open:true, student:stu })
  }

  function savePlan(planData) {
    const newPlan = { ...planData, id: Date.now() }
    const updater = prev => [...prev, newPlan]
    setPlans(updater)
    if (onUpdatePlans) onUpdatePlans(updater)
    setAddState({ open:false, student:null })
    showToast('✅ تم إضافة المقرر بنجاح', 'ok')
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', maxWidth:680, margin:'0 auto' }}>

      {/* TOPBAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.7rem 1rem', background:'var(--bg2)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontWeight:800, fontSize:'1.05rem' }}>🎓 لوحة المعلم</div>
        <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.35rem', background:'var(--card)', border:'1px solid var(--border)', borderRadius:20, padding:'.28rem .75rem', fontSize:'.76rem', fontWeight:600 }}>
            🎓 الشيخ عمر
          </div>
          <Btn variant="out" size="sm" onClick={onLogout}>خروج</Btn>
        </div>
      </div>

      <div style={{ flex:1, padding:'1rem', overflowY:'auto' }}>

        {/* إحصاءات */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.6rem', marginBottom:'.85rem' }}>
          {[
            [myStudents.length, 'طلابي',          'var(--green)'],
            [pendingEvals,      'تقييمات معلقة',  pendingEvals>0 ? 'var(--gold)' : 'var(--text2)'],
            [`${commitPct}%`,   'الالتزام',       'var(--blue)'],
          ].map(([n,l,c]) => (
            <div key={l} style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--rs2)', padding:'.85rem', textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', fontWeight:900, color:c, lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:'.68rem', color:'var(--text2)', marginTop:'.2rem' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* رأس قائمة الطلاب */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.7rem' }}>
          <div style={{ fontSize:'.9rem', fontWeight:800 }}>👥 طلابي</div>
          <Btn variant="p" size="sm" onClick={() => openAddPlan(null)}>+ مقرر جديد</Btn>
        </div>

        {/* بطاقات الطلاب */}
        {myStudents.map(stu => (
          <StudentCard
            key={stu.id}
            stu={stu}
            plans={plansByStudent[stu.id] || []}
            onEval={openEval}
            onAddPlan={openAddPlan}
          />
        ))}

        {/* أدوات */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem', marginTop:'.3rem' }}>
          <Btn style={{ justifyContent:'center' }} onClick={() => showToast('⚠️ طلاب لم يرسلوا تقاريرهم')}>⚠️ المتأخرون</Btn>
          <Btn style={{ justifyContent:'center' }} onClick={() => showToast('📥 جاري التحميل...')}>📥 تصدير</Btn>
        </div>
      </div>

      {/* TABBAR */}
      <div style={{ display:'flex', background:'var(--bg2)', borderTop:'1px solid var(--border)', position:'sticky', bottom:0 }}>
        {[['👥','طلابي']].map(([ico,lbl],i) => (
          <div key={lbl} onClick={() => i!==0 && showToast(`${ico} ${lbl} — قريباً`)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'.15rem', padding:'.6rem .3rem', cursor:'pointer', fontSize:'.62rem', fontWeight:700, color: i===0?'var(--green)':'var(--text3)' }}>
            <div style={{ fontSize:'1.1rem' }}>{ico}</div>{lbl}
          </div>
        ))}
      </div>

      {/* MODALS */}
      <ProfileModal open={showProfile} user={currentUser} onClose={() => setShowProfile(false)} onSave={changes => { onUpdateUser(changes); setShowProfile(false); showToast('✅ تم حفظ التعديلات','ok') }}/>

      <EvalModal
        open={evalState.open}
        student={evalState.student}
        plan={evalState.plan}
        onClose={() => setEvalState({ open:false, student:null, plan:null })}
        onSave={saveEval}
      />

      <AddPlanModal
        open={addState.open}
        targetStudent={addState.student}
        students={myStudents}
        teacherId={myTeacherId}
        onClose={() => setAddState({ open:false, student:null })}
        onSave={savePlan}
      />
    </div>
  )
}
