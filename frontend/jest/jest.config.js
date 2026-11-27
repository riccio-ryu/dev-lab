/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Jest는 CSS를 import하지 못한다. CSS Modules는 클래스 이름을 그대로 돌려주는 가짜 객체로 바꾼다
  moduleNameMapper: {
    '\\.module\\.css$': 'identity-obj-proxy',
  },
}
