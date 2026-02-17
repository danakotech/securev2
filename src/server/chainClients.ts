import { createPublicClient, http } from 'viem'
import { mainnet, sepolia, polygon } from 'viem/chains'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env ${name}`)
  return value
}

export const publicClients = {
  1: createPublicClient({ chain: mainnet, transport: http(requiredEnv('NEXT_PUBLIC_RPC_MAINNET')) }),
  11155111: createPublicClient({ chain: sepolia, transport: http(requiredEnv('NEXT_PUBLIC_RPC_SEPOLIA')) }),
  137: createPublicClient({ chain: polygon, transport: http(requiredEnv('NEXT_PUBLIC_RPC_POLYGON')) }),
} as const

export function getPublicClient(chainId: number) {
  const client = publicClients[chainId as keyof typeof publicClients]
  if (!client) throw new Error(`Unsupported chainId ${chainId}`)
  return client
}
