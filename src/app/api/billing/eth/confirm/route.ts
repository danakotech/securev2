import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getPublicClient } from '@/server/chainClients'

const schema = z.object({
  intentId: z.string().uuid(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
})

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    const supabase = getSupabaseAdmin()

    const { data: intent, error: intentError } = await supabase.from('payment_intents').select('*').eq('id', body.intentId).single()
    if (intentError || !intent) return NextResponse.json({ error: 'Intent not found' }, { status: 404 })

    const { data: existing } = await supabase.from('payments').select('id').eq('tx_hash', body.txHash.toLowerCase()).maybeSingle()
    if (existing) return NextResponse.json({ error: 'tx_hash already used' }, { status: 409 })

    const client = getPublicClient(intent.chain_id)
    const [tx, receipt, block] = await Promise.all([
      client.getTransaction({ hash: body.txHash as `0x${string}` }),
      client.getTransactionReceipt({ hash: body.txHash as `0x${string}` }),
      client.getBlockNumber(),
    ])

    const confirmations = Number(block - receipt.blockNumber + 1n)
    const minConf = Number(process.env.PRO_MIN_CONFIRMATIONS ?? '1')

    if (!tx.to || tx.to.toLowerCase() !== intent.receiver_address.toLowerCase()) return NextResponse.json({ error: 'Receiver mismatch' }, { status: 400 })
    if (tx.from.toLowerCase() !== intent.payer_address.toLowerCase()) return NextResponse.json({ error: 'Payer mismatch' }, { status: 400 })
    if (tx.value < BigInt(intent.amount_wei)) return NextResponse.json({ error: 'Amount too low' }, { status: 400 })
    if (receipt.status !== 'success') return NextResponse.json({ error: 'Transaction failed' }, { status: 400 })
    if (confirmations < minConf) return NextResponse.json({ error: `Waiting confirmations: ${confirmations}/${minConf}` }, { status: 202 })

    const txHashLower = body.txHash.toLowerCase()
    const now = new Date().toISOString()

    const { error: paymentError } = await supabase.from('payments').insert({
      intent_id: intent.id,
      tx_hash: txHashLower,
      payer_address: intent.payer_address,
      receiver_address: intent.receiver_address,
      amount_wei: intent.amount_wei,
      chain_id: intent.chain_id,
      confirmations,
      status: 'confirmed',
      confirmed_at: now,
    })
    if (paymentError) throw paymentError

    await supabase.from('payment_intents').update({ status: 'confirmed', updated_at: now }).eq('id', intent.id)
    await supabase.from('pro_wallets').upsert({ wallet_address: intent.payer_address, is_pro: true, pro_since: now, updated_at: now })

    return NextResponse.json({ confirmed: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Confirm error' }, { status: 500 })
  }
}
