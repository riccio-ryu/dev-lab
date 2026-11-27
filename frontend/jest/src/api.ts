// 실제로는 서버에 묻는다. 테스트에서는 jest.mock으로 이 모듈을 통째로 바꾼다
export async function fetchStock(productId: string): Promise<number> {
  const res = await fetch(`/api/stock/${productId}`)
  const data: { stock: number } = await res.json()
  return data.stock
}
