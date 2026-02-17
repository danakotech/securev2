import { isAddress } from 'viem'
import { chainSlugToId, type ChainSlug } from './chains'

export function isValidAddress(address: string) {
  return isAddress(address)
}

export function isValidChainSlug(value: string): value is ChainSlug {
  return value in chainSlugToId
}
