import ProductCard from './ProductCard'
import styles from './page.module.css'
import { products } from './products'

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>상품</h1>
      {products.map((product) => (
        <ProductCard key={product.id} name={product.name} price={product.price} rate={product.rate} />
      ))}
    </main>
  )
}
