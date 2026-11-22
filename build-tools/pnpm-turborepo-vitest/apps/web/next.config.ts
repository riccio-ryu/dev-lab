import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ui는 .tsx 소스를 그대로 내보내서 Next가 컴파일해야 한다. utils는 이미 빌드된 dist를 쓰므로 넣지 않는다
  transpilePackages: ['@lab/ui'],
}

export default nextConfig
