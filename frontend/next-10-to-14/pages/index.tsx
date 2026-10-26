import { GetStaticProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import Layout from '../components/Layout'
import { getAllPosts, Post } from '../lib/posts'

const List = styled.ul`
  padding-left: 20px;
  line-height: 2;
`

type Props = {
  posts: Post[]
  generatedAt: string
}

// SSG: 빌드 시점에 한 번 렌더링
export default function Home({ posts, generatedAt }: Props) {
  return (
    <Layout title="홈">
      <h1>Next 10 블로그</h1>
      <Image src="/logo.png" alt="로고" width={120} height={120} />
      <p>정적 생성 시각: {generatedAt}</p>
      <List>
        {posts.map((post) => (
          <li key={post.id}>
            {/* Next 12까지는 Link 안에 <a>를 직접 넣어야 한다 */}
            <Link href={`/posts/${post.id}`}>
              <a>{post.title}</a>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/posts/999">
            <a>없는 글 (404 확인용)</a>
          </Link>
        </li>
      </List>
      <p>버전: {process.env.APP_VERSION}</p>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      posts: getAllPosts(),
      generatedAt: new Date().toISOString(),
    },
  }
}
