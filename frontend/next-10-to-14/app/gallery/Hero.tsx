'use client'

import styled from 'styled-components'

// styled 컴포넌트는 서버 컴포넌트에서 만들 수 없어서 클라이언트 파일로 뺐다.
// page.tsx는 metadata를 export해야 하므로 서버 컴포넌트로 남겨 둔다.
export const Hero = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
`
