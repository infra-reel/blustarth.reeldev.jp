'use client'
import { useState, useEffect, useRef } from 'react'
import { authFetch } from '@/lib/authFetch'

type NewsItem = { id: number; title: string; body: string; image_url: string; created_at: string }
const emptyForm = { title: '', body: '', image_url: '' }

export default function ManageNews() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => authFetch('/api/news').then(r => r.json()).then(setItems).catch(() => {})
  useEffect(() => { load() }, [])
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  // 画像アップロード
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await authFetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      setForm(f => ({ ...f, image_url: url }))
    } catch {
      flash('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/news/${editing}` : '/api/news'
    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { flash(editing ? '更新しました' : '追加しました'); setForm(emptyForm); setEditing(null); load() }
    else flash('エラーが発生しました')
  }

  const startEdit = (item: NewsItem) => {
    setEditing(item.id)
    setForm({ title: item.title, body: item.body, image_url: item.image_url || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const del = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await authFetch(`/api/news/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl tracking-widest text-white mb-6">NEWS 管理</h1>
      {msg && <p className="mb-4 text-cyan text-sm font-body">{msg}</p>}

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="bg-navy/40 border border-white/10 p-5 mb-8 space-y-3">
        <h2 className="font-heading font-semibold text-sm tracking-widest text-cyan">
          {editing ? `編集中 #${editing}` : '新規追加'}
        </h2>

        <input
          required
          className="input-field"
          placeholder="タイトル"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />

        <textarea
          required
          className="input-field h-32 resize-none"
          placeholder="本文"
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
        />

        {/* 画像アップロード */}
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-ghost text-xs"
              disabled={uploading}
            >
              {uploading ? 'アップロード中...' : '画像を選択'}
            </button>
            {form.image_url && (
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                className="text-xs text-red hover:text-white transition-colors"
              >
                削除
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          {form.image_url && (
            <img src={form.image_url} alt="preview" className="max-h-40 object-cover border border-white/10" />
          )}
          {/* URLで直接指定も可能 */}
          <input
            className="input-field text-xs"
            placeholder="または画像URLを直接入力"
            value={form.image_url}
            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary">{editing ? '更新' : '追加'}</button>
          {editing && (
            <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(emptyForm) }}>
              キャンセル
            </button>
          )}
        </div>
      </form>

      {/* 一覧 */}
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className={`flex items-start justify-between gap-4 bg-navy/40 border p-4 transition-colors ${editing === item.id ? 'border-cyan/50' : 'border-white/5'}`}>
            <div className="flex gap-3 flex-1 min-w-0">
              {item.image_url && (
                <img src={item.image_url} alt="" className="w-16 h-16 object-cover flex-shrink-0 border border-white/10" />
              )}
              <div className="min-w-0">
                <p className="font-heading font-semibold text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-mid font-body mt-1">
                  {new Date(item.created_at).toLocaleDateString('ja-JP')}
                </p>
                <p className="text-xs text-gray-mid mt-1 line-clamp-2">{item.body}</p>
              </div>
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
