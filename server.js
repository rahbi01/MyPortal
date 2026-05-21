/**
 * server.js — Express server لـ Replit
 * يخدم الـ React app ويوفر API لقاعدة بيانات Replit DB
 */
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3000

app.use(express.json({ limit: '10mb' }))

// ── Replit DB client ────────────────────────────────────────────────
// Replit يوفر متغير بيئة REPLIT_DB_URL تلقائياً
const DB_URL = process.env.REPLIT_DB_URL

async function dbGet(key) {
  if (!DB_URL) return null
  const res = await fetch(`${DB_URL}/${encodeURIComponent(key)}`)
  if (res.status === 404) return null
  const text = await res.text()
  try { return JSON.parse(decodeURIComponent(text)) } catch { return text }
}

async function dbSet(key, value) {
  if (!DB_URL) return
  await fetch(DB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`,
  })
}

async function dbDelete(key) {
  if (!DB_URL) return
  await fetch(`${DB_URL}/${encodeURIComponent(key)}`, { method: 'DELETE' })
}

async function dbList(prefix = '') {
  if (!DB_URL) return []
  const res  = await fetch(`${DB_URL}?prefix=${encodeURIComponent(prefix)}`)
  const text = await res.text()
  return text ? text.split('\n').filter(Boolean) : []
}

// ── API Routes ──────────────────────────────────────────────────────

// GET /api/db/:key
app.get('/api/db/:key', async (req, res) => {
  try {
    const value = await dbGet(req.params.key)
    res.json({ key: req.params.key, value })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/db/:key  { value: ... }
app.post('/api/db/:key', async (req, res) => {
  try {
    await dbSet(req.params.key, req.body.value)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/db/:key
app.delete('/api/db/:key', async (req, res) => {
  try {
    await dbDelete(req.params.key)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/db  (clear all quran_ keys)
app.delete('/api/db', async (req, res) => {
  try {
    const keys = await dbList('quran_')
    await Promise.all(keys.map(k => dbDelete(k)))
    res.json({ ok: true, deleted: keys.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Static files (React build) ──────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🗄️  Replit DB: ${DB_URL ? 'connected' : 'not available (using localStorage fallback)'}`)
})
