'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/authFetch'
import { useImageUpload } from '@/lib/useImageUpload'

type Member = { id: number; name: string; role: string; bio: string; image_url: string }
const emptyForm = { name: '', role: '', bio: '', image_url: '' }

export default function ManageMembers() {
  const [items, setItems] = useState<Member[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const { fileRef, uploading, handleChange } = useImageUpload(url => setForm(f => ({ ...f, image_url: url })))

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

  const startEdit = (m: Member) => {
    setEditing(m.id)
    setForm({ name: m.name, role: m.role || '', bio: m.bio || '', image_url: m.image_url || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const del = async (id: number) => { if (!confirm('削除しますか？')) return; await authFetch(`/api/members/${id}`, { method: 'DELETE' }); load() }

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl tracking-widest text-white mb-6">MEMBERS 管理</h1>
      {msg && <p className="mb-4 text-cyan text-sm">{msg}</p>}

      <form onSubmit={handleSubmit} className="bg-navy/40 border border-white/10 p-5 mb-8 space-y-3">
        <h2 className="font-heading font-semibold text-sm tracking-widest text-cyan">{editing ? `編集中 #${editing}` : '新規追加'}</h2>
        <input required className="input-field" placeholder="名前" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input className="input-field" placeholder="役割（例: Driver, Mechanic）" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
        <textarea className="input-field h-20 resize-none" placeholder="紹介文（任意）" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />

        {/* 画像 */}
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost text-xs" disabled={uploading}>
              {uploading ? 'アップロード中...' : '画像を選択'}
            </button>
            {form.image_url && <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="text-xs text-red hover:text-white transition-colors">削除</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
          {form.image_url && <img src={form.image_url} alt="preview" className="w-20 h-20 rounded-full object-cover border border-white/10" />}
          <input className="input-field text-xs" placeholder="または画像URLを直接入力" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary">{editing ? '更新' : '追加'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(emptyForm) }}>キャンセル</button>}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {items.map(m => (
          <div key={m.id} className={`flex items-start justify-between gap-4 bg-navy/40 border p-4 ${editing === m.id ? 'border-cyan/50' : 'border-white/5'}`}>
            <div className="flex gap-3 flex-1 min-w-0">
              {m.image_url && <img src={m.image_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-white/10" />}
              <div>
                <p className="font-heading font-semibold text-white">{m.name}</p>
                <p className="text-xs text-cyan">{m.role}</p>
              </div>
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
