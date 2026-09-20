import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'BLUESTERTH Racing',
  description: 'Japanese motorsport racing team',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-mid font-body">
          ©reel hosiduki 2026 all rights reserved
        </footer>
      </body>
    </html>
  )
}
