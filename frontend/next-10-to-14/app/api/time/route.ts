// Next 14에서 GET Route Handler는 기본으로 빌드할 때 한 번 실행되고 결과가 캐시된다.
// 요청마다 현재 시각을 돌려주려면 동적으로 바꿔야 한다.
// 관찰용: 처음에는 주석 상태로 빌드해서 /api/time이 Static(○)으로 나오는지 본 뒤 주석을 푼다.
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ now: new Date().toISOString() })
}
