import { useState } from 'react'
import { STUDENTS, TEACHERS, PLANS, calcPoints } from '../data.js'
import { Modal, Btn, Card, SH, Stars, PassBtns, Inp, Avatar, Badge, toast } from '../components/UI.jsx'

// ─── Eval Modal ───────────────────────────────────────────────────
function EvalModal({ student, plan, open, onClose }) {
  const isHafiz = plan?.planType === 'حفظ'
  const isSard  = plan?.planType === 'سرد'
  const isPhase = plan?.planType === 'تقييم مرحلة'

  const [newScore,      setNewScore]      = useState(35)
  const [newPass,       setNewPass]       = useState(true)
  const [recentScore,   setRecentScore]   = useState(18)
  const [oldScore,      setOldScore]      = useState(38)
  const [oldPass,       setOldPass]       = useState(true)
  const [revScore,      setRevScore]      = useState(88)
  const [revPass,       setRevPass]       = useState(true)
  const [phaseScore,    setPhaseScore]    = useState(68)
  const [phasePass,     setPhasePass]     = useState(true)
  const [notes,         setNotes]         = useState('')

  const eval_ = isHafiz
    ? { newScore, recentScore, oldScore }
    : isSard ? { revisionScore: revScore }
    : { phaseScore }
  const { pts, stars } = plan ? calcPoints(plan, eval_) : { pts: 0, stars: 0 }

  const save = () => { onClose(); toast('✅ تم حفظ التقييم بنجاح', 'ok') }

  if (!plan || !student) return null

  return (
    <Modal open={open} onClose={onClose} title={`📝 تقييم: ${student.name}`} maxWidth="420px">
      {/* Plan info banner */}
      <div style={{
        padding: '.6rem .85rem', borderRadius: 'var(--rs2)', marginBottom: '1rem', fontSize: '.78rem',
        background: isHafiz ? 'var(--gs)' : isSard ? 'var(--bs)' : 'var(--golds)',
        border: `1px solid ${isHafiz ? 'rgba(34,197,94,.2)' : isSard ? 'rgba(59,130,246,.2)' : 'rgba(245,158,11,.2)'}`,
        color: isHafiz ? 'var(--green)' : isSard ? 'var(--blue)' : 'var(--gold)',
      }}>
        {isHafiz && `📖 حفظ · الجديد: ${plan.newMem}`}
        {isSard  && `🎙️ ${plan.sardSubtype === 'full' ? 'سرد كامل' : 'مراجعة (مقاطع)'} · ${plan.revisionText}`}
        {isPhase && `⭐ تقييم مرحلة · الدرجة من 80`}
      </div>

      {/* Score fields */}
      {isHafiz && (
        <>
          <ScoreField label={`الحفظ الجديد (${plan.newMem})`} max={40} value={newScore} onChange={setNewScore} pass={newPass} onPassChange={setNewPass} />
          <ScoreField label={`الحفظ القريب (${plan.recentMem})`} max={20} value={recentScore} onChange={setRecentScore} />
          <ScoreField label={`الحفظ القديم (${plan.oldMem})`} max={40} value={oldScore} onChange={setOldScore} pass={oldPass} onPassChange={setOldPass} />
        </>
      )}
      {isSard && (
        <ScoreField label={`مقرر السرد (${plan.revisionText})`} max={100} value={revScore} onChange={setRevScore} pass={revPass} onPassChange={setRevPass} />
      )}
      {isPhase && (
        <ScoreField label="درجة تقييم المرحلة" max={80} value={phaseScore} onChange={setPhaseScore} pass={phasePass} onPassChange={setPhasePass} />
      )}

      {/* Notes */}
      <div style={{ marginBottom: '.8rem' }}>
        <div style={{ fontSize: '.72rem', color: 'var(--text2)', marginBottom: '.25rem', fontWeight: 700 }}>ملاحظات</div>
        <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات التقييم..."
          style={{ width: '100%', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 'var(--rx)', padding: '.48rem .7rem', color: 'var(--text)', fontFamily: 'inherit', fontSize: '.8rem', resize: 'none', outline: 'none' }}
        />
      </div>

      {/* Points preview */}
      <div style={{ background: 'var(--gs)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 'var(--rs2)', padding: '.7rem', marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '.7rem', color: 'var(--green)', marginBottom: '.25rem' }}>النقاط المتوقعة</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>{pts}</div>
        <div style={{ marginTop: '.2rem' }}><Stars count={stars} /></div>
        <div style={{ fontSize: '.66rem', color: 'var(--text2)', marginTop: '.2rem' }}>كل 30 نقطة = نجمة في الدورة</div>
      </div>

      <div style={{ display: 'flex', gap: '.5rem' }}>
        <Btn ghost onClick={onClose} style={{ flex: 1 }}>إلغاء</Btn>
        <Btn primary onClick={save} style={{ flex: 1, justifyContent: 'center' }}>✓ حفظ التقييم</Btn>
      </div>
    </Modal>
  )
}

function ScoreField({ label, max, value, onChange, pass, onPassChange }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.78rem', color: 'var(--text2)', marginBottom: '.35rem' }}>
        <span>{label} <span style={{ fontSize: '.68rem' }}>من {max}</span></span>
        <strong style={{ fontSize: '.92rem', color: 'var(--text)' }}>{value}</strong>
      </div>
      <input type="range" min={0} max={max} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: 'var(--green)', cursor: 'pointer', height: 5 }} />
      {onPassChange && <PassBtns value={pass} onChange={onPassChange} />}
    </div>
  )
}

