import Link from 'next/link'

const sections = [
  { href: '/manage/news',    label: 'NEWS',    desc: 'お知らせの追加・編集・削除' },
  { href: '/manage/livery',  label: 'LIVERY',  desc: 'リバリー・メンバー対応の管理' },
  { href: '/manage/results', label: 'RESULTS', desc: 'レース結果の管理' },
  { href: '/manage/members', label: 'MEMBERS', desc: 'メンバー情報の管理' },
  { href: '/manage/links',   label: 'SNS LINKS', desc: 'SNSリンクの追加・削除' },
]

export default function ManageTop() {
  return (
    <div>
      <h1 className="font-heading font-bold text-3xl tracking-widest text-white mb-8">DASHBOARD</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map(s => (
          <Link key={s.href} href={s.href}
            className="accent-line pl-5 py-5 bg-navy/60 border border-white/10 hover:border-cyan/30 transition-colors group">
            <p className="font-heading font-bold text-cyan tracking-widest group-hover:text-white transition-colors">{s.label}</p>
            <p className="text-sm text-gray-mid font-body mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
