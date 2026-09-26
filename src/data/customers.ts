import type { Customer } from '../types'

export const customers: Customer[] = [
  {
    id: 'c1',
    name: 'Wickgrove Market #18',
    accountNumber: 'WG-018',
    type: 'grocery',
    address: '4820 Larkspur Commons Dr',
    city: 'Rochester, NY',
    priceTier: 'A',
    suggestedPar: { p1: 24, p2: 18, p3: 20, p4: 12, p17: 16, p19: 12 },
  },
  {
    id: 'c2',
    name: 'Quarryfield Mart #42',
    accountNumber: 'QF-042',
    type: 'convenience',
    address: '2217 Tamarack Hollow Rd',
    city: 'Amherst, NY',
    priceTier: 'B',
    suggestedPar: { p1: 8, p3: 6, p17: 10, p18: 6, p19: 8, p7: 4 },
  },
  {
    id: 'c3',
    name: 'Driftlock Taproom',
    accountNumber: 'DT-001',
    type: 'on_premise',
    address: '88 Millrace Bend',
    city: 'Rochester, NY',
    priceTier: 'A',
    suggestedPar: { p6: 10, p10: 8, p11: 6, p14: 8, p15: 6 },
  },
  {
    id: 'c4',
    name: 'Gristbarrel Brewpub & Cafe',
    accountNumber: 'GB-312',
    type: 'restaurant',
    address: '317 Copperkettle Way',
    city: 'Rochester, NY',
    priceTier: 'C',
    suggestedPar: { p6: 4, p8: 4, p12: 6, p23: 4 },
  },
  {
    id: 'c5',
    name: 'Thistlepoint Grocers #215',
    accountNumber: 'TP-215',
    type: 'grocery',
    address: '1506 Sparrowhawk Blvd',
    city: 'Buffalo, NY',
    priceTier: 'B',
    suggestedPar: { p1: 18, p2: 14, p3: 16, p4: 10, p17: 12, p18: 8, p19: 10 },
  },
  {
    id: 'c6',
    name: 'Fernlight Wine Bar',
    accountNumber: 'FL-088',
    type: 'on_premise',
    address: '63 Corkscrew Hollow Ln',
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
