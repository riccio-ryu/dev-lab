import { getAllPosts } from '../../../lib/posts'

// GET만 만들어 두면 POST 같은 다른 메서드는 Next가 알아서 405를 돌려준다.
export function GET() {
  return Response.json(getAllPosts())
}
