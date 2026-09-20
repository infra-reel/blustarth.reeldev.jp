export const revalidate = 60

async function getLiveries() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/liveries`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function LiveryPage() {
  const liveries = await getLiveries()

  return (
    <div className="circuit-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="font-heading font-700 text-4xl tracking-widest text-white mb-12">
          <span className="text-cyan">//</span> LIVERY
        </h1>

        {liveries.length === 0 ? (
          <p className="text-gray-mid font-body">リバリー情報はまだありません。</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {liveries.map((lv: any) => (
              <div key={lv.id} className="bg-navy/40 border border-white/10 overflow-hidden">
                {lv.image_url && (
                  <img src={lv.image_url} alt={lv.name} className="w-full object-cover aspect-video" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-heading font-700 text-xl text-white">{lv.name}</h2>
                    <span className="text-xs text-cyan font-body border border-cyan/30 px-2 py-0.5">{lv.year}</span>
                  </div>
                  {lv.member && (
                    <p className="text-sm text-gray-mid font-body mb-2">ドライバー: <span className="text-gray-light">{lv.member}</span></p>
                  )}
                  {lv.description && (
                    <p className="text-sm text-gray-light font-body leading-relaxed">{lv.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
