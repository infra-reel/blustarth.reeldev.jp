import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ManageSidebar from '@/components/ManageSidebar'

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('manage_token')?.value
  if (!token) redirect('/manage/login')

  // バックエンドでトークン検証
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) redirect('/manage/login')
  } catch {
    redirect('/manage/login')
  }

  return (
    <div className="min-h-screen flex bg-base">
      <ManageSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</div>
    </div>
  )
}
