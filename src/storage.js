/**
 * storage.js — طبقة localStorage تحل محل قاعدة البيانات مؤقتاً
 *
 * كل مفتاح يُخزَّن بصيغة JSON.
 * إذا لم توجد بيانات محفوظة يُعاد الافتراضي من data.js.
 */

const PREFIX = 'quran_'

function get(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.warn('localStorage write failed:', e)
  }
}

function remove(key) {
  localStorage.removeItem(PREFIX + key)
}

function clearAll() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k))
}

export const storage = { get, set, remove, clearAll }
