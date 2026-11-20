export function formatPrice(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new TypeError(`가격은 유한한 숫자여야 합니다: ${amount}`)
  }
  return Math.round(amount).toLocaleString('ko-KR') + '원'
}

// rate는 % 단위 정수. 0.9를 곱하면 부동소수점 오차가 생겨서 정수끼리 먼저 곱한다
export function discountedPrice(price: number, rate: number): number {
  if (!Number.isInteger(rate) || rate < 0 || rate > 100) {
    throw new RangeError(`할인율은 0~100 사이의 정수여야 합니다: ${rate}`)
  }
  return Math.floor((price * (100 - rate)) / 100)
}
