export default function LoginPage() {
  const discordAuthUrl = `/api/auth/discord`
  return (
    <div className="min-h-screen circuit-bg flex items-center justify-center">
      <div className="bg-navy border border-white/10 p-8 w-full max-w-sm text-center">
        <h1 className="font-heading font-700 text-2xl tracking-widest text-white mb-2">MANAGE</h1>
        <p className="text-xs text-gray-mid font-body mb-8">管理者のみアクセス可能</p>
        <a
          href={discordAuthUrl}
          className="block w-full font-heading font-600 text-sm tracking-widest px-6 py-3 bg-[#5865F2] text-white hover:bg-[#4752C4] transition-colors text-center"
        >
          Discord でログイン
        </a>
      </div>
    </div>
  )
}
