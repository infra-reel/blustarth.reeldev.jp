export const revalidate = 60

async function getMembers() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/members`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function AboutPage() {
  const members = await getMembers()

  return (
    <div className="circuit-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-heading font-700 text-4xl tracking-widest text-white mb-12">
          <span className="text-cyan">//</span> ABOUT
        </h1>

        {/* チーム概要 */}
        <section className="mb-14 border-l-2 border-cyan pl-6">
          <h2 className="font-heading font-600 text-xl text-cyan tracking-widest mb-4">TEAM</h2>
          <div className="font-body text-gray-light leading-relaxed space-y-3">
            <p>BLUESTERTH Racingは、日本を拠点に活動するモータースポーツチームです。</p>
            <p>サーキットを舞台に、速さと美しさを追求し続けています。</p>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm font-body">
            {[
              ['チーム名', 'BLUESTERTH Racing'],
              ['活動地域', '日本各地'],
              ['設立', '2024'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-gray-mid text-xs mb-1">{k}</dt>
                <dd className="text-gray-light">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* メンバー */}
        {members.length > 0 && (
          <section>
            <h2 className="font-heading font-600 text-xl text-cyan tracking-widest mb-6">MEMBERS</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {members.map((m: any) => (
                <div key={m.id} className="flex gap-4 p-4 bg-navy/40 border border-white/5">
                  {m.image_url && (
                    <img src={m.image_url} alt={m.name} className="w-16 h-16 object-cover rounded-full border border-cyan/20 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-heading font-700 text-white text-base">{m.name}</p>
                    <p className="text-xs text-cyan font-body mt-0.5">{m.role}</p>
                    {m.bio && <p className="text-xs text-gray-mid mt-2 font-body leading-relaxed">{m.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
