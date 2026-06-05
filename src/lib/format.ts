export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)} CAD`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}
