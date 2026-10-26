import Link from 'next/link'
import Layout from '../components/Layout'

export default function NotFound() {
  return (
    <Layout title="404">
      <h1>페이지를 찾을 수 없습니다</h1>
      <Link href="/">
        <a>홈으로</a>
      </Link>
    </Layout>
  )
}
