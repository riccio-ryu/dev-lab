import type { Metadata } from 'next'
import ClientView from './ClientView'

// page.tsx를 'use client'로 만들면 metadata를 export할 수 없다.
// 그래서 page는 서버 컴포넌트로 두고, useState/useEffect를 쓰는 부분만 ClientView로 뺐다.
export const metadata: Metadata = {
  title: 'CSR',
}

export default function ClientPage() {
  return <ClientView />
}
