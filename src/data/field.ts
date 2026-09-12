import type {
  OrderHistoryPoint,
  PosAsset,
  ShelfSlot,
  SurveyQuestion,
  SurveyResult,
} from '../types'

export const orderHistoryByCustomer: Record<string, OrderHistoryPoint[]> = {
  c1: [
    { week: 'W31', cases: 48 },
    { week: 'W32', cases: 52 },
    { week: 'W33', cases: 44 },
    { week: 'W34', cases: 58 },
    { week: 'W35', cases: 61 },
    { week: 'W36', cases: 55 },
  ],
  c2: [
    { week: 'W31', cases: 22 },
    { week: 'W32', cases: 28 },
    { week: 'W33', cases: 25 },
    { week: 'W34', cases: 30 },
    { week: 'W35', cases: 27 },
    { week: 'W36', cases: 32 },
  ],
  c3: [
    { week: 'W31', cases: 18 },
    { week: 'W32', cases: 20 },
    { week: 'W33', cases: 16 },
    { week: 'W34', cases: 24 },
    { week: 'W35', cases: 22 },
    { week: 'W36', cases: 26 },
  ],
  c4: [
    { week: 'W31', cases: 8 },
    { week: 'W32', cases: 10 },
    { week: 'W33', cases: 9 },
    { week: 'W34', cases: 11 },
    { week: 'W35', cases: 10 },
    { week: 'W36', cases: 12 },
  ],
  c5: [
    { week: 'W31', cases: 40 },
    { week: 'W32', cases: 38 },
    { week: 'W33', cases: 45 },
    { week: 'W34', cases: 42 },
    { week: 'W35', cases: 50 },
    { week: 'W36', cases: 47 },
  ],
  c6: [
    { week: 'W31', cases: 14 },
    { week: 'W32', cases: 16 },
    { week: 'W33', cases: 12 },
    { week: 'W34', cases: 18 },
    { week: 'W35', cases: 15 },
    { week: 'W36', cases: 17 },
  ],
}

export const surveyQuestions: SurveyQuestion[] = [
  { id: 'q1', label: 'Are our SKUs at planogram position?', type: 'yes_no', category: 'Shelf compliance' },
  { id: 'q2', label: 'Number of empty facings (OOS)', type: 'number', category: 'Shelf compliance' },
  { id: 'q3', label: 'Shelf share vs. competitors (%)', type: 'number', category: 'Shelf compliance' },
  { id: 'q4', label: 'Cooler door share (doors)', type: 'number', category: 'Cooler space' },
  { id: 'q5', label: 'Cooler temperature acceptable?', type: 'yes_no', category: 'Cooler space' },
  { id: 'q6', label: 'Competitor cooler encroachment?', type: 'select', options: ['None', 'Mild', 'Significant'], category: 'Cooler space' },
  { id: 'q7', label: 'Tap handles present?', type: 'yes_no', category: 'Tap handles' },
  { id: 'q8', label: 'Tap handle brands on draft', type: 'text', category: 'Tap handles' },
  { id: 'q9', label: 'Overall execution score (1-5)', type: 'select', options: ['1', '2', '3', '4', '5'], category: 'Overall' },
  { id: 'q10', label: 'Notes for next call', type: 'text', category: 'Overall' },
]

export let surveyResults: SurveyResult[] = [
  {
    id: 'sr1',
    customerId: 'c1',
    completedAt: '2026-09-08T14:22:00Z',
    answers: {
      q1: true,
      q2: 2,
      q3: 42,
      q4: 3,
      q5: true,
      q6: 'Mild',
      q7: false,
      q8: 'N/A',
      q9: '4',
      q10: 'Need more Twisted Tea Original facings on beer endcap; White Claw Black Cherry OOS on door 2.',
    },
  },
  {
    id: 'sr2',
    customerId: 'c3',
    completedAt: '2026-09-10T16:05:00Z',
    answers: {
      q1: true,
      q2: 0,
      q3: 55,
      q4: 1,
      q5: true,
      q6: 'None',
      q7: true,
      q8: 'Stella Artois, Ithaca Flower Power, Brooklyn Lager',
      q9: '5',
      q10: 'Stella tap handle installed; request Angry Orchard patio signage for fall push.',
    },
  },
]

