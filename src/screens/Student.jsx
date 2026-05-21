import { useState } from 'react'
import { PLANS, WEEK_DAYS, getSunday, fmtDate } from '../data.js'
import { Card, Btn, SH, Stars, toast } from '../components/UI.jsx'

const sun = getSunday()
const sat = new Date(sun); sat.setDate(sat.getDate() + 6)
const todayIdx = new Date().getDay()

// ─── Plan Card ────────────────────────────────────────────────────
function PlanCard({ plan, onOpen }) {
  const isHafiz = plan.planType === 'حفظ'
  const isSard  = plan.planType === 'سرد'
  const colors  = { current: 'var(--green)', past: 'var(--text3)', future: 'var(--blue)' }
  const labels  = { current: 'حالي', past: 'سابق', future: 'قادم' }
  const typeColor = isHafiz ? 'var(--green)' : isSard ? 'var(--purple)' : 'var(--gold)'
  const typeBg    = isHafiz ? 'var(--gs)' : isSard ? 'var(--ps)' : 'var(--golds)'
  const sardLabel = plan.sardSubtype === 'full' ? 'سرد كامل' : 'مراجعة (مقاطع)'

  const endDate = new Date(plan.startDate); endDate.setDate(endDate.getDate() + 6)

  return (
    <div
      onClick={() => onOpen(plan)}
      style={{
        background: 'var(--card2)', border: '1px solid var(--border)',
        borderRadius: 'var(--rs2)', padding: '1rem', marginBottom: '.6rem',
        cursor: 'pointer', transition: 'all .18s', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateX(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
    >
      {/* Colored left border */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, borderRadius: '0 4px 4px 0', background: typeColor }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[plan.status], boxShadow: plan.status === 'current' ? '0 0 6px var(--green)' : 'none', flexShrink: 0 }} />
          <span style={{ fontSize: '.72rem', fontWeight: 800, padding: '.2rem .7rem', borderRadius: 20, background: typeBg, color: typeColor }}>
            {isHafiz ? '📖 حفظ' : `🎙️ ${sardLabel}`}
          </span>
        </div>
        <span style={{ fontSize: '.7rem', color: 'var(--text2)' }}>{plan.startDate} - {endDate.toISOString().slice(0,10)}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.28rem' }}>
        {isHafiz && <>
          <Row label="الجديد"  val={plan.newMem} />
          <Row label="القريب"  val={plan.recentMem} />
          <Row label="القديم"  val={plan.oldMem} />
        </>}
        {isSard && <Row label="المقرر" val={plan.revisionText} />}
        <Row label="المعلم"  val="الشيخ عمر السعدي" muted />
      </div>

      {plan.evaluation && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card3)', borderRadius: 'var(--rx)', padding: '.48rem .7rem', marginTop: '.6rem', fontSize: '.75rem' }}>
          <span style={{ color: 'var(--text2)' }}>التقييم الأخير</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Stars count={isHafiz ? (plan.evaluation.newPass ? 3 : 2) : (plan.evaluation.revisionScore >= 80 ? 3 : 2)} />
            <span style={{ color: 'var(--text3)', fontSize: '.68rem' }}>
              {isHafiz
                ? `جديد: ${plan.evaluation.newScore}/40 · قريب: ${plan.evaluation.recentScore}/20 · قديم: ${plan.evaluation.oldScore}/40`
                : `${plan.evaluation.revisionScore}/100`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, val, muted }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem', fontSize: '.82rem' }}>
      <span style={{ color: 'var(--text2)', fontSize: '.72rem', minWidth: 58, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: muted ? 'var(--text2)' : 'var(--text)' }}>{val}</span>
    </div>
  )
}

// ─── Daily Report ─────────────────────────────────────────────────
function DailyReport({ plan, onClose }) {
  const isHafiz = plan.planType === 'حفظ'
  const isSard  = plan.planType === 'سرد'
  const [tasks, setTasks]         = useState({ t1: false, t2: false, t3: false, t4: false, t5: false })
  const [sardDone, setSardDone]   = useState(false)
  const [sardText, setSardText]   = useState('')
  const [sardNotes, setSardNotes] = useState('')
  const [phaseMem, setPhaseMem]   = useState('')
  const [prevMem, setPrevMem]     = useState('')
  const [activeDay, setActiveDay] = useState(todayIdx)
  const [error, setError]         = useState('')
  const [submitted, setSubmitted] = useState([])

  const toggleTask = k => { setTasks(p => ({ ...p, [k]: !p[k] })); setError('') }

  const submit = () => {
    if (isHafiz) {
      const doneCount = Object.values(tasks).filter(Boolean).length
      if (doneCount < 5) { setError('يرجى إكمال جميع المهام الخمس المطلوبة أولاً'); return }
    }
    if (isSard && !sardDone) { setError('يرجى تأكيد إتمام السرد أولاً'); return }
    setSubmitted(p => [...p, activeDay])
    toast('✅ تم حفظ تقرير اليوم بنجاح!', 'ok')
    setError('')
  }

  const sardSubLabel = plan.sardSubtype === 'full' ? 'سرد كامل' : 'مراجعة (مقاطع)'

  return (
    <Card style={{ animation: 'fadeUp .25s ease' }}>
      <SH
        title={`📋 التقرير اليومي — ${plan.planType === 'حفظ' ? 'حفظ' : sardSubLabel}`}
        sub={isHafiz ? 'أكمل المهام الخمس المطلوبة' : `${sardSubLabel} · ${plan.revisionText}`}
        right={<Btn ghost small onClick={onClose}>✕ إغلاق</Btn>}
      />

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: '.4rem', overflowX: 'auto', paddingBottom: '.3rem', marginBottom: '.75rem' }}>
        {WEEK_DAYS.map((d, i) => {
          const isDone    = submitted.includes(i)
          const isActive  = i === activeDay
          const isPast    = i < todayIdx && !isDone
          const isFuture  = i > todayIdx
          return (
            <div
              key={i}
              onClick={() => !isFuture && setActiveDay(i)}
              style={{
                flexShrink: 0, borderRadius: 'var(--rs2)', padding: '.42rem .8rem',
                fontSize: '.76rem', fontWeight: 700, cursor: isFuture ? 'default' : 'pointer',
                border: '1px solid var(--border)', transition: '.15s',
                background: isDone ? 'rgba(34,197,94,.08)' : isActive ? 'var(--gs)' : 'var(--card2)',
                borderColor:  isDone ? 'rgba(34,197,94,.2)' : isActive ? 'rgba(34,197,94,.3)' : 'var(--border)',
                color: isDone ? 'var(--green)' : isActive ? 'var(--green)' : isFuture ? 'var(--text3)' : 'var(--text2)',
              }}
            >{d}{isDone ? ' ✓' : ''}</div>
          )
        })}
      </div>

      {/* Hafiz tasks */}
      {isHafiz && (
        <>
          <div style={{ fontSize: '.76rem', color: 'var(--text2)', marginBottom: '.5rem' }}>
            إنجازات اليوم <span style={{ color: 'var(--red)' }}>*</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem', marginBottom: '.7rem' }}>
            {[
              { k: 't1', label: '🎧 الاستماع ثلاث مرات' },
              { k: 't2', label: '📖 ضبط التلاوة' },
              { k: 't3', label: '🔊 تسميع الجديد كاملاً' },
              { k: 't4', label: '🔁 تكرار تسميع الجديد' },
            ].map(({ k, label }) => (
              <Task key={k} done={tasks[k]} label={label} onClick={() => toggleTask(k)} />
            ))}
            <div style={{ gridColumn: 'span 2' }}>
              <Task done={tasks.t5} label="🔄 مراجعة حفظ الأسبوع" onClick={() => toggleTask('t5')} />
            </div>
          </div>
          <Textarea label="حفظ المرحلة (اختياري)" value={phaseMem} onChange={setPhaseMem} placeholder="ما قمت بحفظه في المرحلة..." />
          <Textarea label="الحفظ السابق (اختياري)" value={prevMem} onChange={setPrevMem} placeholder="ما راجعته من الحفظ السابق..." />
        </>
      )}

      {/* Sard tasks */}
      {isSard && (
        <>
          <div style={{ background: 'var(--bs)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 'var(--rs2)', padding: '.7rem .9rem', marginBottom: '.7rem', fontSize: '.8rem' }}>
            <strong style={{ color: 'var(--blue)' }}>نوع السرد:</strong> {sardSubLabel}
            {plan.revisionNotes && <><br /><span style={{ fontSize: '.72rem', color: 'var(--text2)' }}>{plan.revisionNotes}</span></>}
          </div>
          <div
            onClick={() => setSardDone(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '.7rem',
              background: sardDone ? 'rgba(34,197,94,.07)' : 'var(--card2)',
              border: `1px solid ${sardDone ? 'rgba(34,197,94,.25)' : 'var(--border)'}`,
              borderRadius: 'var(--rs2)', padding: '.9rem 1rem', cursor: 'pointer', marginBottom: '.7rem', transition: '.18s',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 7, border: '2px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: sardDone ? 'var(--green)' : 'transparent',
              borderColor: sardDone ? 'var(--green)' : 'var(--border2)',
              color: '#fff', fontSize: '1rem', transition: '.18s',
            }}>{sardDone ? '✓' : ''}</div>
            <div>
              <div style={{ fontSize: '.86rem', fontWeight: 700 }}>تم السرد</div>
              <div style={{ fontSize: '.7rem', color: 'var(--text2)' }}>اضغط لتأكيد إتمام السرد</div>
            </div>
          </div>
          <Textarea label="نص السرد" value={sardText} onChange={setSardText} placeholder="نص السرد الذي تم تنفيذه..." />
          <Textarea label="ملاحظات السرد" value={sardNotes} onChange={setSardNotes} placeholder="ملاحظات عن أداء السرد..." />
        </>
      )}

      {error && (
        <div style={{ color: 'var(--red)', fontSize: '.76rem', marginBottom: '.55rem', padding: '.45rem .7rem', background: 'var(--rs)', borderRadius: 'var(--rx)' }}>
          ⚠️ {error}
        </div>
      )}
      <Btn primary onClick={submit} style={{ width: '100%', justifyContent: 'center' }}>☁️ حفظ تقرير اليوم</Btn>
    </Card>
  )
}

function Task({ done, label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '.55rem',
        background: done ? 'rgba(34,197,94,.07)' : 'var(--card2)',
        border: `1px solid ${done ? 'rgba(34,197,94,.25)' : 'var(--border)'}`,
        borderRadius: 'var(--rs2)', padding: '.7rem .8rem', cursor: 'pointer', transition: 'all .18s',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, transition: '.18s',
        border: `2px solid ${done ? 'var(--green)' : 'var(--border2)'}`,
        background: done ? 'var(--green)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.75rem',
      }}>{done ? '✓' : ''}</div>
      <span style={{ fontSize: '.78rem', fontWeight: 600, color: done ? 'var(--text2)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: '.6rem' }}>
      <div style={{ fontSize: '.72rem', color: 'var(--text2)', marginBottom: '.25rem', fontWeight: 700 }}>{label}</div>
      <textarea
        rows={2} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'var(--card2)', border: '1px solid var(--border)',
          borderRadius: 'var(--rx)', padding: '.5rem .7rem', color: 'var(--text)',
          fontFamily: 'inherit', fontSize: '.8rem', resize: 'none', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.4)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

// ─── Student Screen ───────────────────────────────────────────────
export default function StudentScreen({ onLogout }) {
  const [activePlan, setActivePlan] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: 680, margin: '0 auto' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.7rem 1rem', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800, fontSize: '1.05rem' }}>
          <span>📖</span> أشبال القرآن
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '.28rem .75rem', fontSize: '.76rem', fontWeight: 600 }}>
            👤 أحمد محمد
          </div>
          <Btn danger small onClick={onLogout}>خروج</Btn>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>

        <SH
          title="📋 مقرراتي الأسبوعية"
          sub={`${fmtDate(sun)} — ${fmtDate(sat)}`}
        />

        {PLANS.map(p => (
          <PlanCard
            key={p.id}
            plan={p}
            onOpen={plan => setActivePlan(activePlan?.id === plan.id ? null : plan)}
          />
        ))}

        {activePlan && (
          <DailyReport plan={activePlan} onClose={() => setActivePlan(null)} />
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.6rem', marginTop: '.5rem' }}>
          {[
            { n: '15',  l: 'جزء محفوظ',    c: 'var(--green)' },
            { n: '18',  l: 'أسبوع متواصل', c: 'var(--gold)' },
            { n: '94%', l: 'معدل الالتزام', c: 'var(--blue)' },
          ].map(s => (
            <div key={s.l} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 'var(--rs2)', padding: '.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--text2)', marginTop: '.2rem' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: 'var(--bg2)', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0 }}>
        {[
          { icon: '🏠', label: 'مقرراتي', active: true },
          { icon: '📊', label: 'إحصاءاتي', onClick: () => toast('📊 الإحصاءات التفصيلية — قريباً') },
          { icon: '🔔', label: 'إشعارات',  onClick: () => toast('🔔 لا توجد إشعارات جديدة') },
        ].map(t => (
          <div key={t.label} onClick={t.onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.15rem', padding: '.6rem .3rem', cursor: t.onClick ? 'pointer' : 'default', fontSize: '.62rem', fontWeight: 700, color: t.active ? 'var(--green)' : 'var(--text3)' }}>
            <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  )
}
