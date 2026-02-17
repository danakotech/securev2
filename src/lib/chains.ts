export const chainSlugToId = {
  ethereum: 1,
  sepolia: 11155111,
  polygon: 137,
} as const

export type ChainSlug = keyof typeof chainSlugToId

export const chainIdToName: Record<number, string> = {
  1: 'Ethereum',
  11155111: 'Sepolia',
  137: 'Polygon',
}

export const supportedChains = Object.keys(chainSlugToId) as ChainSlug[]
