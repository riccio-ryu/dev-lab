import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuantitySelector } from './QuantitySelector'

describe('QuantitySelector', () => {
  it('현재 수량을 보여 준다.', () => {
    render(<QuantitySelector value={3} onChange={() => {}} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('늘리기 버튼을 누르면 1 늘린 값으로 onChange를 호출한다.', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<QuantitySelector value={3} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '수량 늘리기' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('줄이기 버튼을 누르면 1 줄인 값으로 onChange를 호출한다.', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<QuantitySelector value={3} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '수량 줄이기' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('수량이 1이면 줄이기 버튼을 비활성화하고, 눌러도 onChange를 호출하지 않는다.', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<QuantitySelector value={1} onChange={onChange} />)
    const minusButton = screen.getByRole('button', { name: '수량 줄이기' })
    expect(minusButton).toBeDisabled()
    await user.click(minusButton)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('수량이 99이면 늘리기 버튼을 비활성화한다.', () => {
    render(<QuantitySelector value={99} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '수량 늘리기' })).toBeDisabled()
  })

  it('max를 주면 그 값에서 늘리기 버튼을 비활성화한다.', () => {
    render(<QuantitySelector value={5} max={5} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '수량 늘리기' })).toBeDisabled()
  })
})
