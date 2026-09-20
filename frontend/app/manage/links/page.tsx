'use client'
import { useState, useEffect } from 'react'

type Link = { id: number; type: string; label: string; url: string; description: string }
const TYPES = ['twitter','instagram','youtube','tiktok','discord','other']
const emptyForm = { type: 'twitter', label: '', url: '', description: '' }

export default function ManageLinks() {
  const [items, setItems] = useState<Link[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const load = () => fetch('/api/links').then(r => r.json()).then(setItems).catch(() => {})
  useEffect(() => { load() }, [])
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/links/${editing}` : '/api/links'
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { flash(editing ? '更新しました' : '追加しました'); setForm(emptyForm); setEditing(null); load() }
    else flash('エラー')
  }

  const startEdit = (l: Link) => { setEditing(l.id); setForm({ type: l.type, label: l.label, url: l.url, description: l.description || '' }) }
  const del = async (id: number) => { if (!confirm('削除しますか？')) return; await fetch(`/api/links/${id}`, { method: 'DELETE' }); load() }

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl tracking-widest text-white mb-6">SNS LINKS 管理</h1>
      {msg && <p className="mb-4 text-cyan text-sm">{msg}</p>}

      <form onSubmit={handleSubmit} className="bg-navy/40 border border-white/10 p-5 mb-8 space-y-3">
        <h2 className="font-heading font-semibold text-sm tracking-widest text-cyan">{editing ? '編集' : '新規追加'}</h2>
        <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input required className="input-field" placeholder="表示名" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
        <input required className="input-field" placeholder="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
        <input className="input-field" placeholder="説明（任意）" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">{editing ? '更新' : '追加'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(emptyForm) }}>キャンセル</button>}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {items.map(l => (
          <div key={l.id} className="flex items-center justify-between gap-4 bg-navy/40 border border-white/5 p-4">
            <div>
              <span className="text-xs text-cyan font-heading tracking-widest mr-3">{l.type}</span>
              <span className="text-white font-heading font-semibold">{l.label}</span>
              <p className="text-xs text-gray-mid truncate max-w-xs">{l.url}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(l)} className="btn-ghost text-xs">編集</button>
              <button onClick={() => del(l.id)} className="text-xs text-red hover:text-white transition-colors">削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
