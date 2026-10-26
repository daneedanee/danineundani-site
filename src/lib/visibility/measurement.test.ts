import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { classifyLink, sanitizeEvent, campaignFrom, publicPath, pickLinkEvent, signalEvent, eventNames, measuredPaths, retiredPaths } from './measurement.ts';
const base='https://www.daneedanee.com';
test('상품 이동과 상담 시작을 구분한다',()=>{
 assert.equal(classifyLink('https://www.latpeed.com/products/bxdTq',base),'diagnosis_click');
 assert.equal(classifyLink('https://www.latpeed.com/products/RjkkI',base),'challenge_click');
 assert.equal(classifyLink('/agency',base),'agency_click');
 assert.equal(classifyLink('/#consult',base),'contact_start');
 assert.equal(classifyLink('https://evil.example/?url='+base+'/agency',base),null);
});
test('사이트 안 진단 상세·다니레터 이동을 따로 센다 (2026-10-26)',()=>{
 assert.equal(classifyLink('/diagnosis',base),'diagnosis_page_click');
 assert.equal(classifyLink('/diagnosis#diagnosis-reviews',base),'diagnosis_page_click');
 assert.equal(classifyLink('/letter',base),'letter_click');
});
test('진단 상세 안에서 같은 페이지 구역으로 가는 링크는 이동으로 세지 않는다',()=>{
 assert.equal(classifyLink('#diagnosis-steps',base+'/diagnosis'),null);
 assert.equal(classifyLink('/diagnosis#diagnosis-reviews',base+'/diagnosis'),null);
 // 홈 안의 상담 구역 링크는 지금처럼 상담 시작으로 센다.
 assert.equal(classifyLink('/#consult',base+'/'),'contact_start');
});
test('링크에 붙인 이벤트 표시는 허용된 이름일 때만 쓴다',()=>{
 assert.equal(pickLinkEvent('workbook_click','/letter',base),'workbook_click');
 assert.equal(pickLinkEvent('purchase','/letter',base),'letter_click');
 assert.equal(pickLinkEvent(null,'/letter',base),'letter_click');
 // 페이지 진입·상담 성공 같은 신호 이름은 링크 표시로 만들 수 없다.
 assert.equal(pickLinkEvent('contact_success','/letter',base),'letter_click');
});
test('화면 안 신호는 고민 찾기·상담 성공만 받는다',()=>{
 assert.equal(signalEvent('finder_start'),'finder_start');
 assert.equal(signalEvent('finder_result'),'finder_result');
 assert.equal(signalEvent('contact_success'),'contact_success');
 assert.equal(signalEvent('diagnosis_click'),null);
 assert.equal(signalEvent({}),null);
});
test('이벤트는 허용 필드와 값만 받고 개인정보 필드는 버린다',()=>{
 assert.deepEqual(sanitizeEvent({event:'diagnosis_click',path:'/',campaign:'youtube_a',email:'private@example.com'}),{event:'diagnosis_click',path:'/',campaign:'youtube_a'});
 assert.deepEqual(sanitizeEvent({event:'finder_result',path:'/diagnosis',campaign:'none'}),{event:'finder_result',path:'/diagnosis',campaign:'none'});
 assert.equal(sanitizeEvent({event:'purchase',path:'/',campaign:'none'}),null);
 assert.equal(sanitizeEvent({event:'page_view',path:'/admin',campaign:'none'}),null);
 assert.equal(sanitizeEvent({event:'page_view',path:'/',campaign:'private@example.com'}),null);
});
test('허용된 캠페인만 인식하며 원래 검색어·이메일을 보관하지 않는다',()=>{
 assert.equal(campaignFrom('?utm_source=youtube&utm_campaign=innercircle_20261106&utm_content=video_a'),'youtube_a');
 assert.equal(campaignFrom('?utm_source=private@example.com'),'none');
 assert.equal(campaignFrom('?utm_source=youtube&utm_campaign=other&utm_content=video_a'),'none');
});
test('비공개 경로는 측정하지 않고 글 주소는 일반화한다',()=>{
 assert.equal(publicPath('/admin/notes'),null);
 assert.equal(publicPath('/blog/private-name'),'/blog/[slug]');
 assert.equal(publicPath('/about'),'/about');
 // 옛 주소(/notes)는 /blog 로 넘어가므로 세지 않는다.
 assert.equal(publicPath('/notes/private-name'),null);
 assert.equal(publicPath('/blog/topic/blog-marketing'),null);
 assert.equal(publicPath('/agency'),'/agency');
 assert.equal(publicPath('/diagnosis'),'/diagnosis');
});

test('운영 점검 제외는 다음 페이지까지 유지한다',async()=>{
 const m=await import('./measurement.ts');
 assert.equal(m.excludeMeasurement('?visibility_test=1',false),true);
 assert.equal(m.excludeMeasurement('',true),true);
 assert.equal(m.excludeMeasurement('',false),false);
});

const sqlList=(m:RegExpMatchArray|null,label:string)=>{
 assert.ok(m,label+' 목록을 찾지 못함');
 return m![1].split(',').map(s=>s.trim().replace(/^'|'$/g,''));
};

test('측정 SQL의 허용 목록이 코드의 이벤트·경로와 같다',()=>{
 const sql08=readFileSync(new URL('../../../supabase/08-visibility-events.sql',import.meta.url),'utf8');
 assert.deepEqual(sqlList(sql08.match(/event\s+text not null check \(event in \(([^)]*)\)\)/),'event'),[...eventNames]);
 // 경로 목록은 10번에서 새로 정했다(/notes → /blog, /about 추가). 옛 경로는 쌓인 기록 때문에 표에만 남긴다.
 const sql10=readFileSync(new URL('../../../supabase/10-visibility-blog-paths.sql',import.meta.url),'utf8');
 assert.deepEqual(sqlList(sql10.match(/check \(path in \(([^)]*)\)\)/),'path'),[...measuredPaths,...retiredPaths]);
});