export let posAssets: PosAsset[] = [
  {
    id: 'pos1',
    name: 'Twisted Tea Summer Endcap Display',
    type: 'display',
    customerId: 'c1',
    status: 'installed',
    requestedAt: '2026-08-20',
    notes: 'Installed beer aisle 4 endcap',
  },
  {
    id: 'pos2',
    name: 'White Claw Cooler Cling – Black Cherry',
    type: 'cooler_wrap',
    customerId: 'c2',
    status: 'in_transit',
    requestedAt: '2026-09-05',
    notes: 'Ship with Friday Buffalo route',
  },
  {
    id: 'pos3',
    name: 'Angry Orchard Shelf Talkers (pack of 20)',
    type: 'shelf_talker',
    customerId: 'c5',
    status: 'approved',
    requestedAt: '2026-09-09',
    notes: 'Cider set refresh ahead of fall',
  },
  {
    id: 'pos4',
    name: 'Stella Artois Tap Handle',
    type: 'tap_handle',
    customerId: 'c3',
    status: 'requested',
    requestedAt: '2026-09-11',
    notes: 'Replace worn handle on bar 2',
  },
  {
    id: 'pos5',
    name: 'Angry Orchard Patio Window Banner',
    type: 'signage',
    customerId: 'c4',
    status: 'retired',
    requestedAt: '2026-06-01',
    notes: 'Summer patio season ended',
  },
  {
    id: 'pos6',
    name: 'Miller Lite Neon-style Counter Sign',
    type: 'signage',
    customerId: 'c6',
    status: 'installed',
    requestedAt: '2026-07-15',
    notes: 'Bar back display',
  },
]

export function defaultShelfPlan(): ShelfSlot[] {
  return [
    // Shelf 1 — domestic beer
    { id: 's1-1', shelf: 1, position: 1, productId: 'p1', competitorBrand: null, oos: false, facingCount: 3 },
    { id: 's1-2', shelf: 1, position: 2, productId: 'p2', competitorBrand: null, oos: false, facingCount: 2 },
    { id: 's1-3', shelf: 1, position: 3, productId: 'p3', competitorBrand: null, oos: true, facingCount: 2 },
    { id: 's1-4', shelf: 1, position: 4, productId: null, competitorBrand: 'Heineken', oos: false, facingCount: 3 },
    // Shelf 2 — import / craft
    { id: 's2-1', shelf: 2, position: 1, productId: 'p6', competitorBrand: null, oos: false, facingCount: 2 },
    { id: 's2-2', shelf: 2, position: 2, productId: 'p7', competitorBrand: null, oos: false, facingCount: 2 },
    { id: 's2-3', shelf: 2, position: 3, productId: null, competitorBrand: 'Guinness', oos: false, facingCount: 2 },
    { id: 's2-4', shelf: 2, position: 4, productId: 'p10', competitorBrand: null, oos: false, facingCount: 1 },
    // Shelf 3 — hard tea / seltzer
    { id: 's3-1', shelf: 3, position: 1, productId: 'p17', competitorBrand: null, oos: false, facingCount: 3 },
    { id: 's3-2', shelf: 3, position: 2, productId: 'p18', competitorBrand: null, oos: false, facingCount: 2 },
    { id: 's3-3', shelf: 3, position: 3, productId: 'p19', competitorBrand: null, oos: true, facingCount: 2 },
    { id: 's3-4', shelf: 3, position: 4, productId: null, competitorBrand: 'High Noon', oos: false, facingCount: 2 },
    // Shelf 4 — cider / NA / more seltzer
    { id: 's4-1', shelf: 4, position: 1, productId: 'p15', competitorBrand: null, oos: false, facingCount: 2 },
    { id: 's4-2', shelf: 4, position: 2, productId: 'p20', competitorBrand: null, oos: false, facingCount: 2 },
    { id: 's4-3', shelf: 4, position: 3, productId: 'p22', competitorBrand: null, oos: false, facingCount: 1 },
    { id: 's4-4', shelf: 4, position: 4, productId: 'p23', competitorBrand: null, oos: false, facingCount: 1 },
  ]
}
