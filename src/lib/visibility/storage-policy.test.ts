import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
const read=(name:string)=>readFileSync(new URL('../../../supabase/'+name,import.meta.url),'utf8');
test('측정 SQL은 공개 키에 직접 쓰기 권한을 주지 않는다',()=>{
 for(const name of ['08-visibility-events.sql','09-visibility-record-function.sql']) {
  const sql=read(name);
  assert.doesNotMatch(sql,/grant\s+insert[\s\S]*?to\s+anon/i,name);
  assert.doesNotMatch(sql,/for\s+insert\s+to\s+anon/i,name);
 }
});
test('기록 함수는 방문자용 키에만 실행을 열고, 검색 경로를 고정한다',()=>{
 const sql=read('09-visibility-record-function.sql');
 assert.match(sql,/security definer/i);
 assert.match(sql,/set search_path = ''/i);
 // 기본으로 열려 있는 실행 권한을 먼저 모두 거두고 anon 에만 다시 연다.
 assert.match(sql,/revoke all on function public\.cab_record_visibility_event\(text, text, text\) from public, anon, authenticated;/i);
 assert.match(sql,/grant execute on function public\.cab_record_visibility_event\(text, text, text\) to anon;/i);
 // 표에 넣기만 한다. 읽거나 지우는 문장이 없어야 한다.
 const body=sql.slice(sql.indexOf('as $$'),sql.lastIndexOf('$$'));
 assert.match(body,/insert into public\.cab_visibility_events \(event, path, campaign\)/i);
 assert.doesNotMatch(body,/\b(select|delete|update|truncate)\b/i);
});
