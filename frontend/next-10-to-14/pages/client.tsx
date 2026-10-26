import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

// window를 쓰는 컴포넌트는 서버 렌더링에서 제외
const WindowSize = dynamic(() => import('../components/WindowSize'), {
  ssr: false,
  loading: () => <p>창 크기 계산 중...</p>,
})

type TimeResponse = {
  now: string
}

// CSR: 페이지 껍데기만 정적으로 만들고 데이터는 브라우저에서 가져온다
export default function ClientPage() {
  const [time, setTime] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  useEffect(() => {
    setFetchCount((count) => count + 1)
    fetch('/api/time')
      .then((res) => res.json())
      .then((data: TimeResponse) => setTime(data.now))
  }, [])

  return (
    <Layout title="CSR">
      <h1>클라이언트 사이드 렌더링</h1>
      <p>서버 시각: {time ?? '불러오는 중...'}</p>
      <p>fetch 호출 횟수: {fetchCount}</p>
      <WindowSize />
    </Layout>
  )
}
