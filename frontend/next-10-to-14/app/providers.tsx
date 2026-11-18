'use client'

import React from 'react'
import { ThemeProvider } from 'styled-components'
import StyledComponentsRegistry from '../lib/styled-registry'
import { theme } from '../styles/theme'

// pages/_app.tsx의 ThemeProvider 역할. Context를 쓰므로 클라이언트 컴포넌트여야 한다.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyledComponentsRegistry>
  )
}
