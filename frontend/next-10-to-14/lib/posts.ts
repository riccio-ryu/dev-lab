export type Post = {
  id: string
  title: string
  body: string
  createdAt: string
}

// 실제 DB 대신 쓰는 메모리 데이터
const posts: Post[] = [
  { id: '1', title: 'Next 10 시작하기', body: 'getStaticProps와 getServerSideProps를 써 본다.', createdAt: '2021-01-10' },
  { id: '2', title: 'next/image 써 보기', body: 'layout 속성으로 반응형 이미지를 만든다.', createdAt: '2021-02-03' },
  { id: '3', title: 'styled-components SSR', body: '_document에서 스타일을 수집한다.', createdAt: '2021-03-21' },
]

export function getAllPosts(): Post[] {
  return posts
}

export function getPost(id: string): Post | undefined {
  return posts.find((post) => post.id === id)
}
