'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button className="btn" onClick={() => disconnect()}>
        {address?.slice(0, 6)}...{address?.slice(-4)} · Disconnect
      </button>
    )
  }

  const connector = connectors[0]

  return (
    <button className="btn" disabled={!connector || isPending} onClick={() => connector && connect({ connector })}>
      {isPending ? 'Connecting...' : 'Conectar wallet'}
    </button>
  )
}
