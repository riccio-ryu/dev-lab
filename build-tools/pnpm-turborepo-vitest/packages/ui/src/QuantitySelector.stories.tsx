import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { QuantitySelector } from './QuantitySelector'

const meta = {
  component: QuantitySelector,
  tags: ['autodocs'],
  args: { value: 1, onChange: fn() }, // fn(): 누를 때마다 Actions 패널에 기록된다
  // 버튼을 누르면 화면의 숫자도 바뀌게, story 안에서 수량을 상태로 들고 있는다
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <QuantitySelector
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next)
          args.onChange(next)
        }}
      />
    )
  },
} satisfies Meta<typeof QuantitySelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // args: value는 3
  args: { value: 3 },
}

export const AtMin: Story = {
  // args: value는 1 → 줄이기 버튼이 비활성화되는지 눈으로 확인
  args: { value: 1 },
}

export const AtMax: Story = {
  // args: value는 99 → 늘리기 버튼이 비활성화
  args: { value: 99 },
}

export const CustomMax: Story = {
  // args: value는 5, max는 5 → 늘리기 버튼이 비활성화
  args: { value: 5, max: 5 },
}
