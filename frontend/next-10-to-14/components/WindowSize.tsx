import { useEffect, useState } from 'react'

// window에 접근하므로 서버에서는 렌더링할 수 없는 컴포넌트
export default function WindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <p>
      창 크기: {size.width} x {size.height}
    </p>
  )
}
