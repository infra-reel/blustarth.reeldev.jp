'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/manage',         label: 'DASHBOARD' },
  { href: '/manage/news',    label: 'NEWS' },
  { href: '/manage/livery',  label: 'LIVERY' },
  { href: '/manage/results', label: 'RESULTS' },
  { href: '/manage/members', label: 'MEMBERS' },
  { href: '/manage/links',   label: 'SNS LINKS' },
]

export default function ManageSidebar() {
  const path = usePathname()
  return (
    <aside className="w-48 bg-navy border-r border-white/10 flex flex-col py-6 flex-shrink-0">
      <Link href="/" className="font-heading font-bold text-sm tracking-widest px-5 mb-8 text-gray-mid hover:text-white">
        ← SITE
      </Link>
      <nav className="flex flex-col gap-1 px-3">
        {LINKS.map(l => (
          <Link key={l.href} href={l.href}
            className={`font-heading font-semibold text-xs tracking-widest px-3 py-2.5 rounded-sm transition-colors ${
              path === l.href ? 'text-cyan bg-cyan/10' : 'text-gray-mid hover:text-white hover:bg-white/5'
            }`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-5">
        <a href="/api/auth/logout" className="text-xs text-red font-body hover:text-white transition-colors">ログアウト</a>
      </div>
    </aside>
  )
}
