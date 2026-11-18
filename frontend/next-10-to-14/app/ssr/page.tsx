import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'SSR',
}

type Props = {
  searchParams: { login?: string }
}

// SSR: 요청마다 렌더링. ?login=0 이면 홈으로 리다이렉트
// getServerSideProps 대신 동적 함수 headers()와 searchParams를 쓰면 자동으로 요청마다 렌더링된다
export default function SsrPage({ searchParams }: Props) {
  // getServerSideProps의 return { redirect: { destination: '/', permanent: false } }
  if (searchParams.login === '0') {
    redirect('/')
  }

  // getServerSideProps의 req.headers['user-agent']
  const userAgent = headers().get('user-agent') ?? 'unknown'
  const requestedAt = new Date().toISOString()

  return (
    <>
      <h1>서버 사이드 렌더링</h1>
      <p>요청 시각: {requestedAt}</p>
      <p>User-Agent: {userAgent}</p>
    </>
  )
}
