import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'web3-security-layer',
  description: 'Web3 security scoring + on-chain PRO billing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
