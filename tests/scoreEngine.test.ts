import { describe, expect, it } from 'vitest'
import { calculateRiskScore } from '@/lib/scoreEngine'

describe('calculateRiskScore', () => {
  it('returns high score when no flags', () => {
    const result = calculateRiskScore({})
    expect(result.score).toBe(100)
    expect(result.flags).toHaveLength(0)
    expect(result.riskLevel).toBe('LOW')
  })

  it('reduces score with risky values', () => {
    const result = calculateRiskScore({ isHoneypot: '1', cannotSellAll: '1' })
    expect(result.score).toBeLessThan(50)
    expect(result.riskLevel).toBe('HIGH')
    expect(result.flags.length).toBe(2)
  })
})
