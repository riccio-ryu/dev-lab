export type Product = {
  id: string
  name: string
  price: number
  rate: number
}

export const products: Product[] = [
  { id: 'earbuds', name: '무선 이어폰', price: 12900, rate: 10 },
  { id: 'laptop', name: '노트북', price: 1290000, rate: 15 },
  { id: 'tablet', name: '태블릿', price: 699000, rate: 5 },
  { id: 'keyboard', name: '키보드', price: 89000, rate: 0 },
  { id: 'mouse', name: '마우스', price: 39000, rate: 20 },
]
