import { fetchStock } from './api'

export async function canAddToCart(productId: string, quantity: number): Promise<boolean> {
  const stock = await fetchStock(productId)
  return quantity <= stock
}
