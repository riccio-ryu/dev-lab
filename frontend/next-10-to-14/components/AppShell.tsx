'use client'

import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'
import RenderedAt from './RenderedAt'

// components/Layout.tsx의 App Router 버전.
// - <title>은 next/head 대신 각 page.tsx의 metadata가 맡는다.
// - styled 컴포넌트를 쓰므로 클라이언트 컴포넌트다.

const Nav = styled.nav`
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

// Layout.tsx에서는 <Link passHref legacyBehavior><NavLink>였다.
// Link 자체를 styled로 감싸면 Link가 만드는 <a> 하나에 스타일이 붙는다.
const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`

const Main = styled.main`
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
`

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav>
        <NavLink href="/">홈</NavLink>
        <NavLink href="/ssr">SSR</NavLink>
        <NavLink href="/client">CSR</NavLink>
        <NavLink href="/gallery">갤러리</NavLink>
      </Nav>
      <Main>{children}</Main>
      <RenderedAt />
    </>
  )
}
