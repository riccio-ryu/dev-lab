import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Home from './page'

describe('상품 목록', () => {
  it('상품 카드 5개를 보여 준다.', () => {
    // 1) render(<Home />)
    // 2) screen.getAllByRole('region')으로 카드를 전부 찾는다
    // 3) 길이가 5인지 확인한다 → toHaveLength(5)
    render(<Home />)
    const cards = screen.getAllByRole('region')
    expect(cards).toHaveLength(5)
  })

  it('노트북 카드에서 늘리기를 누르면 노트북 수량만 2가 된다.', async () => {
    // 1) const user = userEvent.setup() 후 render
    // 2) const laptop = within(screen.getByRole('region', { name: '노트북' }))
    // 3) laptop.getByRole('button', { name: '수량 늘리기' })를 user.click
    // 4) laptop.getByText('2')가 문서에 있는지 → toBeInTheDocument()
    const user = userEvent.setup()
    render(<Home />)
    const laptop = within(screen.getByRole('region', { name: '노트북' }))
    await user.click(laptop.getByRole('button', { name: '수량 늘리기' }))
    expect(laptop.getByText('2')).toBeInTheDocument()
  })

  it('노트북 수량을 바꿔도 마우스 수량은 1 그대로다.', async () => {
    // 1) 위와 같이 노트북 늘리기를 한 번 누른다
    // 2) 마우스 카드를 within으로 잡는다
    // 3) 그 안에서 getByText('1')이 있는지 확인한다
    const user = userEvent.setup()
    render(<Home />)
    const laptop = within(screen.getByRole('region', { name: '노트북' }))
    await user.click(laptop.getByRole('button', { name: '수량 늘리기' }))
    const mouse = within(screen.getByRole('region', { name: '마우스' }))
    expect(mouse.getByText('1')).toBeInTheDocument()
  })

  it('수량을 바꾸면 그 카드의 합계가 바뀐다.', async () => {
    // 무선 이어폰: 12900원의 10% 할인 = 11610원
    // 1) 이어폰 카드를 within으로 잡고 늘리기를 한 번 누른다
    // 2) 그 안에서 getByText('합계 23,220원')이 있는지 확인한다
    const user = userEvent.setup()
    render(<Home />)
    const earphone = within(screen.getByRole('region', { name: '무선 이어폰' }))
    await user.click(earphone.getByRole('button', { name: '수량 늘리기' }))
    expect(earphone.getByText('합계 23,220원')).toBeInTheDocument()
  })

  it('할인이 0%인 키보드는 할인 표시 없이 가격만 보여 준다.', () => {
    // 1) 키보드 카드를 within으로 잡는다
    // 2) queryByText(/할인/)이 없는지 확인한다 → not.toBeInTheDocument()
    // 3) getByText('89,000원')이 있는지 확인한다
    render(<Home />)
    const keyboard = within(screen.getByRole('region', { name: '키보드' }))
    expect(keyboard.queryByText(/할인/)).not.toBeInTheDocument()
    expect(keyboard.getByText('89,000원')).toBeInTheDocument()
  })
})
