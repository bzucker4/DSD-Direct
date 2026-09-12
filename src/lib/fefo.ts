import type { Lot } from '../types'
import { lots as seedLots } from '../data/warehouse'

/** Prefer earliest expiration first (FEFO). Expired lots are last. */
export function sortLotsFefo(lots: Lot[]): Lot[] {
  return [...lots].sort((a, b) => {
    const rank = (s: Lot['fefoStatus']) =>
      s === 'expired' ? 3 : s === 'prefer' ? 0 : s === 'expiring' ? 1 : 2
    const r = rank(a.fefoStatus) - rank(b.fefoStatus)
    if (r !== 0) return r
    return a.expirationDate.localeCompare(b.expirationDate)
  })
}

export function allocateFefo(
  productId: string,
  qtyNeeded: number,
  inventory: Lot[] = seedLots,
): { allocations: { lotId: string; lotCode: string; qty: number }[]; shortfall: number } {
  const available = sortLotsFefo(
    inventory.filter((l) => l.productId === productId && l.qtyOnHand > 0 && l.fefoStatus !== 'expired'),
  )
  const allocations: { lotId: string; lotCode: string; qty: number }[] = []
  let remaining = qtyNeeded
  for (const lot of available) {
    if (remaining <= 0) break
    const take = Math.min(lot.qtyOnHand, remaining)
    allocations.push({ lotId: lot.id, lotCode: lot.lotCode, qty: take })
    remaining -= take
  }
  return { allocations, shortfall: remaining }
}
