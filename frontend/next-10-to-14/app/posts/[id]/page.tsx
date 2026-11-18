import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPosts, getPost } from '../../../lib/posts'

// getStaticProps의 revalidate: 60
export const revalidate = 60

// getStaticPaths의 fallback: true. 빌드 때 없던 id도 요청이 오면 그때 만든다 (기본값이 true라 생략 가능)
export const dynamicParams = true

type Props = {
  params: { id: string }
}

// getStaticPaths의 paths: 첫 글 하나만 빌드할 때 만든다
export function generateStaticParams() {
  const [first] = getAllPosts()
  return [{ id: first.id }]
}

// <Layout title={post.title}>을 대신한다
export function generateMetadata({ params }: Props): Metadata {
  const post = getPost(params.id)
  return { title: post?.title }
}

// ISR: 첫 글 하나만 빌드 시 생성하고, 나머지는 요청이 오면 생성
export default function PostPage({ params }: Props) {
  const post = getPost(params.id)

  // getStaticProps의 notFound: true
  if (!post) notFound()

  return (
    <>
      <h1>{post.title}</h1>
      <small>{post.createdAt}</small>
      <p>{post.body}</p>
    </>
  )
}
