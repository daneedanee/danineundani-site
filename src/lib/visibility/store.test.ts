import assert from 'node:assert/strict';
import { test } from 'node:test';
import { storeEvent } from './store.ts';

const row = { event: 'page_view', path: '/diagnosis', campaign: 'none' };

test('기록 함수에 허용된 세 값만 넘긴다', async () => {
  let called: { fn: string; args: unknown } | null = null;
  const ok = await storeEvent(row, async (fn, args) => { called = { fn, args }; return { error: null }; });
  assert.equal(ok, true);
  assert.deepEqual(called, { fn: 'cab_record_visibility_event', args: { p_event: 'page_view', p_path: '/diagnosis', p_campaign: 'none' } });
});

test('데이터베이스 오류는 실패로 돌려준다', async () => {
  assert.equal(await storeEvent(row, async () => ({ error: { message: 'denied' } })), false);
});

test('연결이 끊겨 예외가 나도 실패로 돌려준다', async () => {
  assert.equal(await storeEvent(row, async () => { throw new Error('network'); }), false);
});
