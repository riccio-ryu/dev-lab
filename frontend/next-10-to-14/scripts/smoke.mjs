// 버전업 전후로 같은 결과가 나오는지 확인하는 스모크 테스트.
// 먼저 `npm run build && npm run start`로 서버를 띄운 뒤 다른 터미널에서 `npm run smoke`.
// Node 16과 20 모두에서 돌도록 fetch 대신 http 모듈을 쓴다.
import http from 'http'

const BASE = process.env.BASE_URL ?? 'http://localhost:3010'

const checks = [
  { name: 'SSG 홈', path: '/', status: 200, contains: ['Next 10 블로그', '/posts/1'] },
  { name: 'styled-components SSR', path: '/', status: 200, contains: ['data-styled'] },
  { name: '빌드 시 생성된 글', path: '/posts/1', status: 200, contains: ['Next 10 시작하기'] },
  { name: 'fallback 글', path: '/posts/2', status: 200 },
  { name: 'SSR 페이지', path: '/ssr', status: 200, contains: ['서버 사이드 렌더링'] },
  { name: 'SSR 리다이렉트', path: '/ssr?login=0', status: 307, location: '/' },
  { name: 'next.config 리다이렉트', path: '/old-blog/2', status: 308, location: '/posts/2' },
  { name: 'CSR 페이지', path: '/client', status: 200, contains: ['창 크기 계산 중'] },
  { name: 'next/image', path: '/gallery', status: 200, contains: ['/_next/image'] },
  { name: 'API GET', path: '/api/time', status: 200, contains: ['"now"'] },
  { name: 'API 405', path: '/api/posts', method: 'POST', status: 405 },
  { name: '없는 페이지', path: '/nope', status: 404, contains: ['페이지를 찾을 수 없습니다'] },
]

function request(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(new URL(path, BASE), { method }, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, body }))
    })
    req.on('error', reject)
    req.end()
  })
}

let failed = 0

for (const check of checks) {
  const errors = []
  try {
    const res = await request(check.path, check.method)
    if (res.status !== check.status) errors.push(`status ${res.status} (기대값 ${check.status})`)
    if (check.location && res.location !== check.location) errors.push(`location ${res.location} (기대값 ${check.location})`)
    for (const text of check.contains ?? []) {
      if (!res.body.includes(text)) errors.push(`본문에 "${text}" 없음`)
    }
  } catch (error) {
    errors.push(error.message)
  }

  if (errors.length) failed++
  console.log(`${errors.length ? '❌' : '✅'} ${check.name} (${check.method ?? 'GET'} ${check.path})${errors.length ? ' - ' + errors.join(', ') : ''}`)
}

console.log(`\n${checks.length - failed}/${checks.length} 통과`)
process.exit(failed ? 1 : 0)
