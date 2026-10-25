import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
test('측정 SQL은 공개 키에 직접 쓰기 권한을 주지 않는다',()=>{
 const sql=readFileSync(new URL('../../../supabase/08-visibility-events.sql',import.meta.url),'utf8');
 assert.doesNotMatch(sql,/grant\s+insert[\s\S]*?to\s+anon/i);
 assert.doesNotMatch(sql,/for\s+insert\s+to\s+anon/i);
});
