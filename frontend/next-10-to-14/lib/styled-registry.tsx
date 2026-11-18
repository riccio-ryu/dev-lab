'use client'

import { useServerInsertedHTML } from 'next/navigation'
import React, { useState } from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

// pages/_document.tsx의 ServerStyleSheet 역할을 App Router에서 대신한다.
// 서버 렌더링 중에 만들어진 스타일을 모아서 HTML 스트림의 <head>에 끼워 넣는다.
export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  // 요청마다 한 번만 만들도록 useState의 초기화 함수로 만든다
  const [sheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement()
    // 이미 내보낸 스타일은 지워서 다음 조각에 중복으로 들어가지 않게 한다.
    // 실제 instance는 내부 StyleSheet 객체라 clearTag가 있지만, @types/styled-components 5.x는
    // instance를 ServerStyleSheet 자신(this)으로 잘못 적어 두어서 타입을 직접 맞춘다. (v6부터는 필요 없음)
    ;(sheet.instance as unknown as { clearTag(): void }).clearTag()
    return <>{styles}</>
  })

  // 브라우저에서는 styled-components가 알아서 <style>을 관리하므로 그대로 렌더링한다
  if (typeof window !== 'undefined') return <>{children}</>

  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>
}
