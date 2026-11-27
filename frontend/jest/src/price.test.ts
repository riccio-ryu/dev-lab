import { discountedPrice, formatPrice } from './price'

describe('formatPrice', () => {
  it('천 단위 쉼표와 원을 붙인다', () => {
    expect(formatPrice(12900)).toBe('12,900원')
  })

  it('음수도 처리한다', () => {
    expect(formatPrice(-12900)).toBe('-12,900원')
  })

  it('0도 처리한다', () => {
    expect(formatPrice(0)).toBe('0원')
  })

  it('소수점은 반올림한다', () => {
    expect(formatPrice(12900.1)).toBe('12,900원')
    expect(formatPrice(12900.5)).toBe('12,901원')
  })

  it('유한한 숫자가 아니면 TypeError를 던진다', () => {
    expect(() => formatPrice(NaN)).toThrow(TypeError)
    expect(() => formatPrice(Infinity)).toThrow(TypeError)
  })
})

describe('discountedPrice', () => {
  it('할인율이 0~100 사이의 정수가 아니면 RangeError를 던진다', () => {
    expect(() => discountedPrice(12900, -1)).toThrow(RangeError)
    expect(() => discountedPrice(12900, 101)).toThrow(RangeError)
    expect(() => discountedPrice(12900, 10.5)).toThrow(RangeError)
  })

  it('할인율이 0이면 원래 가격을 반환한다', () => {
    expect(discountedPrice(12900, 0)).toBe(12900)
  })

  it('할인율이 100이면 0을 반환한다', () => {
    expect(discountedPrice(12900, 100)).toBe(0)
  })

  it('할인가를 계산하고 1원 단위는 버린다', () => {
    expect(discountedPrice(12900, 10)).toBe(11610)
    expect(discountedPrice(999, 50)).toBe(499)
  })

  it('부동소수점 오차 없이 계산한다', () => {
    // 700 * 0.7 = 489.99999999999994 라서 소수를 곱하면 489원이 된다
    expect(discountedPrice(700, 30)).toBe(490)
  })
})
