import type { Metadata } from 'next'
import Link from 'next/link'

// pages/404.tsx를 대신한다.
// app/ 폴더가 생기면 어디에도 없는 주소는 pages/404가 아니라 App Router의 not-found가 처리한다.
export const metadata: Metadata = {
  title: '404',
}

export default function NotFound() {
  return (
    <>
      <h1>페이지를 찾을 수 없습니다</h1>
      <Link href="/">홈으로</Link>
    </>
  )
}
