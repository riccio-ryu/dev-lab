// Next 10 시절의 전형적인 설정 모음.
// 버전업 과정에서 하나씩 경고/에러가 나는 항목들이라 일부러 넣어 두었다.
module.exports = {
  reactStrictMode: false,

  images: {
    // 외부 이미지 허용 방식 (next/image)
    domains: ['picsum.photos'],
  },

  env: {
    APP_VERSION: 'next-10',
  },

  async redirects() {
    return [{ source: '/old-blog/:id', destination: '/posts/:id', permanent: true }]
  },

  // webpack 4 전용 문법: 클라이언트 번들에서 Node 내장 모듈을 빈 모듈로 대체
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = { fs: 'empty' }
    }
    return config
  },
}
