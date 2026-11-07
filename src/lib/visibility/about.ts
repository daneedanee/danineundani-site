import { organizationId, personId, websiteId } from './entity.ts';

// 소개 페이지(/about)의 구조화 데이터. 사람(다니)을 중심에 두고, 홈의 운영 사업자(brand.ts 의 #organization)와 잇는다.
// 검색엔진·AI가 "누가, 무엇을 하는 곳인지" 한 번에 읽게 하려는 것이다. 새 사실을 만들지 않고 공개된 정보만 쓴다 (2026-10-26).
export function aboutGraph(
  base: string,
  info: { name: string; alternateName: string; jobTitle: string; description: string; image: string; sameAs: readonly string[]; knowsAbout: readonly string[] },
) {
  const url = new URL('/about', base).toString();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'AboutPage', '@id': url + '#page', url, inLanguage: 'ko-KR', isPartOf: { '@id': websiteId(base) }, mainEntity: { '@id': personId(base) } },
      {
        '@type': 'Person',
        '@id': personId(base),
        name: info.name,
        alternateName: info.alternateName,
        jobTitle: info.jobTitle,
        description: info.description,
        image: new URL(info.image, base).toString(),
        url,
        worksFor: { '@id': organizationId(base) },
        knowsAbout: [...info.knowsAbout],
        sameAs: [...info.sameAs],
      },
    ],
  };
}
