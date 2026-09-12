import type { Product } from '../types'

export const products: Product[] = [
  // Domestic beer
  { id: 'p1', sku: 'BEER-MLITE-24', name: 'Miller Lite 12oz 24pk', category: 'Domestic Beer', brand: 'Miller Lite', unit: 'case', casePack: 24, weightLbs: 26, heightIn: 10, parLevel: 48, basePrice: 24.5 },
  { id: 'p2', sku: 'BEER-CLITE-24', name: 'Coors Light 12oz 24pk', category: 'Domestic Beer', brand: 'Coors Light', unit: 'case', casePack: 24, weightLbs: 26, heightIn: 10, parLevel: 40, basePrice: 24.5 },
  { id: 'p3', sku: 'BEER-BLITE-24', name: 'Bud Light 12oz 24pk', category: 'Domestic Beer', brand: 'Bud Light', unit: 'case', casePack: 24, weightLbs: 26, heightIn: 10, parLevel: 44, basePrice: 23.75 },
  { id: 'p4', sku: 'BEER-ULTRA-12', name: 'Michelob Ultra 12oz 12pk', category: 'Domestic Beer', brand: 'Michelob Ultra', unit: 'case', casePack: 12, weightLbs: 14, heightIn: 8, parLevel: 28, basePrice: 16.5 },
  { id: 'p5', sku: 'BEER-BUD-24', name: 'Budweiser 12oz 24pk', category: 'Domestic Beer', brand: 'Budweiser', unit: 'case', casePack: 24, weightLbs: 27, heightIn: 10, parLevel: 32, basePrice: 24.0 },
  // Import
  { id: 'p6', sku: 'BEER-STELLA-12', name: 'Stella Artois 11.2oz 12pk', category: 'Import Beer', brand: 'Stella Artois', unit: 'case', casePack: 12, weightLbs: 18, heightIn: 9, parLevel: 20, basePrice: 22.5 },
  { id: 'p7', sku: 'BEER-MODELO-12', name: 'Modelo Especial 12oz 12pk', category: 'Import Beer', brand: 'Modelo', unit: 'case', casePack: 12, weightLbs: 15, heightIn: 8, parLevel: 24, basePrice: 19.75 },
  { id: 'p8', sku: 'BEER-CORONA-12', name: 'Corona Extra 12oz 12pk', category: 'Import Beer', brand: 'Corona', unit: 'case', casePack: 12, weightLbs: 16, heightIn: 9, parLevel: 22, basePrice: 20.5 },
  { id: 'p9', sku: 'BEER-XX-12', name: 'Dos Equis Lager 12oz 12pk', category: 'Import Beer', brand: 'Dos Equis', unit: 'case', casePack: 12, weightLbs: 15, heightIn: 8, parLevel: 14, basePrice: 19.25 },
  // Craft / NY craft
  { id: 'p10', sku: 'BEER-ITHACA-FP', name: 'Ithaca Beer Flower Power IPA 6pk', category: 'Craft Beer', brand: 'Ithaca Beer', unit: 'case', casePack: 24, weightLbs: 28, heightIn: 10, parLevel: 12, basePrice: 36.0 },
  { id: 'p11', sku: 'BEER-STIER-IPA', name: 'Southern Tier IPA 6pk Case', category: 'Craft Beer', brand: 'Southern Tier', unit: 'case', casePack: 24, weightLbs: 28, heightIn: 10, parLevel: 10, basePrice: 34.5 },
  { id: 'p12', sku: 'BEER-GENNY-24', name: 'Genesee Lager 12oz 24pk', category: 'Craft Beer', brand: 'Genesee', unit: 'case', casePack: 24, weightLbs: 26, heightIn: 10, parLevel: 18, basePrice: 21.0 },
  { id: 'p13', sku: 'BEER-SARANAC-12', name: 'Saranac Pale Ale 12pk', category: 'Craft Beer', brand: 'Saranac', unit: 'case', casePack: 12, weightLbs: 16, heightIn: 9, parLevel: 12, basePrice: 22.0 },
  { id: 'p14', sku: 'BEER-BKLN-12', name: 'Brooklyn Lager 12pk', category: 'Craft Beer', brand: 'Brooklyn Brewery', unit: 'case', casePack: 12, weightLbs: 16, heightIn: 9, parLevel: 14, basePrice: 23.5 },
  // Cider
  { id: 'p15', sku: 'CIDER-AO-CRISP-12', name: 'Angry Orchard Crisp Apple 12oz 12pk', category: 'Cider', brand: 'Angry Orchard', unit: 'case', casePack: 12, weightLbs: 15, heightIn: 8, parLevel: 16, basePrice: 21.5 },
  { id: 'p16', sku: 'CIDER-MCK-ORIG-12', name: "McKenzie's Original Hard Cider 12pk", category: 'Cider', brand: "McKenzie's", unit: 'case', casePack: 12, weightLbs: 15, heightIn: 8, parLevel: 10, basePrice: 20.75 },
  // Hard tea / seltzer / FMBs
  { id: 'p17', sku: 'TEA-TWIST-12', name: 'Twisted Tea Original 12oz 12pk', category: 'Hard Tea', brand: 'Twisted Tea', unit: 'case', casePack: 12, weightLbs: 14, heightIn: 8, parLevel: 28, basePrice: 23.0 },
  { id: 'p18', sku: 'TEA-TWIST-HH-12', name: 'Twisted Tea Half & Half 12pk', category: 'Hard Tea', brand: 'Twisted Tea', unit: 'case', casePack: 12, weightLbs: 14, heightIn: 8, parLevel: 20, basePrice: 23.0 },
  { id: 'p19', sku: 'SELZ-WC-BC-12', name: 'White Claw Black Cherry 12oz 12pk', category: 'Hard Seltzer', brand: 'White Claw', unit: 'case', casePack: 12, weightLbs: 12, heightIn: 7, parLevel: 24, basePrice: 24.5 },
  { id: 'p20', sku: 'SELZ-TRULY-LEM-12', name: 'Truly Lemonade 12oz 12pk', category: 'Hard Seltzer', brand: 'Truly', unit: 'case', casePack: 12, weightLbs: 12, heightIn: 7, parLevel: 16, basePrice: 23.75 },
  { id: 'p21', sku: 'FMB-MIKES-12', name: "Mike's Hard Lemonade 12pk", category: 'Hard Tea', brand: "Mike's Hard", unit: 'case', casePack: 12, weightLbs: 15, heightIn: 8, parLevel: 14, basePrice: 22.25 },
  // NA / other
  { id: 'p22', sku: 'NA-CLAUST-12', name: 'Clausthaler NA Beer 12pk', category: 'NA', brand: 'Clausthaler', unit: 'case', casePack: 12, weightLbs: 16, heightIn: 9, parLevel: 10, basePrice: 21.0 },
  { id: 'p23', sku: 'NA-TEA-PL-UNS-12', name: 'Pure Leaf Unsweetened Tea 18.5oz 12pk (NA Tea)', category: 'NA', brand: 'Pure Leaf', unit: 'case', casePack: 12, weightLbs: 18, heightIn: 9, parLevel: 12, basePrice: 14.5 },
  { id: 'p24', sku: 'NA-TEA-PL-SWT-12', name: 'Pure Leaf Sweet Tea 18.5oz 12pk (NA Tea)', category: 'NA', brand: 'Pure Leaf', unit: 'case', casePack: 12, weightLbs: 18, heightIn: 9, parLevel: 10, basePrice: 14.5 },
]

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductBySku(sku: string): Product | undefined {
  return products.find((p) => p.sku === sku)
}