// ─── Add Plan Modal ───────────────────────────────────────────────
function AddPlanModal({ open, onClose }) {
  const [planType,   setPlanType]   = useState('حفظ')
  const [sardType,   setSardType]   = useState('full')
  const [startDate,  setStartDate]  = useState('')
  const [newMem,     setNewMem]     = useState('')
  const [recentMem,  setRecentMem]  = useState('')
  const [oldMem,     setOldMem]     = useState('')
  const [sardText,   setSardText]   = useState('')
  const [sardNotes,  setSardNotes]  = useState('')
  const [phaseDesc,  setPhaseDesc]  = useState('')
  const [notes,      setNotes]      = useState('')

  const save = () => {
    if (!startDate) { toast('⚠️ يرجى تحديد تاريخ البدء', 'warn'); return }
    const d = new Date(startDate)
    if (d.getDay() !== 0) { toast('⚠️ تاريخ البدء يجب أن يكون الأحد', 'warn'); return }
    onClose(); toast('✅ تم حفظ المقرر الأسبوعي', 'ok')
  }

  const TypeBtn = ({ type, label, icon }) => (
    <div onClick={() => setPlanType(type)} style={{
      background: planType === type ? (type === 'حفظ' ? 'var(--gs)' : type === 'سرد' ? 'var(--ps)' : 'var(--golds)') : 'var(--card2)',
      border: `2px solid ${planType === type ? (type === 'حفظ' ? 'var(--green)' : type === 'سرد' ? 'var(--purple)' : 'var(--gold)') : 'var(--border)'}`,
      borderRadius: 'var(--rs2)', padding: '.8rem .5rem', textAlign: 'center', cursor: 'pointer',
      fontSize: '.8rem', fontWeight: 700, transition: '.15s',
      color: planType === type ? (type === 'حفظ' ? 'var(--green)' : type === 'سرد' ? 'var(--purple)' : 'var(--gold)') : 'var(--text2)',
    }}>{icon} {label}</div>
  )

  return (
    <Modal open={open} onClose={onClose} title="➕ إضافة مقرر أسبوعي" maxWidth="420px">
      <div style={{ fontSize: '.76rem', color: 'var(--text2)', marginBottom: '.5rem', fontWeight: 700 }}>نوع المقرر</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.45rem', marginBottom: '1rem' }}>
        <TypeBtn type="حفظ" label="حفظ" icon="📖" />
        <TypeBtn type="سرد" label="سرد" icon="🎙️" />
        <TypeBtn type="تقييم مرحلة" label="تقييم مرحلة" icon="⭐" />
      </div>

      <Inp label="تاريخ البدء (الأحد فقط)" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />

      {planType === 'حفظ' && (
        <>
          <Inp label="الحفظ الجديد" placeholder="مثال: الآيات 1-10 من سورة البقرة" value={newMem} onChange={e => setNewMem(e.target.value)} />
          <Inp label="الحفظ القريب" placeholder="مثال: سورة الملك كاملة" value={recentMem} onChange={e => setRecentMem(e.target.value)} />
          <Inp label="الحفظ القديم"  placeholder="مثال: جزء عم كاملاً" value={oldMem} onChange={e => setOldMem(e.target.value)} />
        </>
      )}

      {planType === 'سرد' && (
        <>
          <div style={{ fontSize: '.74rem', color: 'var(--text2)', marginBottom: '.45rem', fontWeight: 700 }}>نوع السرد</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem', marginBottom: '.75rem' }}>
            {[{ v: 'full', t: '📖 سرد كامل', d: 'سرد كامل للمقرر' }, { v: 'review', t: '🔁 مراجعة (مقاطع)', d: 'مراجعة مقاطع محددة' }].map(s => (
              <div key={s.v} onClick={() => setSardType(s.v)} style={{
                background: sardType === s.v ? 'var(--bs)' : 'var(--card2)',
                border: `2px solid ${sardType === s.v ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius: 'var(--rs2)', padding: '.65rem', textAlign: 'center', cursor: 'pointer',
              }}>
                <div style={{ fontSize: '.8rem', fontWeight: 800, color: sardType === s.v ? 'var(--blue)' : 'var(--text)' }}>{s.t}</div>
                <div style={{ fontSize: '.67rem', color: 'var(--text2)', marginTop: '.15rem' }}>{s.d}</div>
              </div>
            ))}
          </div>
          <Inp label={sardType === 'full' ? 'مقرر السرد الكامل' : 'مقاطع المراجعة'} placeholder={sardType === 'full' ? 'مثال: سورة الكهف كاملة' : 'مثال: الآيات 1-50 من سورة البقرة'} value={sardText} onChange={e => setSardText(e.target.value)} />
          <div style={{ fontSize: '.72rem', color: 'var(--text2)', marginBottom: '.25rem', fontWeight: 700 }}>ملاحظات السرد (اختياري)</div>
          <textarea rows={2} value={sardNotes} onChange={e => setSardNotes(e.target.value)} placeholder="تفاصيل إضافية عن السرد..."
            style={{ width: '100%', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 'var(--rx)', padding: '.48rem .7rem', color: 'var(--text)', fontFamily: 'inherit', fontSize: '.8rem', resize: 'none', outline: 'none', marginBottom: '.55rem' }} />
        </>
      )}

      {planType === 'تقييم مرحلة' && (
        <>
          <div style={{ background: 'var(--golds)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 'var(--rs2)', padding: '.6rem .85rem', marginBottom: '.75rem', fontSize: '.76rem', color: 'var(--gold)' }}>
            ⭐ الدرجة من 80. يُستخدم لتقييم تقدم الطالب في جزء محدد.
          </div>
          <Inp label="وصف المرحلة" placeholder="مثال: تقييم جزء عم، تقييم سورة البقرة..." value={phaseDesc} onChange={e => setPhaseDesc(e.target.value)} />
        </>
      )}

      <div style={{ fontSize: '.72rem', color: 'var(--text2)', marginBottom: '.25rem', fontWeight: 700 }}>ملاحظات عامة (اختياري)</div>
      <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات حول المقرر..."
        style={{ width: '100%', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 'var(--rx)', padding: '.48rem .7rem', color: 'var(--text)', fontFamily: 'inherit', fontSize: '.8rem', resize: 'none', outline: 'none', marginBottom: '.55rem' }} />

      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
        <Btn ghost onClick={onClose} style={{ flex: 1 }}>إلغاء</Btn>
        <Btn primary onClick={save} style={{ flex: 1, justifyContent: 'center' }}>💾 حفظ المقرر</Btn>
      </div>
    </Modal>
  )
}

// ─── Teacher Screen ───────────────────────────────────────────────
const TEACHER_STUDENTS = [
  { id: 1, name: 'يوسف العمري',    initials: 'يع', color: 'g', planType: 'حفظ',          sardSubtype: null,     planDesc: 'الآيات 1-20 سورة فاطر', status: 'g' },
  { id: 2, name: 'حمزة الفارسي',   initials: 'حف', color: 'b', planType: 'سرد',          sardSubtype: 'full',   planDesc: 'سورة يس كاملة',          status: 'g' },
  { id: 3, name: 'عبدالله الشمري', initials: 'عش', color: 'o', planType: 'سرد',          sardSubtype: 'review', planDesc: 'آل عمران 1-50',           status: 'o' },
  { id: 4, name: 'خالد الزهراني', initials: 'خز', color: 'g', planType: 'تقييم مرحلة', sardSubtype: null,     planDesc: 'تقييم جزء عم كاملاً',     status: 'o' },
  { id: 5, name: 'محمد التميمي',   initials: 'مت', color: 'r', planType: 'حفظ',          sardSubtype: null,     planDesc: 'سورة البقرة 1-30',        status: 'r' },
  { id: 6, name: 'إبراهيم السالم', initials: 'إس', color: 'p', planType: 'سرد',          sardSubtype: 'full',   planDesc: 'الجزء 28 كاملاً',         status: 'g' },
]

const STATUS_LABELS = { g: { label: 'ممتاز', color: 'g' }, o: { label: 'يحتاج متابعة', color: 'o' }, r: { label: 'غائب', color: 'r' } }
const TYPE_LABELS   = { 'حفظ': '📖 حفظ', 'سرد': '🎙️ سرد', 'تقييم مرحلة': '⭐ تقييم مرحلة' }

export default function TeacherScreen({ onLogout }) {
  const [evalTarget, setEvalTarget] = useState(null)
  const [addPlanOpen, setAddPlanOpen] = useState(false)

  const openEval = s => setEvalTarget(s)

  const getPlanForStudent = s => ({
    planType: s.planType, sardSubtype: s.sardSubtype,
    newMem: 'الآيات 1-20 سورة فاطر', recentMem: 'الجزء 21', oldMem: 'الجزء 18',
    revisionText: s.planDesc, revisionNotes: '',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: 680, margin: '0 auto' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.7rem 1rem', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800 }}>🎓 لوحة المعلم</div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '.28rem .75rem', fontSize: '.76rem', fontWeight: 600 }}>🎓 الشيخ عمر</div>
          <Btn danger small onClick={onLogout}>خروج</Btn>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.6rem', marginBottom: '.85rem' }}>
          {[{ n: '12', l: 'طلابي', c: 'var(--green)' }, { n: '3', l: 'تقارير معلقة', c: 'var(--gold)' }, { n: '89%', l: 'الالتزام', c: 'var(--blue)' }].map(s => (
            <div key={s.l} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 'var(--rs2)', padding: '.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--text2)', marginTop: '.2rem' }}>{s.l}</div>
            </div>
          ))}
        </div>

        <SH title="👥 طلابي — المقرر الحالي" right={<Btn primary small onClick={() => setAddPlanOpen(true)}>+ مقرر جديد</Btn>} />

        {TEACHER_STUDENTS.map(s => {
          const sl = STATUS_LABELS[s.status]
          const sardLabel = s.sardSubtype === 'full' ? 'سرد كامل' : s.sardSubtype === 'review' ? 'سرد مراجعة (مقاطع)' : ''
          return (
            <div
              key={s.id}
              onClick={() => openEval(s)}
              style={{ display: 'flex', alignItems: 'center', gap: '.6rem', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 'var(--rs2)', padding: '.7rem .85rem', marginBottom: '.45rem', cursor: 'pointer', transition: '.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateX(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
            >
              <Avatar initials={s.initials} color={s.color} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '.84rem', fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--text2)', marginTop: '.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {TYPE_LABELS[s.planType]}{sardLabel ? ` (${sardLabel})` : ''} · {s.planDesc}
                </div>
              </div>
              <Badge color={sl.color}>{sl.label}</Badge>
            </div>
          )
        })}

        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
          <Btn ghost onClick={() => toast('⚠️ 3 طلاب لم يرسلوا تقاريرهم')} style={{ flex: 1, justifyContent: 'center' }}>⚠️ المتأخرون</Btn>
          <Btn ghost onClick={() => toast('📥 جاري تحميل ملف Excel...')} style={{ flex: 1, justifyContent: 'center' }}>📥 تصدير</Btn>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: 'var(--bg2)', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0 }}>
        {[{ icon: '👥', label: 'طلابي', active: true }, { icon: '📋', label: 'المقررات', cb: () => toast('📋 قائمة المقررات الكاملة') }, { icon: '📊', label: 'التقارير', cb: () => toast('📊 تقارير الحضور') }, { icon: '🔔', label: 'إشعارات', cb: () => toast('🔔 لا توجد إشعارات') }].map(t => (
          <div key={t.label} onClick={t.cb} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.15rem', padding: '.6rem .3rem', cursor: t.cb ? 'pointer' : 'default', fontSize: '.62rem', fontWeight: 700, color: t.active ? 'var(--green)' : 'var(--text3)' }}>
            <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>{t.label}
          </div>
        ))}
      </div>

      {/* Modals */}
      <EvalModal student={evalTarget} plan={evalTarget ? getPlanForStudent(evalTarget) : null} open={!!evalTarget} onClose={() => setEvalTarget(null)} />
      <AddPlanModal open={addPlanOpen} onClose={() => setAddPlanOpen(false)} />
    </div>
  )
}
