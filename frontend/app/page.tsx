import Link from 'next/link'

export const revalidate = 60

async function getLatestNews() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/news?limit=3`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function HomePage() {
  const news = await getLatestNews()

  return (
    <div className="circuit-bg min-h-screen">
      {/* ヒーロー */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 text-center overflow-hidden">
        {/* デコレーションライン */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan/10" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan/10" />
        </div>

        <p className="font-heading text-cyan text-sm tracking-[0.4em] mb-3 font-semibold">JAPAN MOTORSPORT</p>
        <h1 className="font-heading font-bold text-6xl md:text-8xl tracking-tight text-white leading-none mb-2">
          BLUE<span className="text-red">STERTH</span>
        </h1>
        <p className="font-body text-gray-mid text-base mt-6 max-w-md leading-relaxed">
          サーキットに刻む、青い軌跡。<br />日本各地を駆け抜けるレーシングチーム。
        </p>
        <div className="flex gap-4 mt-10">
          <Link href="/results" className="font-heading font-semibold text-sm tracking-widest px-6 py-3 bg-cyan text-site hover:bg-white hover:text-site transition-colors">
            RESULTS
          </Link>
          <Link href="/about" className="font-heading font-semibold text-sm tracking-widest px-6 py-3 border border-cyan/50 text-cyan hover:border-cyan transition-colors">
            ABOUT US
          </Link>
        </div>
      </section>

      {/* 最新ニュース */}
      {news.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-2xl tracking-widest text-white">LATEST NEWS</h2>
            <Link href="/news" className="text-cyan text-sm font-heading font-semibold tracking-widest hover:text-white transition-colors">
              ALL →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {news.map((item: any) => (
              <Link key={item.id} href={`/news#${item.id}`}
                className="accent-line pl-5 py-4 bg-navy/50 hover:bg-navy transition-colors group">
                <p className="text-xs text-cyan font-body mb-2">{new Date(item.created_at).toLocaleDateString('ja-JP')}</p>
                <p className="font-heading font-semibold text-white text-base group-hover:text-cyan transition-colors line-clamp-2">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
