import assert from 'node:assert/strict';
import { test } from 'node:test';
import { videoLinkTarget } from './video-links.ts';

// 2026-10-28 대표 요청 "링크가 좀 긴데 줄일 수 없어?": 설명란에는 daneedanee.com/v/올린날짜/페이지 만 쓰고,
// 누르면 영상별 추적 표시가 붙은 페이지로 넘긴다.
test('짧은 영상 링크 → 추적 표시가 붙은 페이지', () => {
  const q = 'utm_source=youtube&utm_medium=video&utm_campaign=';
  assert.equal(videoLinkTarget('20261028', 'about'), `/about?${q}yt_20261028`);
  assert.equal(videoLinkTarget('20261028', 'diagnosis'), `/diagnosis?${q}yt_20261028`);
  assert.equal(videoLinkTarget('20261028b', 'letter'), `/letter?${q}yt_20261028b`);
  assert.equal(videoLinkTarget('20261028', undefined), `/?${q}yt_20261028`);
});

test('모르는 페이지나 이상한 날짜는 넘기지 않는다', () => {
  assert.equal(videoLinkTarget('20261028', 'admin'), null);
  assert.equal(videoLinkTarget('2026102', 'about'), null);
  assert.equal(videoLinkTarget('20261028', 'about%2F..%2Fadmin'), null);
  assert.equal(videoLinkTarget('yt_20261028', 'about'), null);
});
