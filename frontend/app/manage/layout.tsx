import ManageSidebar from '@/components/ManageSidebar'

// 認証チェックは middleware.ts で行う → このlayoutは表示だけ
export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-site">
      <ManageSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</div>
    </div>
  )
}
