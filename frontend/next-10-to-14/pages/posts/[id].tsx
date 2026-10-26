import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { getAllPosts, getPost, Post } from '../../lib/posts'

type Props = {
  post: Post
}

// ISR: 첫 글 하나만 빌드 시 생성하고, 나머지는 요청이 오면 생성 (fallback: true)
export default function PostPage({ post }: Props) {
  const router = useRouter()

  if (router.isFallback) {
    return <Layout title="로딩 중">로딩 중...</Layout>
  }

  return (
    <Layout title={post.title}>
      <h1>{post.title}</h1>
      <small>{post.createdAt}</small>
      <p>{post.body}</p>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const [first] = getAllPosts()
  return {
    paths: [{ params: { id: first.id } }],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<Props, { id: string }> = async ({ params }) => {
  const post = getPost(params!.id)

  if (!post) {
    return { notFound: true }
  }

  return {
    props: { post },
    revalidate: 60,
  }
}
