import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAllPosts } from '../lib/posts'
import { List } from './List'

// title.template은 layout과 같은 폴더의 page에는 적용되지 않는다 (자식 폴더에만 적용).
// app/page.tsx는 app/layout.tsx와 같은 폴더라서 'title: 홈'이라고만 쓰면 제목이 '홈' 하나로 나온다.
export const metadata: Metadata = {
  // title: '홈',
  title: '홈 | next-10-to-14',
}

// getStaticProps 없이 서버 컴포넌트에서 바로 데이터를 가져온다.
// 동적 함수(headers, cookies 등)를 쓰지 않으므로 빌드할 때 한 번 렌더링된다 (SSG와 같음)
export default function Home() {
  const posts = getAllPosts()
  const generatedAt = new Date().toISOString()

  return (
    <>
      <h1>Next 10 블로그</h1>
      <Image
        src="/logo.png"
        alt="로고"
        width={120}
        height={120}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      <p>정적 생성 시각: {generatedAt}</p>
      <List>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
        <li>
          <Link href="/posts/999">없는 글 (404 확인용)</Link>
        </li>
      </List>
      <p>버전: {process.env.APP_VERSION}</p>
    </>
  )
}
