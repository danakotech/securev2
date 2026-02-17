import Link from 'next/link'
import { HomeSearch } from '@/components/HomeSearch'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">web3-security-layer</h1>
          <p className="text-slate-300">SaaS beta para analizar riesgo de contratos y activar monitoring PRO.</p>
        </div>
        <ConnectWalletButton />
      </header>

      <HomeSearch />

      <section className="card">
        <h3 className="mb-2 text-lg font-semibold">¿Ya quieres monitoring?</h3>
        <p className="mb-4 text-slate-300">Activa PRO lifetime con pago on-chain nativo.</p>
        <Link href="/pro" className="btn inline-block">Ir a PRO</Link>
      </section>
    </main>
  )
}
