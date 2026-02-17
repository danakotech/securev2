import { chainSlugToId, type ChainSlug } from './chains'

const CHAIN_ID_TO_GOPLUS: Record<ChainSlug, string> = {
  ethereum: '1',
  sepolia: '11155111',
  polygon: '137',
}

export async function fetchGoPlusTokenSecurity(chain: ChainSlug, address: string) {
  const chainId = CHAIN_ID_TO_GOPLUS[chain]
  const apiKey = process.env.GOPLUS_API_KEY
  const endpoint = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address}`

  const res = await fetch(endpoint, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`GoPlus request failed: ${res.status}`)
  }

  const data = await res.json()
  const tokenData = data?.result?.[address.toLowerCase()] || data?.result?.[address]
  if (!tokenData) {
    throw new Error('Token data unavailable in GoPlus response')
  }

  return {
    chainId: chainSlugToId[chain],
    raw: tokenData,
    normalized: {
      isHoneypot: tokenData.is_honeypot,
      cannotSellAll: tokenData.cannot_sell_all,
      isBlacklisted: tokenData.is_blacklisted,
      slippageModifiable: tokenData.slippage_modifiable,
      ownerChangeBalance: tokenData.owner_change_balance,
      isProxy: tokenData.is_proxy,
    },
  }
}
