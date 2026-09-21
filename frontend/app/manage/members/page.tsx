'use client'
import { authFetch } from '@/lib/authFetch'
import { useState, useEffect } from 'react'

type Member = { id: number; name: string; role: string; bio: string; image_url: string }
const emptyForm = { name: '', role: '', bio: '', image_url: '' }

export default function ManageMembers() {
  const [items, setItems] = useState<Member[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const load = () => authFetch('/api/members').then(r => r.json()).then(setItems).catch(() => {})
  useEffect(() => { load() }, [])
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/members/${editing}` : '/api/members'
    const res = await authFetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { flash(editing ? '更新しました' : '追加しました'); setForm(emptyForm); setEditing(null); load() }
    else flash('エラー')
  }

  const startEdit = (m: Member) => { setEditing(m.id); setForm({ name: m.name, role: m.role || '', bio: m.bio || '', image_url: m.image_url || '' }) }
  const del = async (id: number) => { if (!confirm('削除しますか？')) return; await authFetch(`/api/members/${id}`, { method: 'DELETE' }); load() }

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl tracking-widest text-white mb-6">MEMBERS 管理</h1>
      {msg && <p className="mb-4 text-cyan text-sm">{msg}</p>}

      <form onSubmit={handleSubmit} className="bg-navy/40 border border-white/10 p-5 mb-8 space-y-3">
        <h2 className="font-heading font-semibold text-sm tracking-widest text-cyan">{editing ? '編集' : '新規追加'}</h2>
        <input required className="input-field" placeholder="名前" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input className="input-field" placeholder="役割（例: Driver, Mechanic）" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
        <textarea className="input-field h-20 resize-none" placeholder="紹介文（任意）" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
        <input className="input-field" placeholder="画像URL（任意）" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">{editing ? '更新' : '追加'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(emptyForm) }}>キャンセル</button>}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {items.map(m => (
          <div key={m.id} className="flex items-start justify-between gap-4 bg-navy/40 border border-white/5 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-white">{m.name}</p>
              <p className="text-xs text-cyan">{m.role}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(m)} className="btn-ghost text-xs">編集</button>
              <button onClick={() => del(m.id)} className="text-xs text-red hover:text-white transition-colors">削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
