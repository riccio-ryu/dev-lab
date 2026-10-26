import Image from 'next/image'
import styled from 'styled-components'
import Layout from '../components/Layout'

const Hero = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
`

// next/image의 layout 속성 비교
export default function Gallery() {
  return (
    <Layout title="갤러리">
      <h1>next/image</h1>

      <h2>layout="fill"</h2>
      <Hero>
        <Image src="https://picsum.photos/id/1015/1200/480" alt="풍경" layout="fill" objectFit="cover" />
      </Hero>

      <h2>layout="responsive"</h2>
      <Image src="https://picsum.photos/id/1025/800/600" alt="강아지" width={800} height={600} layout="responsive" />

      <h2>layout="fixed"</h2>
      <Image src="/logo.png" alt="로고" width={64} height={64} layout="fixed" />
    </Layout>
  )
}
