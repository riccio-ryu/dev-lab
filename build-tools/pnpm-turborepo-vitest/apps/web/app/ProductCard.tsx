'use client'

import { Button, QuantitySelector } from '@lab/ui'
import { discountedPrice, formatPrice } from '@lab/utils'
import { useId, useState } from 'react'
import styles from './page.module.css'

type Props = {
  name: string
  price: number
  rate: number
}

// QuantitySelector에 onChange 함수를 넘겨야 해서 클라이언트 컴포넌트다
export default function ProductCard({ name, price, rate }: Props) {
  const [quantity, setQuantity] = useState(1)
  // 카드가 여러 개라 id가 겹치지 않게 useId로 만든다
  const titleId = useId()
  const salePrice = discountedPrice(price, rate)

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId}>{name}</h2>
      {rate > 0 ? (
        <p>
          <del>{formatPrice(price)}</del> <strong>{formatPrice(salePrice)}</strong> ({rate}% 할인)
        </p>
      ) : (
        <p>
          <strong>{formatPrice(price)}</strong>
        </p>
      )}
      <QuantitySelector value={quantity} onChange={setQuantity} />
      <p>합계 {formatPrice(salePrice * quantity)}</p>
      <Button onClick={() => alert(`${name} ${quantity}개를 장바구니에 담았습니다`)}>장바구니 담기</Button>
    </section>
  )
}
