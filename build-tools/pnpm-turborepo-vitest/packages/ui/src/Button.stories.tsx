import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

// 이 파일의 story들이 어떤 컴포넌트를 보여 주는지 정한다 // meta (export default): "이 파일은 어떤 컴포넌트의 story 모음인가"
const meta = {
  component: Button, // 보여 줄 컴포넌트
  tags: ['autodocs'], // Docs 페이지를 자동으로 만든다
} satisfies Meta<typeof Button>

export default meta

// story (export const): 화면 하나하나
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { children: '장바구니 담기' },
}

export const Secondary: Story = {
  // args: children은 '취소', variant는 'secondary'
  args: { children: '취소', variant: 'secondary' },
}

export const Disabled: Story = {
  // args: children은 '품절', disabled는 true
  args: { children: '품절', disabled: true },
}
