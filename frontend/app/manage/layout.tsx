import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ManageSidebar from '@/components/ManageSidebar'

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('manage_token')?.value

  // トークンなし → ログインへ（(auth)/login は このlayoutの適用外）
  if (!token) redirect('/manage/login')

  // バックエンドでトークン検証
  // catch は redirect しない（バックエンド障害でループしないよう 503 画面を出す）
  let verified = false
  let backendError = false
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || 'http://backend:4000'}/api/auth/verify`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    )
    if (res.ok) {
      verified = true
    } else if (res.status === 401 || res.status === 403) {
      // 明示的な認証エラー → ログインへ
      redirect('/manage/login')
    } else {
      backendError = true
    }
  } catch {
    backendError = true
  }

  if (backendError) {
    return (
      <div className="min-h-screen circuit-bg flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading font-700 text-red text-xl mb-2">SERVICE UNAVAILABLE</p>
          <p className="text-gray-mid text-sm font-body">バックエンドに接続できません。しばらくお待ちください。</p>
        </div>
      </div>
    )
  }

  if (!verified) redirect('/manage/login')

  return (
    <div className="min-h-screen flex bg-base">
      <ManageSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</div>
    </div>
  )
}
