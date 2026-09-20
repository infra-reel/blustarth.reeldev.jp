export const revalidate = 60

async function getResults() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:4000'}/api/results`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function ResultsPage() {
  const results = await getResults()

  return (
    <div className="circuit-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-heading font-700 text-4xl tracking-widest text-white mb-12">
          <span className="text-cyan">//</span> RESULTS
        </h1>

        {results.length === 0 ? (
          <p className="text-gray-mid font-body">レース結果はまだありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-body text-sm">
              <thead>
                <tr className="border-b border-cyan/30">
                  {['DATE', 'EVENT', 'CIRCUIT', 'CLASS', 'POS', 'DRIVER'].map(h => (
                    <th key={h} className="text-left py-3 px-3 font-heading font-600 text-xs tracking-widest text-cyan">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r: any) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-navy/40 transition-colors">
                    <td className="py-3 px-3 text-gray-mid whitespace-nowrap">{new Date(r.date).toLocaleDateString('ja-JP')}</td>
                    <td className="py-3 px-3 text-gray-light">{r.event}</td>
                    <td className="py-3 px-3 text-gray-mid">{r.circuit}</td>
                    <td className="py-3 px-3 text-gray-mid">{r.class}</td>
                    <td className="py-3 px-3">
                      <span className={`font-heading font-700 text-lg ${r.position === 1 ? 'text-cyan' : r.position <= 3 ? 'text-yellow-400' : 'text-gray-light'}`}>
                        {r.position ? `P${r.position}` : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-light">{r.driver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
