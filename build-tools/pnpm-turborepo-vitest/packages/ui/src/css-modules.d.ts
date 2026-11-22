// ui는 따로 빌드하지 않아서 Next의 next-env.d.ts가 없다. 에디터가 .module.css import를 알아보게 한다
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
