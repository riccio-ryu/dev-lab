import type { NextApiRequest, NextApiResponse } from 'next'
import { getAllPosts, Post } from '../../lib/posts'

export default function handler(req: NextApiRequest, res: NextApiResponse<Post[] | { error: string }>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  res.status(200).json(getAllPosts())
}
