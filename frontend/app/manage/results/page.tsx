'use client'
import { useState, useEffect } from 'react'

type Result = { id: number; date: string; event: string; circuit: string; class: string; position: number; driver: string }

const emptyForm = { date: '', event: '', circuit: '', class: '', position: '', driver: '' }

export default function ManageResults() {
  const [items, setItems] = useState<Result[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const load = () => fetch('/api/results').then(r => r.json()).then(setItems).catch(() => {})
  useEffect(() => { load() }, [])
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/results/${editing}` : '/api/results'
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { flash(editing ? '更新しました' : '追加しました'); setForm(emptyForm); setEditing(null); load() }
    else flash('エラー')
  }

  const startEdit = (r: Result) => { setEditing(r.id); setForm({ date: r.date?.slice(0,10) || '', event: r.event, circuit: r.circuit, class: r.class || '', position: String(r.position || ''), driver: r.driver }) }
  const del = async (id: number) => { if (!confirm('削除しますか？')) return; await fetch(`/api/results/${id}`, { method: 'DELETE' }); load() }

  return (
    <div>
      <h1 className="font-heading font-700 text-2xl tracking-widest text-white mb-6">RESULTS 管理</h1>
      {msg && <p className="mb-4 text-cyan text-sm">{msg}</p>}

      <form onSubmit={handleSubmit} className="bg-navy/40 border border-white/10 p-5 mb-8 space-y-3">
        <h2 className="font-heading font-600 text-sm tracking-widest text-cyan">{editing ? '編集' : '新規追加'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input required type="date" className="input-field" value={form.date} onChange={f('date')} />
          <input required className="input-field" placeholder="イベント名" value={form.event} onChange={f('event')} />
          <input required className="input-field" placeholder="サーキット" value={form.circuit} onChange={f('circuit')} />
          <input className="input-field" placeholder="クラス" value={form.class} onChange={f('class')} />
          <input type="number" className="input-field" placeholder="順位" value={form.position} onChange={f('position')} />
          <input required className="input-field" placeholder="ドライバー" value={form.driver} onChange={f('driver')} />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">{editing ? '更新' : '追加'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(emptyForm) }}>キャンセル</button>}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead><tr className="border-b border-white/10">
            {['日付','イベント','サーキット','クラス','順位','ドライバー','操作'].map(h => (
              <th key={h} className="text-left py-2 px-2 text-xs text-cyan font-heading font-600 tracking-widest">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="py-2 px-2 text-gray-mid whitespace-nowrap">{r.date?.slice(0,10)}</td>
                <td className="py-2 px-2 text-gray-light">{r.event}</td>
                <td className="py-2 px-2 text-gray-mid">{r.circuit}</td>
                <td className="py-2 px-2 text-gray-mid">{r.class}</td>
                <td className="py-2 px-2 text-white font-heading font-700">{r.position ? `P${r.position}` : '-'}</td>
                <td className="py-2 px-2 text-gray-light">{r.driver}</td>
                <td className="py-2 px-2"><div className="flex gap-2">
                  <button onClick={() => startEdit(r)} className="btn-ghost text-xs">編集</button>
                  <button onClick={() => del(r.id)} className="text-xs text-red hover:text-white transition-colors">削除</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
