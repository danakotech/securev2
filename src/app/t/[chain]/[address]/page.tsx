'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type ScoreResponse = {
  score: number
  riskLevel: string
  flags: Array<{ key: string; label: string; severity: string; value: string }>
  warning?: string
}

export default function TokenAnalysisPage({ params }: { params: { chain: string; address: string } }) {
  const [data, setData] = useState<ScoreResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/score?chain=${params.chain}&address=${params.address}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch score')
        if (active) setData(json)
      })
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [params.chain, params.address])

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Risk report · {params.chain}</h1>
      <p className="text-slate-400 break-all">{params.address}</p>

      {loading && <div className="card animate-pulse">Calculating score...</div>}
      {error && <div className="card border-red-500 text-red-300">{error}</div>}

      {data && (
        <section className="card space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-slate-300">Score</p>
              <p className="text-5xl font-bold">{data.score}</p>
            </div>
            <span className="rounded-full border border-slate-600 px-3 py-1 text-sm">{data.riskLevel}</span>
          </div>

          {data.warning && <p className="rounded bg-amber-950/40 p-2 text-amber-300">{data.warning}</p>}

          <div>
            <h2 className="mb-2 font-semibold">Risk alerts</h2>
            {data.flags.length === 0 ? (
              <p className="text-emerald-300">No critical flags found in lite analysis.</p>
            ) : (
              <ul className="space-y-2">
                {data.flags.map((flag) => (
                  <li key={flag.key} className="rounded border border-slate-700 p-3">
                    <div className="font-medium">{flag.label}</div>
                    <div className="text-xs uppercase text-slate-400">Severity: {flag.severity}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link href="/pro" className="btn inline-block">Activate Monitoring PRO</Link>
        </section>
      )}
    </main>
  )
}
