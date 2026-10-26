import assert from 'node:assert/strict';
import { test } from 'node:test';
import { aboutGraph } from './about.ts';

const base = 'https://www.daneedanee.com';
const info = {
  name: '다니',
  alternateName: '다니는다니',
  jobTitle: '마켓티브 대표',
  description: '설명',
  image: '/images/danineundani/profile-photo.webp',
  sameAs: ['https://www.youtube.com/@다니는다니', 'https://blog.naver.com/marktive'],
  knowsAbout: ['블로그마케팅'],
};

test('소개 페이지는 사람(다니)을 중심으로 두고 홈의 운영 사업자와 잇는다', () => {
  const g = aboutGraph(base, info);
  const [page, person] = g['@graph'];
  assert.equal(page['@type'], 'AboutPage');
  assert.equal(page.url, 'https://www.daneedanee.com/about');
  assert.deepEqual(page.mainEntity, { '@id': 'https://www.daneedanee.com/about#dani' });
  assert.deepEqual(page.isPartOf, { '@id': 'https://www.daneedanee.com/#website' });
  assert.equal(person['@type'], 'Person');
  assert.equal(person.name, '다니');
  assert.equal(person.alternateName, '다니는다니');
  // 홈 구조화 데이터(brand.ts)의 Organization id 와 같아야 같은 사업자로 읽힌다.
  assert.deepEqual(person.worksFor, { '@id': 'https://www.daneedanee.com/#organization' });
  assert.equal(person.image, 'https://www.daneedanee.com/images/danineundani/profile-photo.webp');
  assert.deepEqual(person.sameAs, info.sameAs);
});
