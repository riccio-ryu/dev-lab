import type { Metadata } from 'next'
import React from 'react'
import AppShell from '../components/AppShell'
import '../styles/globals.css'
import Providers from './providers'

// Layout.tsx의 `<title>{`${title} | next-10-to-14`}</title>`을 대신한다.
// 각 page.tsx에서 metadata.title만 정하면 template에 끼워진다.
export const metadata: Metadata = {
  title: {
    template: '%s | next-10-to-14',
    default: 'next-10-to-14',
  },
}

// pages/_document.tsx(html, head, body)와 pages/_app.tsx(공통 Provider)를 합친 역할
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 구글 웹폰트를 link 태그로 직접 불러온다 (_document와 같은 방식. next/font는 나중에) */}
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
