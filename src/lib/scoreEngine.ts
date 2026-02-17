export type ScoreFlag = {
  key: string
  label: string
  severity: 'low' | 'medium' | 'high'
  value: string
}

export type NormalizedSecurity = {
  isHoneypot?: string
  cannotSellAll?: string
  isBlacklisted?: string
  slippageModifiable?: string
  ownerChangeBalance?: string
  isProxy?: string
}

const risky = (value?: string) => value === '1' || value === 'true'

export function calculateRiskScore(security: NormalizedSecurity) {
  let score = 100
  const flags: ScoreFlag[] = []

  const checks: Array<[keyof NormalizedSecurity, string, number, ScoreFlag['severity']]> = [
    ['isHoneypot', 'Potential honeypot detected', 45, 'high'],
    ['cannotSellAll', 'Token may block full sell', 20, 'high'],
    ['isBlacklisted', 'Blacklisting behavior detected', 15, 'medium'],
    ['slippageModifiable', 'Slippage may be manipulated', 12, 'medium'],
    ['ownerChangeBalance', 'Owner can alter balances', 20, 'high'],
    ['isProxy', 'Proxy contract (upgrade risk)', 8, 'low'],
  ]

  for (const [field, label, penalty, severity] of checks) {
    if (risky(security[field])) {
      score -= penalty
      flags.push({ key: field, label, severity, value: security[field] ?? '1' })
    }
  }

  const bounded = Math.max(0, Math.min(100, score))
  const riskLevel = bounded >= 75 ? 'LOW' : bounded >= 45 ? 'MEDIUM' : 'HIGH'

  return { score: bounded, riskLevel, flags }
}
