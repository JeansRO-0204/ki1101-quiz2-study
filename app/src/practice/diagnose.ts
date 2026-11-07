// Specific numeric diagnoses: power-of-ten slips, sign errors, per-mole vs per-photon, eV vs J.
import { CONST, sci } from '../lib/kit'

const near = (a: number, b: number, tol = 0.03) => Math.abs(a - b) / Math.abs(b) <= tol
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (n: number) => String(n).replace(/[-0-9]/g, (c) => SUP[c])

/** Returns a message explaining a wrong numeric answer, or null if nothing specific was detected. */
export function diagnose(v: number, ans: number, unit?: string): string | null {
  if (!Number.isFinite(v) || ans === 0) return null
  if (v === 0) return 'You entered 0: check that you did not drop the exponent.'
  const r = v / ans
  const unitHint = (k: number) => {
    const a = Math.abs(k)
    if (a === 9) return k > 0 ? ': check nm → m (1 nm = 10⁻⁹ m)' : ': check m → nm (1 m = 10⁹ nm)'
    if (a === 3) return k > 0 ? ': check kJ ↔ J or the prefix k' : ': check J → kJ'
    if (a === 6) return ': check the prefix µ / M'
    if (a === 12) return ': check pm → m'
    if (a === 10) return ': check Å → m'
    return ': check the unit conversion and your exponent'
  }
  if (near(r, -1)) return 'Right size but the **sign** is opposite. Check which way the energy changes (emission is negative for the atom, final − initial).'
  const lg = Math.log10(Math.abs(r))
  const k = Math.round(lg)
  if (k !== 0 && Math.abs(lg - k) < 0.02) return `Off by a factor of 10${sup(k)}${unitHint(k)}.`
  const specials: [number, string][] = [
    [CONST.NA, 'Off by a factor of N_A: **per photon vs per mole**. Divide by N_A for one photon, multiply for a mole.'],
    [CONST.NA / 1000, 'Off by N_A/1000: per photon (J) vs per mole (**kJ**/mol): check both the mole and the kilo.'],
    [CONST.e, 'Off by the elementary charge 1.602×10⁻¹⁹: **eV vs J** mix-up.'],
  ]
  for (const [f, msg] of specials) {
    if (near(r, f, 0.04) || near(r, 1 / f, 0.04)) return msg
  }
  if (near(Math.abs(r), 2, 0.03) || near(Math.abs(r), 0.5, 0.03)) return `Off by a factor of 2 (you are ${r > 1 ? 'twice' : 'half'} the right value): look for a missing or extra ½ or ×2.`
  if (near(Math.abs(r), 2 * Math.PI, 0.03) || near(Math.abs(r), 1 / (2 * Math.PI), 0.03)) return 'Off by a factor of 2π: do not include 2π in λν = c or E = hν.'
  if (unit && Math.abs(Math.log10(Math.abs(r))) < 0.3) return `Close but outside tolerance: ${sci(v)} vs expected about ${sci(ans)}. Check rounding and the constants you used.`
  return null
}
