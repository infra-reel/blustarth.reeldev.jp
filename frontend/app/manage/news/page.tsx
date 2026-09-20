'use client'
import { useState, useEffect } from 'react'

type NewsItem = { id: number; title: string; body: string; image_url: string; created_at: string }

const API = '/api/news'
const emptyForm = { title: '', body: '', image_url: '' }

export default function ManageNews() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const load = () => fetch(API).then(r => r.json()).then(setItems).catch(() => {})
  useEffect(() => { load() }, [])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `${API}/${editing}` : API
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { flash(editing ? '更新しました' : '追加しました'); setForm(emptyForm); setEditing(null); load() }
    else flash('エラーが発生しました')
  }

  const startEdit = (item: NewsItem) => {
    setEditing(item.id)
    setForm({ title: item.title, body: item.body, image_url: item.image_url || '' })
  }

  const del = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="font-heading font-700 text-2xl tracking-widest text-white mb-6">NEWS 管理</h1>
      {msg && <p className="mb-4 text-cyan text-sm font-body">{msg}</p>}

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="bg-navy/40 border border-white/10 p-5 mb-8 space-y-3">
        <h2 className="font-heading font-600 text-sm tracking-widest text-cyan">{editing ? '編集' : '新規追加'}</h2>
        <input required className="input-field" placeholder="タイトル" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <textarea required className="input-field h-28 resize-none" placeholder="本文" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
        <input className="input-field" placeholder="画像URL（任意）" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">{editing ? '更新' : '追加'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(emptyForm) }}>キャンセル</button>}
        </div>
      </form>

      {/* 一覧 */}
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className="flex items-start justify-between gap-4 bg-navy/40 border border-white/5 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-heading font-600 text-white truncate">{item.title}</p>
              <p className="text-xs text-gray-mid font-body mt-1">{new Date(item.created_at).toLocaleDateString('ja-JP')}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(item)} className="btn-ghost text-xs">編集</button>
              <button onClick={() => del(item.id)} className="text-xs text-red hover:text-white transition-colors font-body">削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
