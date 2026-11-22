import { Button } from './Button'
import styles from './QuantitySelector.module.css'

type Props = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
}

export function QuantitySelector({ value, onChange, min = 1, max = 99 }: Props) {
  return (
    <div className={styles.wrapper}>
      <Button variant="secondary" aria-label="수량 줄이기" disabled={value <= min} onClick={() => onChange(value - 1)}>
        -
      </Button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <Button variant="secondary" aria-label="수량 늘리기" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </Button>
    </div>
  )
}
