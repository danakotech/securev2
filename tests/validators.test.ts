import { describe, expect, it } from 'vitest'
import { isValidAddress, isValidChainSlug } from '@/lib/validators'

describe('validators', () => {
  it('validates EVM addresses', () => {
    expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true)
    expect(isValidAddress('0x123')).toBe(false)
  })

  it('validates chain slug', () => {
    expect(isValidChainSlug('ethereum')).toBe(true)
    expect(isValidChainSlug('bitcoin')).toBe(false)
  })
})
