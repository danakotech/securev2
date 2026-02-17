'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { supportedChains, type ChainSlug } from '@/lib/chains'

export function HomeSearch() {
  const router = useRouter()
  const [chain, setChain] = useState<ChainSlug>('ethereum')
  const [address, setAddress] = useState('')
  const [isPending, startTransition] = useTransition()

  const onAnalyze = () => {
    if (!address) return
    startTransition(() => {
      router.push(`/t/${chain}/${address}`)
    })
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold">Contract / Token Analyzer</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <select className="rounded-lg border border-slate-700 bg-slate-900 p-3" value={chain} onChange={(e) => setChain(e.target.value as ChainSlug)}>
          {supportedChains.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <input
          className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-900 p-3"
          placeholder="0x..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <button className="btn w-full" onClick={onAnalyze} disabled={isPending || !address}>
        {isPending ? 'Analyzing...' : 'Analyze'}
      </button>
      {isPending && <div className="h-2 overflow-hidden rounded bg-slate-800"><div className="h-full w-1/2 animate-pulse bg-accent" /></div>}
    </div>
  )
}
