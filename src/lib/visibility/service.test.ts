import assert from 'node:assert/strict';
import { test } from 'node:test';
import { faqGraph, serviceGraph } from './service.ts';

const base = 'https://www.daneedanee.com';

test('서비스는 홈의 운영 사업자가 제공하고, 가격이 있으면 원화로 적는다', () => {
  const g = serviceGraph(base, {
    path: '/diagnosis',
    name: '블로그 진단 + 방향 제안 리포트',
    description: '설명',
    serviceType: '블로그 진단',
    offer: { price: 59000, currency: 'KRW', url: 'https://www.latpeed.com/products/bxdTq' },
  });
  assert.equal(g['@type'], 'Service');
  assert.equal(g['@id'], 'https://www.daneedanee.com/diagnosis#service');
  assert.deepEqual(g.provider, { '@id': 'https://www.daneedanee.com/#organization' });
  assert.equal(g.offers?.price, 59000);
  assert.equal(g.offers?.priceCurrency, 'KRW');
});

test('가격이 정해지지 않은 서비스(문의)는 offers 를 넣지 않는다', () => {
  const g = serviceGraph(base, { path: '/agency', name: '블로그 관리 대행', description: '설명', serviceType: '블로그 대행' });
  assert.equal('offers' in g, false);
});

test('자주 묻는 질문은 화면의 질문·답을 그대로 FAQPage 로 옮긴다', () => {
  const g = faqGraph([{ q: '계약 기간은?', a: '4주 단위입니다.' }]);
  assert.equal(g['@type'], 'FAQPage');
  assert.deepEqual(g.mainEntity[0], { '@type': 'Question', name: '계약 기간은?', acceptedAnswer: { '@type': 'Answer', text: '4주 단위입니다.' } });
});
