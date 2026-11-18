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
  children: React.ReactNode
}

// React 17 타입에서는 React.FC가 children을 암묵적으로 포함한다.
// const Layout: React.FC<Props> = ({ title, children }) => {

// React 18 타입부터는 React.FC가 children을 자동으로 넣어 주지 않는다. Props에 직접 적는다.
const Layout = ({ title, children }: React.PropsWithChildren<Props>) => {
  return (
    <>
      <Head>
        <title>{title} | next-10-to-14</title>
      </Head>
      <Nav>
        {/* styled 컴포넌트를 <a>로 쓰려면 passHref가 필요하다 */}
        <Link href="/" passHref legacyBehavior>
          <NavLink>홈</NavLink>
        </Link>
        <Link href="/ssr" passHref legacyBehavior>
          <NavLink>SSR</NavLink>
        </Link>
        <Link href="/client" passHref legacyBehavior>
          <NavLink>CSR</NavLink>
        </Link>
        <Link href="/gallery" passHref legacyBehavior>
          <NavLink>갤러리</NavLink>
        </Link>
      </Nav>
      <Main>{children}</Main>
      <RenderedAt />
    </>
  )
}

export default Layout
