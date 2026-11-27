// 에디터와 tsc가 .module.css import를 알아보게 한다. 실행할 때는 jest.config.js의 moduleNameMapper가 처리한다
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
