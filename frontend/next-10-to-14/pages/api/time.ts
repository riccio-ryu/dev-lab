import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  now: string
}

export default function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ now: new Date().toISOString() })
}
