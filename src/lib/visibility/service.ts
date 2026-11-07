import { organizationId } from './entity.ts';

// 서비스 안내 페이지(/diagnosis, /agency)의 구조화 데이터. 누가(운영 사업자), 무엇을, 얼마에 제공하는지 적어
// AI가 "조건에 맞는 곳"을 고를 때 근거로 읽게 한다. 페이지에 이미 공개된 사실만 쓴다 (2026-11-07).
export function serviceGraph(
  base: string,
  info: {
    path: string;
    name: string;
    description: string;
    serviceType: string;
    offer?: { price: number; currency: string; url: string };
  },
) {
  const url = new URL(info.path, base).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': url + '#service',
    name: info.name,
    description: info.description,
    serviceType: info.serviceType,
    url,
    inLanguage: 'ko-KR',
    provider: { '@id': organizationId(base) },
    areaServed: { '@type': 'Country', name: '대한민국' },
    ...(info.offer
      ? {
          offers: {
            '@type': 'Offer',
            price: info.offer.price,
            priceCurrency: info.offer.currency,
            url: info.offer.url,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}
