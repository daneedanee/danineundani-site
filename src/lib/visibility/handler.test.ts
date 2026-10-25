import assert from 'node:assert/strict';
import {test} from 'node:test';
import {receiveEvent} from './handler.ts';
const origin='https://www.daneedanee.com';
const request=(body:string,from=origin)=>new Request(origin+'/api/visibility/event',{method:'POST',headers:{origin:from,'content-type':'application/json'},body});
const valid=JSON.stringify({event:'page_view',path:'/',campaign:'none'});
test('꺼져 있으면 쓰기를 하지 않는다',async()=>{let saved=false;const r=await receiveEvent(request(valid),false,async()=>{saved=true;return true;},origin);assert.equal(r.status,404);assert.equal(saved,false);});
test('동일 출처와 허용 내용만 저장한다',async()=>{let saved:unknown;const r=await receiveEvent(request(valid),true,async row=>{saved=row;return true;},origin);assert.equal(r.status,204);assert.deepEqual(saved,JSON.parse(valid));});
test('다른 출처·큰 본문·잘못된 내용은 거부한다',async()=>{
 const save=async()=>{assert.fail('저장하면 안 됨');return true;};
 assert.equal((await receiveEvent(request(valid,'https://evil.example'),true,save,origin)).status,403);
 assert.equal((await receiveEvent(request(' '.repeat(2100)),true,save,origin)).status,413);
 assert.equal((await receiveEvent(request('{}'),true,save,origin)).status,400);
});
test('저장 실패를 성공으로 보고하지 않는다',async()=>{assert.equal((await receiveEvent(request(valid),true,async()=>false,origin)).status,503);});
