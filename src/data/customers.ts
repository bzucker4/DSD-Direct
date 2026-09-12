import type { Customer } from '../types'

export const customers: Customer[] = [
  {
    id: 'c1',
    name: 'Wegmans Rochester #18',
    accountNumber: 'WG-018',
    type: 'grocery',
    address: '1750 East Ave',
    city: 'Rochester, NY',
    priceTier: 'A',
    suggestedPar: { p1: 24, p2: 18, p3: 20, p4: 12, p17: 16, p19: 12 },
  },
  {
    id: 'c2',
    name: 'QuickFill #42',
    accountNumber: 'QF-042',
    type: 'convenience',
    address: '890 Niagara Falls Blvd',
    city: 'Amherst, NY',
    priceTier: 'B',
    suggestedPar: { p1: 8, p3: 6, p17: 10, p18: 6, p19: 8, p7: 4 },
  },
  {
    id: 'c3',
    name: 'The Distillery Taproom',
    accountNumber: 'DT-001',
    type: 'on_premise',
    address: '41 Cataract St',
    city: 'Rochester, NY',
    priceTier: 'A',
    suggestedPar: { p6: 10, p10: 8, p11: 6, p14: 8, p15: 6 },
  },
  {
    id: 'c4',
    name: 'Genesee Brew House Cafe',
    accountNumber: 'GB-312',
    type: 'restaurant',
    address: '25 Cataract St',
    city: 'Rochester, NY',
    priceTier: 'C',
    suggestedPar: { p6: 4, p8: 4, p12: 6, p23: 4 },
  },
  {
    id: 'c5',
    name: 'Tops Friendly Markets #215',
    accountNumber: 'TP-215',
    type: 'grocery',
    address: '350 Elmwood Ave',
    city: 'Buffalo, NY',
    priceTier: 'B',
    suggestedPar: { p1: 18, p2: 14, p3: 16, p4: 10, p17: 12, p18: 8, p19: 10 },
  },
  {
    id: 'c6',
    name: 'Finger Lakes Wine Bar',
    accountNumber: 'FL-088',
    type: 'on_premise',
    address: '12 Main St',
    city: 'Canandaigua, NY',
    priceTier: 'A',
    suggestedPar: { p6: 6, p14: 6, p15: 8, p16: 4, p10: 4 },
  },
]

export const priceMultipliers: Record<'A' | 'B' | 'C', number> = {
  A: 0.92,
  B: 1.0,
  C: 1.08,
}

export function customerPrice(basePrice: number, tier: 'A' | 'B' | 'C'): number {
  return Math.round(basePrice * priceMultipliers[tier] * 100) / 100
}

export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id)
}
