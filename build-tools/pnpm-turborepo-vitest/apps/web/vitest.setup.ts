import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// globals를 켜지 않아서 Testing Library가 테스트마다 화면을 자동으로 비우지 못한다
afterEach(() => {
  cleanup()
})
