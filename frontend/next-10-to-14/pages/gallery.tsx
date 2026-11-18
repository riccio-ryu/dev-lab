import Image from 'next/image'
import styled from 'styled-components'
import Layout from '../components/Layout'

const Hero = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
`

// codemod는 sizes="100vw"를 넣지만, 실제 너비는 Layout Main의 내용 영역(720px - 좌우 padding 24px = 672px)이 최대다
const CONTENT_SIZES = '(max-width: 720px) 100vw, 672px'

// next/image의 layout 속성 비교
export default function Gallery() {
  return (
    <Layout title="갤러리">
      <h1>next/image</h1>

      <h2>layout="fill"</h2>
      <Hero>
        <Image
          src="https://picsum.photos/id/1015/1200/480"
          alt="풍경"
          fill
          sizes={CONTENT_SIZES}
          style={{
            objectFit: 'cover',
          }}
        />
      </Hero>

      <h2>layout="responsive"</h2>
      <Image
        src="https://picsum.photos/id/1025/800/600"
        alt="강아지"
        width={800}
        height={600}
        sizes={CONTENT_SIZES}
        style={{
          width: '100%',
          height: 'auto',
        }}
      />

      <h2>layout="fixed"</h2>
      <Image src="/logo.png" alt="로고" width={64} height={64} />
    </Layout>
  )
}
