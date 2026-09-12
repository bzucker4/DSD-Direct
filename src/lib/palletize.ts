import { getProduct as getSeedProduct } from '../data/products'
import type { PalletBuild, PickOrder, Product, TruckConfig } from '../types'

const DEFAULT_TRUCK: TruckConfig = {
  bays: 4,
  maxWeightLbs: 32000,
  maxHeightIn: 96,
  palletMaxWeightLbs: 2200,
  palletMaxHeightIn: 72,
}

/**
 * Heuristic: build route-sequenced pallets (last stop first for LIFO unload),
 * packing heavier cases lower, respecting weight/height caps.
 */
export function buildPallets(
  orders: PickOrder[],
  truck: TruckConfig = DEFAULT_TRUCK,
  resolveProduct: (id: string) => Product | undefined = getSeedProduct,
): PalletBuild[] {
  const sorted = [...orders].sort((a, b) => b.stopSequence - a.stopSequence)
  const pallets: PalletBuild[] = []
  let bay = 1

  for (const order of sorted) {
    const items = order.lines
      .map((line) => {
        const p = resolveProduct(line.productId)
        if (!p) return null
        return {
          productId: line.productId,
          cases: line.qty,
          weightLbs: p.weightLbs * line.qty,
          heightIn: p.heightIn,
          unitWeight: p.weightLbs,
          unitHeight: p.heightIn,
        }
      })
      .filter(Boolean) as {
      productId: string
      cases: number
      weightLbs: number
      heightIn: number
      unitWeight: number
      unitHeight: number
    }[]

    items.sort((a, b) => b.unitWeight - a.unitWeight)

    let current: PalletBuild = {
      id: `plt-${order.id}-1`,
      stopSequence: order.stopSequence,
      customerId: order.customerId,
      bay,
      layers: [],
      totalWeight: 0,
      totalHeight: 0,
      stable: true,
    }

    for (const item of items) {
      let remaining = item.cases
      while (remaining > 0) {
        const roomW = truck.palletMaxWeightLbs - current.totalWeight
        const roomH = truck.palletMaxHeightIn - current.totalHeight
        const maxByW = Math.floor(roomW / item.unitWeight)
        const maxByH = Math.floor(roomH / item.unitHeight)
        let fit = Math.min(remaining, maxByW, maxByH)
        if (fit <= 0) {
          if (current.layers.length > 0) {
            current.stable = current.totalWeight <= truck.palletMaxWeightLbs && current.totalHeight <= truck.palletMaxHeightIn
            pallets.push(current)
            bay = bay >= truck.bays ? 1 : bay + 1
            current = {
              id: `plt-${order.id}-${pallets.filter((p) => p.customerId === order.customerId).length + 1}`,
              stopSequence: order.stopSequence,
              customerId: order.customerId,
              bay,
              layers: [],
              totalWeight: 0,
              totalHeight: 0,
              stable: true,
            }
          }
          fit = Math.min(remaining, Math.floor(truck.palletMaxWeightLbs / item.unitWeight), Math.floor(truck.palletMaxHeightIn / item.unitHeight))
          if (fit <= 0) fit = 1
        }
        const layerWeight = fit * item.unitWeight
        const layerHeight = item.unitHeight
        current.layers.push({
          productId: item.productId,
          cases: fit,
          weightLbs: layerWeight,
          heightIn: layerHeight,
        })
        current.totalWeight += layerWeight
        current.totalHeight += layerHeight
        remaining -= fit
      }
    }

    if (current.layers.length > 0) {
      current.stable =
        current.totalWeight <= truck.palletMaxWeightLbs &&
        current.totalHeight <= truck.palletMaxHeightIn
      pallets.push(current)
      bay = bay >= truck.bays ? 1 : bay + 1
    }
  }

  return pallets.sort((a, b) => a.stopSequence - b.stopSequence || a.bay - b.bay)
}

export { DEFAULT_TRUCK }
