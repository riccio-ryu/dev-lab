import ProductCard from './ProductCard'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>상품</h1>
      <ProductCard />
    </main>
  )
}
