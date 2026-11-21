'use client'

import { Button, QuantitySelector } from '@lab/ui'
import { discountedPrice, formatPrice } from '@lab/utils'
import { useState } from 'react'
import styles from './page.module.css'

const PRICE = 12900
const DISCOUNT_RATE = 10

// QuantitySelector에 onChange 함수를 넘겨야 해서 클라이언트 컴포넌트다
export default function ProductCard() {
  const [quantity, setQuantity] = useState(1)
  const salePrice = discountedPrice(PRICE, DISCOUNT_RATE)

  return (
    <section className={styles.card}>
      <h2>무선 이어폰</h2>
      <p>
        <del>{formatPrice(PRICE)}</del> <strong>{formatPrice(salePrice)}</strong> ({DISCOUNT_RATE}% 할인)
      </p>
      <QuantitySelector value={quantity} onChange={setQuantity} />
      <p>합계 {formatPrice(salePrice * quantity)}</p>
      <Button onClick={() => alert(`${quantity}개를 장바구니에 담았습니다`)}>장바구니 담기</Button>
    </section>
  )
}
