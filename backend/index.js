'use strict'
const express = require('express')
const Database = require('better-sqlite3')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const multer = require('multer')

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || ''
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://bluestarth.reeldev.jp/manage/callback'
const ADMIN_IDS = (process.env.DISCORD_ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean)

// DB
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'db.sqlite')
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS liveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    year TEXT,
    member TEXT,
    description TEXT,
    image_url TEXT
  );
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    image_url TEXT
  );
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    event TEXT NOT NULL,
    circuit TEXT NOT NULL,
    class TEXT,
    position INTEGER,
    driver TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT
  );
`)

// 画像アップロード先（PVCマウント）
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'data', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Images only'))
  },
})

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// 画像を /uploads/* として配信
app.use('/uploads', express.static(UPLOAD_DIR))

// ─── Auth middleware ───────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// ─── 画像アップロード ──────────────────────────────────
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  // フロントからアクセスできる公開URLを返す
  const publicUrl = `/uploads/${req.file.filename}`
  res.json({ url: publicUrl })
})

// ─── Auth routes ──────────────────────────────────────
app.get('/api/auth/discord', (_req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify',
  })
  res.redirect(`https://discord.com/oauth2/authorize?${params}`)
})

app.get('/api/auth/discord/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.status(400).json({ error: 'No code' })
  try {
    const { default: fetch } = await import('node-fetch')
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) return res.status(401).json({ error: 'Discord auth failed' })

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const user = await userRes.json()

    if (!ADMIN_IDS.includes(user.id)) {
      return res.status(403).json({ error: 'Not an admin' })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' })
    res.json({ token })
  } catch {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.get('/api/auth/verify', requireAuth, (req, res) => res.json({ ok: true, user: req.user }))
app.get('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'manage_token=; Path=/; Max-Age=0')
  res.redirect('/')
})

// ─── CRUD helper ──────────────────────────────────────
function crud(router, table, fields) {
  router.get(`/api/${table}`, (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined
    const stmt = db.prepare(`SELECT * FROM ${table} ORDER BY id DESC${limit ? ' LIMIT ?' : ''}`)
    res.json(limit ? stmt.all(limit) : stmt.all())
  })
  router.get(`/api/${table}/:id`, (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id)
    row ? res.json(row) : res.status(404).json({ error: 'Not found' })
  })
  router.post(`/api/${table}`, requireAuth, (req, res) => {
    const cols = fields.filter(f => req.body[f] !== undefined)
    const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
    const info = stmt.run(...cols.map(f => req.body[f]))
    res.json({ id: info.lastInsertRowid })
  })
  router.put(`/api/${table}/:id`, requireAuth, (req, res) => {
    const cols = fields.filter(f => req.body[f] !== undefined)
    if (!cols.length) return res.status(400).json({ error: 'No fields' })
    const stmt = db.prepare(`UPDATE ${table} SET ${cols.map(f => `${f}=?`).join(',')} WHERE id=?`)
    stmt.run(...cols.map(f => req.body[f]), req.params.id)
    res.json({ ok: true })
  })
  router.delete(`/api/${table}/:id`, requireAuth, (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id=?`).run(req.params.id)
    res.json({ ok: true })
  })
}

crud(app, 'news',     ['title','body','image_url'])
crud(app, 'liveries', ['name','year','member','description','image_url'])
crud(app, 'members',  ['name','role','bio','image_url'])
crud(app, 'results',  ['date','event','circuit','class','position','driver'])
crud(app, 'links',    ['type','label','url','description'])

app.listen(PORT, () => console.log(`backend listening on ${PORT}`))
