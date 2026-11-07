import assert from 'node:assert/strict';
import {test} from 'node:test';
import {brandGraph} from './brand.ts';
test('웹사이트와 운영 사업자를 별개 항목으로 연결하고, 사업자에 브랜드 별칭·대표·채널을 잇는다',()=>{
 const g=brandGraph('https://www.daneedanee.com',{name:'다니는다니',business:'마켓티브',email:'marktive@naver.com',description:'설명',logo:'/images/og/dani-profile.jpg',sameAs:['https://blog.naver.com/marktive','https://www.youtube.com/@다니는다니']});
 assert.equal(g['@graph'].length,2);
 assert.equal(g['@graph'][0]['@type'],'WebSite');
 const org=g['@graph'][1] as Record<string, unknown>;
 assert.equal(org['name'],'마켓티브');
 assert.equal(org['alternateName'],'다니는다니');
 assert.equal(org['logo'],'https://www.daneedanee.com/images/og/dani-profile.jpg');
 // 소개 페이지의 사람(about.ts)과 같은 id 여야 대표가 이어진다.
 assert.deepEqual(org['founder'],{'@id':'https://www.daneedanee.com/about#dani'});
 assert.deepEqual(org['sameAs'],['https://blog.naver.com/marktive','https://www.youtube.com/@다니는다니']);
 assert.deepEqual(g['@graph'][0]['publisher'],{'@id':'https://www.daneedanee.com/#organization'});
});
