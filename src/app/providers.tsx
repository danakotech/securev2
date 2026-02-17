'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider, http } from 'wagmi'
import { mainnet, sepolia, polygon } from 'wagmi/chains'
import { useState } from 'react'

const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_MAINNET),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_SEPOLIA),
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_POLYGON),
  },
  multiInjectedProviderDiscovery: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
