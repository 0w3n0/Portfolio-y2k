import tokens from '../design-system/tokens.json'

// Couleurs du thème Nuit pour ce qui ne lit pas les variables CSS (scène 3D, canvas, données).
const raw: Record<string, string> = Object.fromEntries(
  tokens.color.tokens.map((t) => [t.name, typeof t.value === 'string' ? t.value : t.value.nuit]),
)
// "{ink}" = référence à un autre token
const resolve = (v: string): string => (v.startsWith('{') ? resolve(raw[v.slice(1, -1)]) : v)
export const C = Object.fromEntries(Object.keys(raw).map((k) => [k, resolve(raw[k])])) as Record<string, string>
