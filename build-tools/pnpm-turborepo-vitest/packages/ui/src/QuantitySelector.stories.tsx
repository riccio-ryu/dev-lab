import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fn } from 'storybook/test'
import { QuantitySelector } from './QuantitySelector'

const meta = {
  component: QuantitySelector,
  tags: ['autodocs'],
  args: { value: 1, onChange: fn() }, // fn(): 누를 때마다 Actions 패널에 기록된다
  // 버튼을 누르면 args.value를 바꾼다. Controls 패널과 버튼이 같은 값을 본다
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <QuantitySelector
        {...args}
        onChange={(next) => {
          updateArgs({ value: next })
          args.onChange(next)
        }}
      />
    )
  },
} satisfies Meta<typeof QuantitySelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: 3 },
}

export const AtMin: Story = {
  // 줄이기 버튼이 비활성화된다
  args: { value: 1 },
}

export const AtMax: Story = {
  // 늘리기 버튼이 비활성화된다 (기본 max 99)
  args: { value: 99 },
}

export const CustomMax: Story = {
  // max를 주면 그 값에서 늘리기 버튼이 비활성화된다
  args: { value: 5, max: 5 },
}

// story가 그려지면 play가 늘리기를 눌러 확인한다.
// useArgs를 쓰면 누른 결과가 주소(args)에 저장돼 다시 열 때마다 1씩 커져서, 이 story만 수량을 자기 상태로 들고 있는다
export const ClickIncrease: Story = {
  args: { value: 3 },
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
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '수량 늘리기' }))
    await expect(canvas.getByText('4')).toBeInTheDocument()
    await expect(args.onChange).toHaveBeenCalledWith(4)
  },
}
