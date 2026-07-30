// `lite-youtube-embed` ships no TypeScript declarations. It is imported only for
// its side effect — registering the <lite-youtube> custom element — so an ambient
// module declaration (implicit `any`) is sufficient and keeps the production
// `next build` / `tsc` typecheck passing.
declare module 'lite-youtube-embed';
