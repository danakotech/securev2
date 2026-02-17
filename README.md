# web3-security-layer

SaaS beta en **Next.js 14 + TypeScript + Tailwind** con App Router.

## Features
- Home `/`: análisis de contrato/token por `chain + address`, score 0–100 y alertas.
- PRO `/pro`: compra **lifetime** on-chain en Ethereum, Sepolia o Polygon en 2 pasos:
  1. Crear intent
  2. Pagar tx nativa y confirmar on-chain

## Requisitos
- Node.js LTS (recomendado 20+)
- npm
- Wallet EVM en navegador (MetaMask, Rabby, etc.)
- Proyecto Supabase

## Instalación (Windows PowerShell)
```powershell
git clone <TU_REPO_URL> web3-security-layer
cd web3-security-layer
npm install
Copy-Item .env.local.example .env.local
# Edita .env.local y pega tus valores reales
npm run dev
```

Abre: `http://localhost:3000`

## Variables de entorno
`.env.local.example` incluye placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RECEIVER_WALLET=
NEXT_PUBLIC_PRO_PRICE_WEI=
PRO_MIN_CONFIRMATIONS=
NEXT_PUBLIC_RPC_MAINNET=
NEXT_PUBLIC_RPC_SEPOLIA=
NEXT_PUBLIC_RPC_POLYGON=
GOPLUS_API_KEY=
```

> Nunca hardcodear secretos. `SUPABASE_SERVICE_ROLE_KEY` solo se usa en rutas server.

## Configurar Supabase
1. Crea un proyecto en Supabase.
2. En SQL Editor, ejecuta `supabase.sql`.
3. Copia URL pública y keys a `.env.local`.

## Configurar GoPlus
- Usa la Token Security API de GoPlus.
- Si tu plan requiere API key, colócala en `GOPLUS_API_KEY`.
- Si falla GoPlus, `/api/score` devuelve fallback conservador con warning.

## Probar flujo PRO en Sepolia (recomendado)
1. Conecta wallet con ETH de testnet.
2. En `/pro`, cambia a Sepolia.
3. Paso 1: crear intent.
4. Paso 2: pagar.
5. El backend verifica:
   - `to == receiver`
   - `from == payer`
   - `value >= amount`
   - `receipt.success`
   - confirmaciones mínimas `PRO_MIN_CONFIRMATIONS`
6. Si todo ok, wallet queda `is_pro=true` en `pro_wallets`.

## Scripts
```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Troubleshooting
- **Hydration mismatch wallet/red:** UI usa hydration gate y placeholders (`—`, `Ethereum`) hasta mount.
- **wagmi/connectors error:** este proyecto no importa `wagmi/connectors`; usa `multiInjectedProviderDiscovery: true`.
- **Env faltantes:** revisa `.env.local` y reinicia `npm run dev`.
- **Service role inválido:** verifica `SUPABASE_SERVICE_ROLE_KEY` (server-side) y permisos de tablas.
