import { organizationId, personId, rootUrl, websiteId } from './entity.ts';

// 홈의 구조화 데이터: 사이트(다니는다니)와 운영 사업자(마켓티브). 새 사실을 만들지 않고 공개된 정보만 쓴다.
// 2026-11-07: 사업자에 브랜드 별칭·대표(소개 페이지의 사람)·운영 채널을 이어, 이름이 셋으로 갈려 읽히지 않게 했다.
export function brandGraph(
  base: string,
  info: { name: string; business: string; email: string; description: string; logo: string; sameAs: readonly string[] },
) {
  const root = rootUrl(base);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': websiteId(base), url: root, name: info.name, description: info.description, inLanguage: 'ko-KR', publisher: { '@id': organizationId(base) } },
      {
        '@type': 'Organization',
        '@id': organizationId(base),
        name: info.business,
        alternateName: info.name,
        url: root,
        logo: new URL(info.logo, base).toString(),
        email: info.email,
        founder: { '@id': personId(base) },
        sameAs: [...info.sameAs],
      },
    ],
  };
}
