import { brand } from '../config/brand'

/** Square brand mark: the client's logo image if configured, else the initials badge. */
export function BrandMark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const box = size === 'lg' ? 'h-14 w-14 rounded-2xl text-lg shadow-lg' : 'h-9 w-9 rounded-lg text-sm shadow'
  if (brand.logoUrl) {
    return (
      <img
        src={brand.logoUrl}
        alt={`${brand.productName} logo`}
        className={`${size === 'lg' ? 'mx-auto h-14 w-14 rounded-2xl' : 'h-9 w-9 rounded-lg'} object-contain`}
      />
    )
  }
  return (
    <div
      className={`${size === 'lg' ? 'mx-auto ' : ''}flex ${box} items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent font-bold text-white`}
      aria-hidden="true"
    >
      {brand.logoText}
    </div>
  )
}
