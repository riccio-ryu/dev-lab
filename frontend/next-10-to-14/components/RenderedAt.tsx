import styled from 'styled-components'

const Footer = styled.footer`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
`

// 렌더링된 시각을 보여 주는 푸터
export default function RenderedAt() {
  return <Footer>렌더 시각: {new Date().toLocaleTimeString('ko-KR')}</Footer>
}
