import assert from 'node:assert/strict';
import {test} from 'node:test';
import {brandGraph} from './brand.ts';
test('웹사이트와 운영 사업자를 별개 항목으로 연결한다',()=>{
 const g=brandGraph('https://www.daneedanee.com',{name:'다니는다니',business:'마켓티브',email:'marktive@naver.com',description:'설명',blog:'https://blog.naver.com/marktive'});
 assert.equal(g['@graph'].length,2);
 assert.equal(g['@graph'][0]['@type'],'WebSite');
 assert.equal(g['@graph'][1]['name'],'마켓티브');
 assert.deepEqual(g['@graph'][1]['sameAs'],['https://blog.naver.com/marktive']);
 assert.deepEqual(g['@graph'][0]['publisher'],{'@id':'https://www.daneedanee.com/#organization'});
});
