'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { chainIdToName } from '@/lib/chains'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'

const RECEIVER = process.env.NEXT_PUBLIC_RECEIVER_WALLET as `0x${string}` | undefined
const PRICE_WEI = process.env.NEXT_PUBLIC_PRO_PRICE_WEI ?? '0'

export default function ProPage() {
  const { address, chainId, isConnected } = useAccount()
  const { switchChainAsync, isPending: switching } = useSwitchChain()
  const { sendTransactionAsync, isPending: sending } = useSendTransaction()

  const [mounted, setMounted] = useState(false)
  const [intentId, setIntentId] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => setMounted(true), [])

  const currentChainLabel = mounted ? chainIdToName[chainId ?? 1] ?? `Chain ${chainId}` : 'Ethereum'
  const currentAddress = mounted && address ? address : '—'
  const humanPrice = useMemo(() => formatEther(BigInt(PRICE_WEI || '0')), [])

  const createIntent = async () => {
    if (!address || !chainId) return
    setStatus('Creando intent...')
    const res = await fetch('/api/billing/eth/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payerAddress: address, chainId }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Intent error')
    setIntentId(json.intentId)
    setStatus(`Intent creado: ${json.intentId}`)
  }

  const payAndConfirm = async () => {
    if (!intentId || !RECEIVER || !address) return
    setStatus('Enviando pago on-chain...')
    const txHash = await sendTransactionAsync({ to: RECEIVER, value: BigInt(PRICE_WEI) })
    setStatus(`Tx enviada ${txHash}. Confirmando...`)

    for (let i = 0; i < 8; i += 1) {
      const res = await fetch('/api/billing/eth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentId, txHash }),
      })
      const json = await res.json()
      if (res.ok && json.confirmed) {
        setStatus('✅ PRO activado correctamente para tu wallet.')
        return
      }
      if (json.error && !String(json.error).includes('confirmations')) {
        throw new Error(json.error)
      }
      await new Promise((r) => setTimeout(r, 3000))
    }

    throw new Error('No se confirmó a tiempo. Reintenta en unos segundos.')
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">PRO Lifetime</h1>
      <div className="card space-y-3">
        <p>Precio: <span className="font-semibold">{humanPrice} ETH/MATIC</span></p>
        <p>Receiver: <span className="break-all text-slate-300">{RECEIVER ?? 'Configurar env'}</span></p>
        <p>Wallet: <span className="font-mono">{currentAddress}</span></p>
        <p>Red actual: <span className="font-semibold">{currentChainLabel}</span></p>
        <ConnectWalletButton />
      </div>

      <div className="card space-y-3">
        <p className="font-semibold">Cambiar red</p>
        <div className="flex flex-wrap gap-2">
          {[1, 11155111, 137].map((id) => (
            <button key={id} className="btn" disabled={!isConnected || switching} onClick={() => switchChainAsync({ chainId: id })}>
              {chainIdToName[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <button className="btn w-full" onClick={() => createIntent().catch((e) => setStatus(`❌ ${e.message}`))} disabled={!isConnected}>
          Paso 1: Crear intent
        </button>
        <button className="btn w-full" onClick={() => payAndConfirm().catch((e) => setStatus(`❌ ${e.message}`))} disabled={!intentId || sending}>
          Paso 2: Pagar y confirmar
        </button>
        {status && <p className="text-sm text-slate-300">{status}</p>}
      </div>
    </main>
  )
}
