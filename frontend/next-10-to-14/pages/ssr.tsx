import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

type Props = {
  userAgent: string
  requestedAt: string
}

// SSR: 요청마다 렌더링. ?login=0 이면 홈으로 리다이렉트
export default function SsrPage({ userAgent, requestedAt }: Props) {
  return (
    <Layout title="SSR">
      <h1>서버 사이드 렌더링</h1>
      <p>요청 시각: {requestedAt}</p>
      <p>User-Agent: {userAgent}</p>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, query }) => {
  if (query.login === '0') {
    return { redirect: { destination: '/', permanent: false } }
  }

  return {
    props: {
      userAgent: req.headers['user-agent'] ?? 'unknown',
      requestedAt: new Date().toISOString(),
    },
  }
}
