import { NextRequest, NextResponse } from 'next/server'
import { calculateRiskScore } from '@/lib/scoreEngine'
import { fetchGoPlusTokenSecurity } from '@/lib/goplus'
import { isValidAddress, isValidChainSlug } from '@/lib/validators'

type CacheValue = { expiresAt: number; payload: unknown }
const cache = new Map<string, CacheValue>()
const TTL_MS = 60_000

export async function GET(request: NextRequest) {
  const chain = request.nextUrl.searchParams.get('chain') || ''
  const address = request.nextUrl.searchParams.get('address') || ''

  if (!isValidChainSlug(chain)) {
    return NextResponse.json({ error: 'Invalid chain' }, { status: 400 })
  }

  if (!isValidAddress(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  const key = `${chain}:${address.toLowerCase()}`
  const hit = cache.get(key)
  if (hit && hit.expiresAt > Date.now()) {
    return NextResponse.json(hit.payload)
  }

  try {
    const goplus = await fetchGoPlusTokenSecurity(chain, address)
    const result = {
      ...calculateRiskScore(goplus.normalized),
      raw: goplus.raw,
    }
    cache.set(key, { expiresAt: Date.now() + TTL_MS, payload: result })
    return NextResponse.json(result)
  } catch {
    const fallback = {
      score: 20,
      riskLevel: 'HIGH',
      flags: [{ key: 'api_unavailable', label: 'GoPlus unavailable', severity: 'high', value: '1' }],
      warning: 'GoPlus API unavailable. Returning conservative fallback score.',
    }
    cache.set(key, { expiresAt: Date.now() + TTL_MS, payload: fallback })
    return NextResponse.json(fallback)
  }
}
