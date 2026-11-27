// Jest는 TS·JSX를 직접 못 읽어서 babel-jest가 테스트 전에 변환한다.
// Babel은 타입을 지우기만 하고 검사하지 않는다. 타입 검사는 npm run typecheck로 따로 한다.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
}
