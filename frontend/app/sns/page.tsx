export const revalidate = 60

async function getSNSLinks() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/links`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

const ICON: Record<string, string> = {
  twitter: 'X / Twitter',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  discord: 'Discord',
  other: 'Link',
}

export default async function SNSPage() {
  const links = await getSNSLinks()

  return (
    <div className="circuit-bg min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-heading font-bold text-4xl tracking-widest text-white mb-12">
          <span className="text-cyan">//</span> SNS
        </h1>

        {links.length === 0 ? (
          <p className="text-gray-mid font-body">SNSリンクはまだありません。</p>
        ) : (
          <div className="flex flex-col gap-3">
            {links.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-navy/40 border border-white/10 hover:border-cyan/50 hover:bg-navy transition-all group"
              >
                <span className="font-heading font-semibold text-xs tracking-widest text-cyan w-24 flex-shrink-0">
                  {ICON[link.type] || link.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-white group-hover:text-cyan transition-colors">{link.label}</p>
                  {link.description && <p className="text-xs text-gray-mid font-body mt-0.5">{link.description}</p>}
                </div>
                <span className="text-cyan/50 group-hover:text-cyan transition-colors">→</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
