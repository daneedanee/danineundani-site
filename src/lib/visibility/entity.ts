// 구조화 데이터에서 사이트·운영 사업자·사람을 가리키는 고정 주소(@id).
// 홈(brand.ts)·소개(about.ts)·칼럼(notes/jsonld.ts)·서비스(service.ts)가 모두 여기를 써야
// 검색엔진·AI가 "마켓티브(사업자) = 다니(대표) = 다니는다니(브랜드)"를 한 곳으로 묶어 읽는다 (2026-11-07).
export function rootUrl(base: string): string {
  return new URL('/', base).toString();
}
export const websiteId = (base: string) => rootUrl(base) + '#website';
export const organizationId = (base: string) => rootUrl(base) + '#organization';
export const personId = (base: string) => new URL('/about', base).toString() + '#dani';
