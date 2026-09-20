export const revalidate = 60

async function getNews() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/news`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function NewsPage() {
  const news = await getNews()

  return (
    <div className="circuit-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-heading font-700 text-4xl tracking-widest text-white mb-12">
          <span className="text-cyan">//</span> NEWS
        </h1>

        {news.length === 0 ? (
          <p className="text-gray-mid font-body">お知らせはまだありません。</p>
        ) : (
          <div className="flex flex-col gap-6">
            {news.map((item: any) => (
              <article key={item.id} id={String(item.id)}
                className="accent-line pl-5 py-5 bg-navy/40 border border-white/5">
                <p className="text-xs text-cyan font-body mb-1">
                  {new Date(item.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h2 className="font-heading font-600 text-xl text-white mb-3">{item.title}</h2>
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-full max-h-64 object-cover mb-3 border border-white/10" />
                )}
                <p className="font-body text-gray-light text-sm leading-relaxed whitespace-pre-wrap">{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
