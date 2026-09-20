'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/',        label: 'HOME' },
  { href: '/news',    label: 'NEWS' },
  { href: '/results', label: 'RESULTS' },
  { href: '/livery',  label: 'LIVERY' },
  { href: '/about',   label: 'ABOUT' },
  { href: '/sns',     label: 'SNS' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-site/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="font-heading font-bold text-xl tracking-widest text-white">
            <span className="text-cyan">BLUE</span>STERTH
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex gap-7">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link font-heading font-semibold text-sm tracking-widest ${
                  pathname === href ? 'text-cyan active' : 'text-gray-light hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ハンバーガー（モバイル） */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 relative z-50"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          >
            <span className={`block h-0.5 bg-cyan transition-all duration-300 ${open ? 'w-5 rotate-45 translate-y-2' : 'w-5'}`} />
            <span className={`block h-0.5 bg-gray-light transition-all duration-300 ${open ? 'w-5 opacity-0' : 'w-4'}`} />
            <span className={`block h-0.5 bg-cyan transition-all duration-300 ${open ? 'w-5 -rotate-45 -translate-y-2' : 'w-5'}`} />
          </button>
        </div>
      </header>

      {/* モバイルメニューオーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* モバイルメニューパネル */}
      <div className={`mobile-menu fixed top-0 right-0 h-full w-64 bg-navy z-40 md:hidden pt-16 px-6 border-l border-white/10 ${open ? 'open' : ''}`}>
        <nav className="flex flex-col gap-2 mt-4">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-heading font-semibold text-lg tracking-widest py-3 border-b border-white/10 ${
                pathname === href ? 'text-cyan' : 'text-gray-light'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ナビ分のスペーサー */}
      <div className="h-14" />
    </>
  )
}
