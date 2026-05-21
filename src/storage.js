/**
 * storage.js — طبقة تخزين ذكية
 * 
 * على Replit: تستخدم API السيرفر ← Replit DB (تخزين دائم)
 * محلياً:    تستخدم localStorage  (تخزين في المتصفح)
 *
 * واجهة موحدة: { get, set, remove, clearAll }
 */

const PREFIX    = 'quran_'
const IS_REPLIT = typeof window !== 'undefined' && window.location.hostname.includes('replit')

// ── Replit DB عبر API ────────────────────────────────────────────────
async function replitGet(key) {
  try {
    const res = await fetch(`/api/db/${encodeURIComponent(PREFIX + key)}`)
    const data = await res.json()
    return data.value ?? null
  } catch { return null }
}

async function replitSet(key, value) {
  try {
    await fetch(`/api/db/${encodeURIComponent(PREFIX + key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    })
  } catch (e) { console.warn('Replit DB write failed:', e) }
}

async function replitRemove(key) {
  try {
    await fetch(`/api/db/${encodeURIComponent(PREFIX + key)}`, { method: 'DELETE' })
  } catch (e) { console.warn('Replit DB delete failed:', e) }
}

async function replitClearAll() {
  try { await fetch('/api/db', { method: 'DELETE' }) }
  catch (e) { console.warn('Replit DB clear failed:', e) }
}

// ── localStorage محلي ────────────────────────────────────────────────
function localGet(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function localSet(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) }
  catch (e) { console.warn('localStorage write failed:', e) }
}

function localRemove(key) { localStorage.removeItem(PREFIX + key) }

function localClearAll() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k))
}

// ── واجهة موحدة (sync للمحلي، async لـ Replit) ───────────────────────
// ملاحظة: get() تعيد القيمة مباشرة من localStorage عند التشغيل المحلي
// وعلى Replit تعيد Promise — App.jsx يتعامل مع كلا الحالتين
export const storage = {
  get: (key, fallback) => {
    if (IS_REPLIT) return replitGet(key).then(v => v ?? fallback)
    return localGet(key, fallback)
  },
  set: (key, value) => {
    if (IS_REPLIT) return replitSet(key, value)
    localSet(key, value)
  },
  remove: (key) => {
    if (IS_REPLIT) return replitRemove(key)
    localRemove(key)
  },
  clearAll: () => {
    if (IS_REPLIT) return replitClearAll()
    localClearAll()
  },
}
