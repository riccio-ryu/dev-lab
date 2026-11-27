import { fetchStock } from './api'
import { canAddToCart } from './stock'

jest.mock('./api')
const mockedFetchStock = jest.mocked(fetchStock)

describe('canAddToCart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('재고가 3이면 3개는 담을 수 있다.', async () => {
    mockedFetchStock.mockResolvedValueOnce(3)
    const result = await canAddToCart('1', 3)
    expect(result).toBe(true)
  })

  it('재고보다 많이 담으면 false다', async () => {
    mockedFetchStock.mockResolvedValueOnce(3)
    const result = await canAddToCart('1', 4)
    expect(result).toBe(false)
  })

  it('fetchStock을 상품 id로 부른다.', async () => {
    mockedFetchStock.mockResolvedValueOnce(3)
    await canAddToCart('mouse', 3)
    expect(mockedFetchStock).toHaveBeenCalledWith('mouse')
    expect(mockedFetchStock).toHaveBeenCalledTimes(1)
  })
})
