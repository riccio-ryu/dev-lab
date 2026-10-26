import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'
import RenderedAt from './RenderedAt'

const Nav = styled.nav`
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const NavLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`

const Main = styled.main`
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
`

type Props = {
  title: string
}

// React 17 타입에서는 React.FC가 children을 암묵적으로 포함한다.
const Layout: React.FC<Props> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title} | next-10-to-14</title>
      </Head>
      <Nav>
        {/* styled 컴포넌트를 <a>로 쓰려면 passHref가 필요하다 */}
        <Link href="/" passHref>
          <NavLink>홈</NavLink>
        </Link>
        <Link href="/ssr" passHref>
          <NavLink>SSR</NavLink>
        </Link>
        <Link href="/client" passHref>
          <NavLink>CSR</NavLink>
        </Link>
        <Link href="/gallery" passHref>
          <NavLink>갤러리</NavLink>
        </Link>
      </Nav>
      <Main>{children}</Main>
      <RenderedAt />
    </>
  )
}

export default Layout
