'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/authFetch'
import { useImageUpload } from '@/lib/useImageUpload'

type Livery = { id: number; name: string; year: string; member: string; description: string; image_url: string }
type Member = { id: number; name: string }
const emptyForm = { name: '', year: new Date().getFullYear().toString(), member: '', description: '', image_url: '' }

export default function ManageLivery() {
  const [items, setItems] = useState<Livery[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const { fileRef, uploading, handleChange } = useImageUpload(url => setForm(f => ({ ...f, image_url: url })))

  const load = () => {
    authFetch('/api/liveries').then(r => r.json()).then(setItems).catch(() => {})
    authFetch('/api/members').then(r => r.json()).then(setMembers).catch(() => {})
  }
  useEffect(() => { load() }, [])
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/liveries/${editing}` : '/api/liveries'
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { flash(editing ? '更新しました' : '追加しました'); setForm(emptyForm); setEditing(null); load() }
    else flash('エラーが発生しました')
  }

  const startEdit = (item: Livery) => {
    setEditing(item.id)
    setForm({ name: item.name, year: item.year, member: item.member || '', description: item.description || '', image_url: item.image_url || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const del = async (id: number) => { if (!confirm('削除しますか？')) return; await authFetch(`/api/liveries/${id}`, { method: 'DELETE' }); load() }

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl tracking-widest text-white mb-6">LIVERY 管理</h1>
      {msg && <p className="mb-4 text-cyan text-sm font-body">{msg}</p>}

      <form onSubmit={handleSubmit} className="bg-navy/40 border border-white/10 p-5 mb-8 space-y-3">
        <h2 className="font-heading font-semibold text-sm tracking-widest text-cyan">{editing ? `編集中 #${editing}` : '新規追加'}</h2>
        <input required className="input-field" placeholder="リバリー名" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input required className="input-field" placeholder="年度 (例: 2026)" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
        <select className="input-field" value={form.member} onChange={e => setForm(f => ({ ...f, member: e.target.value }))}>
          <option value="">ドライバー（任意）</option>
          {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
        <textarea className="input-field h-20 resize-none" placeholder="説明（任意）" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

        {/* 画像 */}
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost text-xs" disabled={uploading}>
              {uploading ? 'アップロード中...' : '画像を選択'}
            </button>
            {form.image_url && <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="text-xs text-red hover:text-white transition-colors">削除</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
          {form.image_url && <img src={form.image_url} alt="preview" className="max-h-40 object-cover border border-white/10" />}
          <input className="input-field text-xs" placeholder="または画像URLを直接入力" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary">{editing ? '更新' : '追加'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(emptyForm) }}>キャンセル</button>}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className={`flex items-start justify-between gap-4 bg-navy/40 border p-4 ${editing === item.id ? 'border-cyan/50' : 'border-white/5'}`}>
            <div className="flex gap-3 flex-1 min-w-0">
              {item.image_url && <img src={item.image_url} alt="" className="w-16 h-16 object-cover flex-shrink-0 border border-white/10" />}
              <div>
                <p className="font-heading font-semibold text-white">{item.name}</p>
                <p className="text-xs text-gray-mid">{item.year}{item.member && ` / ${item.member}`}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(item)} className="btn-ghost text-xs">編集</button>
              <button onClick={() => del(item.id)} className="text-xs text-red hover:text-white transition-colors">削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
