import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { isValidAddress } from '@/lib/validators'

const schema = z.object({
  payerAddress: z.string(),
  chainId: z.number().int(),
})

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    if (!isValidAddress(body.payerAddress)) return NextResponse.json({ error: 'Invalid payerAddress' }, { status: 400 })

    const receiver = process.env.NEXT_PUBLIC_RECEIVER_WALLET
    const amountWei = process.env.NEXT_PUBLIC_PRO_PRICE_WEI
    if (!receiver || !amountWei) return NextResponse.json({ error: 'Missing billing env' }, { status: 500 })

    const supabase = getSupabaseAdmin()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString()

    const { data, error } = await supabase
      .from('payment_intents')
      .insert({
        payer_address: body.payerAddress.toLowerCase(),
        chain_id: body.chainId,
        receiver_address: receiver.toLowerCase(),
        amount_wei: amountWei,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ intentId: data.id })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Intent error' }, { status: 500 })
  }
}
