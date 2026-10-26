#!/usr/bin/env python3
"""무료 공개 웹 점검. 유료 API 호출/로그인/색인 판정은 하지 않는다."""
import argparse
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import socket
import ssl
import urllib.parse
import urllib.request
from urllib.error import HTTPError, URLError
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

BASE = 'https://www.daneedanee.com'
HERE = Path(__file__).resolve().parent
KST = timezone(timedelta(hours=9))
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
UUID = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', re.I)
STATUS_LABEL = {'ok':'정상 수집','partial':'일부 수집 실패','failed':'수집 실패'}
ERROR_LABEL = {'dns':'이름 해석 실패','timeout':'시간 초과','connection':'연결 실패','tls':'보안 연결 실패','size_limit':'응답 크기 초과','other':'기타 오류'}
# error_kind가 없는 옛 기록은 오류 문구로 분류한다.
ERROR_HINTS = (('dns',('nodename nor servname','Name or service not known','name resolution','getaddrinfo')),('timeout',('timed out',)),('tls',('CERTIFICATE','SSL')),('connection',('refused','reset','unreachable')),('size_limit',('응답 크기 제한',)))

class ResponseTooLarge(ValueError): pass

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack=[]; self.text=[]; self.headings=[]; self.title=[]
        self.links=[]; self.robots=''; self.canonical=''; self.jsonld=[]
        self.ld_buffer=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='meta' and a.get('name','').lower()=='robots': self.robots=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href','')
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        hidden = any(s[1] for s in self.stack) or tag in {'script','style','noscript','template'} or 'hidden' in a or a.get('aria-hidden')=='true'
        if tag=='script' and a.get('type')=='application/ld+json': self.ld_buffer=[]
        if tag not in VOID: self.stack.append((tag, hidden))
        if tag=='h1': self.headings.append([])
    def handle_endtag(self,tag):
        if tag=='script' and self.ld_buffer is not None:
            try: self.jsonld.append(json.loads(''.join(self.ld_buffer)))
            except (ValueError,TypeError): pass
            self.ld_buffer=None
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag:
                self.stack=self.stack[:i]; break
    def handle_data(self,data):
        tags=[s[0] for s in self.stack]
        if self.ld_buffer is not None and 'script' in tags: self.ld_buffer.append(data)
        if any(s[1] for s in self.stack): return
        if 'title' in tags: self.title.append(data); return
        if 'head' in tags: return
        self.text.append(data)
        if 'h1' in tags and self.headings: self.headings[-1].append(data)

def parse_html(value):
    p=PageParser(); p.feed(value)
    clean=lambda x: re.sub(r'\s+',' ', ''.join(x)).strip()
    return {'title':clean(p.title),'h1':[clean(x) for x in p.headings], 'text':clean(p.text), 'links':list(dict.fromkeys(p.links)), 'robots':p.robots,'canonical':p.canonical,'jsonld':p.jsonld}

def questions(): return json.loads((HERE/'questions.json').read_text())

def parse_time(value):
    # Python 3.9의 fromisoformat은 끝의 Z를 읽지 못한다.
    value=value.strip()
    if value[-1:] in ('Z','z'): value=value[:-1]+'+00:00'
    return value, datetime.fromisoformat(value)

def validate_observation(value):
    allowed={'recommended','mentioned','cited_only','not_mentioned','unable_to_check'}
    if not isinstance(value,dict) or value.get('status') not in allowed: raise ValueError('status가 올바르지 않습니다.')
    if value.get('question_id') not in {q['id'] for q in questions()}: raise ValueError('고정 질문 ID가 아닙니다.')
    for key in ('platform','mode','observed_at','answer'):
        if not isinstance(value.get(key),str) or not value[key].strip(): raise ValueError(key+' 원문이 필요합니다.')
    value=dict(value)
    value['observed_at'],dt=parse_time(value['observed_at'])
    if dt.tzinfo is None: raise ValueError('시간대가 필요합니다.')
    quote=value.get('evidence_quote','')
    if value['status'] in {'recommended','mentioned','cited_only'} and (not isinstance(quote,str) or not quote or quote not in value['answer']):
        raise ValueError('답변 원문에 있는 근거 문장이 필요합니다.')
    if value['status'] in {'recommended','mentioned'} and not any(n in quote for n in ('다니는다니','다니는 다니','마켓티브','daneedanee')):
        raise ValueError('브랜드를 확인할 수 있는 근거 문장이 필요합니다.')
    sources=value.get('sources')
    if not isinstance(sources,list) or any(not isinstance(s,str) or not s.startswith(('https://','http://')) for s in sources): raise ValueError('sources는 출처 URL 목록이어야 합니다.')
    # 원문 보존. 판정은 기록자가 검토해야 한다. 문자열 출현만으로 추천을 자동 판정하지 않는다.
    return value

def observation_key(record):
    # 같은 대화는 시각 형식·메타데이터가 바뀌어도 같은 관찰이다. 대화 주소가 없으면 질문·서비스·시각으로 가린다.
    url=record.get('conversation_url') or ''
    if url.startswith(('https://','http://')):
        parts=urllib.parse.urlsplit(url); found=UUID.search(parts.path)
        return '|'.join(('url',parts.netloc.lower(),found.group(0).lower() if found else parts.path))
    instant=parse_time(record['observed_at'])[1].astimezone(timezone.utc).isoformat()
    return '|'.join(('time',record['question_id'],record['platform'],instant))

def import_observation(out, record):
    record=validate_observation(record)
    folder=out/'observations';folder.mkdir(parents=True,exist_ok=True)
    key=observation_key(record)
    for path in sorted(folder.glob('*.json')):
        old=json.loads(path.read_text())
        if observation_key(old)!=key: continue
        # 새 대화 직후 화면이 이전 대화 ID를 잠깐 보여줄 수 있다.
        if old['question_id']!=record['question_id']: raise ValueError(f"같은 대화 주소가 다른 질문({old['question_id']})에 이미 등록돼 있습니다: {path.name}")
        return path,False
    path=folder/(hashlib.sha256(key.encode()).hexdigest()[:20]+'.json')
    path.write_text(json.dumps(record,ensure_ascii=False,indent=2))
    return path,True

def observation_summary(records):
    done=[r for r in records if r.get('status')!='unable_to_check' and r.get('question_id','').startswith('q')]
    count=sum(r['status']=='recommended' for r in done)
    return {'completed':len(done),'recommended':count,'rate':round(count/len(done),3) if done else None}

def sample_table(records):
    # 조건이 다른 표본을 합산하지 않도록 서비스·로그인·모델 표시·검색 근거별로 나눈다.
    groups={}
    for r in records:
        condition=(r.get('platform'),r.get('authenticated'),r.get('model'),r.get('search_usage'))
        counts=groups.setdefault(condition,{}).setdefault(r['question_id'],{'completed':0,'recommended':0,'unable':0})
        if r['status']=='unable_to_check': counts['unable']+=1
        else: counts['completed']+=1; counts['recommended']+=r['status']=='recommended'
    return [{'condition':c,'counts':counts} for c,counts in groups.items()]

def classify_error(error):
    cause=error.reason if isinstance(error,URLError) else error
    if isinstance(cause,ResponseTooLarge): return 'size_limit'
    if isinstance(cause,socket.gaierror): return 'dns'
    if isinstance(cause,(socket.timeout,TimeoutError)): return 'timeout'
    if isinstance(cause,ssl.SSLError): return 'tls'
    if isinstance(cause,OSError): return 'connection'
    return 'other'

def result_error_kind(result):
    if result.get('error_kind'): return result['error_kind']
    error=result.get('error','')
    return next((kind for kind,hints in ERROR_HINTS if any(h in error for h in hints)),'other')

def fetch_public(url):
    try:
        request=urllib.request.Request(url, headers={'User-Agent':'DaneeVisibilityCheck/1.0 (owner-requested audit)'})
        with urllib.request.urlopen(request, timeout=25) as response:
            body=response.read(4_000_001)
            if len(body)>4_000_000: raise ResponseTooLarge('응답 크기 제한 초과')
            return {'url':url,'final_url':response.url,'status':response.status,'x_robots_tag':response.headers.get('X-Robots-Tag',''),'body':body.decode('utf-8','replace')}
    except HTTPError as e:
        with e:
            body=e.read(4_000_000).decode('utf-8','replace')
            return {'url':url,'final_url':e.url,'status':e.code,'x_robots_tag':e.headers.get('X-Robots-Tag',''),'body':body}
    except Exception as e:
        return {'url':url,'status':None,'error':str(e),'error_kind':classify_error(e)}

def all_results(report): return report.get('pages',[])+list(report.get('resources',{}).values())

def collection_status(report):
    # HTTP 오류 응답도 수집된 사이트 상태다. 응답 자체를 못 받은 것만 수집 실패로 센다.
    got=[r.get('status') is not None for r in all_results(report)]
    return 'ok' if got and all(got) else 'partial' if any(got) else 'failed'

def error_counts(report):
    counts={}
    for r in all_results(report):
        if r.get('status') is None:
            kind=result_error_kind(r); counts[kind]=counts.get(kind,0)+1
    return counts

def describe_collection(report):
    errors=', '.join(f'{ERROR_LABEL.get(k,k)} {n}건' for k,n in error_counts(report).items())
    return STATUS_LABEL[collection_status(report)]+(f' ({errors})' if errors else '')

def last_success(out):
    # latest.json은 최근 시도다. 기준선은 runs에서 모든 응답을 받은 가장 최근 점검을 찾는다.
    for path in sorted((out/'runs').glob('*/audit.json'),reverse=True):
        try: report=json.loads(path.read_text())
        except ValueError: continue
        if collection_status(report)=='ok': return report
    return None

def audit(out):
    now=datetime.now(KST); folder=out/'runs'/now.strftime('%Y%m%d-%H%M%S-%f');folder.mkdir(parents=True)
    report={'observed_at':now.isoformat(),'scope':'public-http-not-index-inspection','pages':[],'resources':{}}
    # 게시판 주소가 /notes 에서 /blog 로 바뀜 (2026-10-26). 그 전 기록에는 notes.html 로 남아 있다.
    for path in ('/','/blog','/agency','/letter'):
        result=fetch_public(BASE+path); body=result.pop('body',None)
        if body is not None:
            filename=('home' if path=='/' else path.strip('/'))+'.html'
            (folder/filename).write_text(body)
            result.update(parse_html(body));result['text_sha256']=hashlib.sha256(result['text'].encode()).hexdigest()
            result['raw_file']=filename
        report['pages'].append(result)
    for path in ('/robots.txt','/sitemap.xml'):
        result=fetch_public(BASE+path)
        report['resources'][path]=result
        if 'body' in result: (folder/path.strip('/')).write_text(result['body'])
    sm=report['resources']['/sitemap.xml']
    if sm.get('status')==200:
        try: sm['urls']=[x.text for x in ET.fromstring(sm['body']).iter() if x.tag.split('}')[-1]=='loc']
        except ET.ParseError: sm['parse_error']=True
    report['collection_status']=collection_status(report)
    (folder/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    (out/'latest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    return report

def render(out):
    attempted=(out/'latest.json').exists()
    data=json.loads((out/'latest.json').read_text()) if attempted else {'pages':[],'observed_at':'미실시','resources':{}}
    baseline=last_success(out)
    records=[json.loads(p.read_text()) for p in (out/'observations').glob('*.json')] if (out/'observations').exists() else []
    records.sort(key=lambda r: parse_time(r['observed_at'])[1],reverse=True)
    esc=lambda s: html.escape(str(s))
    link=lambda u: '<a href="'+esc(u)+'" rel="noopener noreferrer">'+esc(u)+'</a>' if isinstance(u,str) and u.startswith(('https://','http://')) else esc(u)
    auth_label=lambda v: {True:'로그인',False:'비로그인'}.get(v,'로그인 미기록')
    def page_table(report):
        rows=[]
        for p in report['pages']:
            if p['status'] is None: state=ERROR_LABEL.get(result_error_kind(p),'기타 오류')+' - 수집 실패'
            elif p['status']!=200: state='HTTP 오류 응답'
            elif 'noindex' in (p.get('robots','')+p.get('x_robots_tag','')).lower(): state='색인 제외 지시 있음'
            else: state='공개 응답 확인 - 실제 색인은 별도 확인'
            rows.append('<tr>'+''.join('<td>'+esc(x)+'</td>' for x in [p['url'],p['status'] or '미확인',p.get('title',''),len(p.get('text','')),state])+'</tr>')
        sm=report['resources'].get('/sitemap.xml',{})
        return '<div class="scroll"><table><tr><th>페이지</th><th>HTTP</th><th>제목</th><th>본문 글자</th><th>해석</th></tr>'+''.join(rows)+'</table></div><p>사이트맵 URL 수: '+esc(len(sm.get('urls',[])) if sm.get('status')==200 else '미확인')+'.</p>'
    if not attempted: site='<div class="card">아직 공개 사이트 점검을 실행하지 않았습니다.</div>'
    else:
        status=collection_status(data)
        site='<p>최근 점검 시도: '+esc(data['observed_at'])+' · <strong>'+esc(describe_collection(data))+'</strong></p>'
        if status!='ok':
            dns_only=set(error_counts(data))=={'dns'}
            site+='<div class="card">이번 시도에서 '+('일부 ' if status=='partial' else '')+'사이트 응답을 받지 못했습니다. 수집 결과이며 사이트 장애로 확인한 것이 아닙니다.'+(' 실패가 모두 이름 해석 단계라면 실행 환경의 네트워크 제한일 가능성이 큽니다. 다른 환경에서 같은 주소를 열어 확인하세요.' if dns_only else '')+'</div>'
        site+=page_table(data)
        if status!='ok':
            site+=('<h3>직전 정상 기준선 · '+esc(baseline['observed_at'])+' - 현재값이 아닙니다</h3>'+page_table(baseline)) if baseline else '<p>정상 수집한 기준선이 아직 없습니다.</p>'
    site+='<p>원본 HTML·robots·사이트맵은 runs 폴더에 날짜별 보존합니다.</p>'
    qrows=''.join('<article><span>'+esc(q['id'])+' · '+esc(q['kind'])+'</span><p>'+esc(q['prompt'])+'</p></article>' for q in questions())
    qids=[q['id'] for q in questions()]
    def cell(c):
        if not c: return '-'
        return ' · '.join([f"{c['completed']}건"]+([f"추천 {c['recommended']}"] if c['recommended'] else [])+([f"판정 불가 {c['unable']}"] if c['unable'] else []))
    def condition_html(platform,authenticated,model,search):
        return '<br>'.join(esc(x) for x in (platform or '서비스 미기록',auth_label(authenticated),'모델 표시: '+str(model or '미기록'),'검색 근거: '+str(search or '미기록')))
    trows=''.join('<tr><td>'+condition_html(*g['condition'])+'</td>'+''.join('<td>'+esc(cell(g['counts'].get(q)))+'</td>' for q in qids)+'</tr>' for g in sample_table(records))
    samples='<h3>조건별 표본 수</h3><p>칸마다 완료한 답변 수입니다. 조건이 다른 줄은 같은 실험의 반복으로 합산하지 않습니다.</p><div class="scroll"><table><tr><th>조건</th>'+''.join('<th>'+esc(q)+('' if q.startswith('q') else ' (추천 제외)')+'</th>' for q in qids)+'</tr>'+trows+'</table></div>' if records else ''
    def observation_html(r):
        conditions=' · '.join(esc(x) for x in (r.get('mode',''),auth_label(r.get('authenticated')),'모델 표시: '+str(r.get('model') or '미기록'),'검색 근거: '+str(r.get('search_usage') or '미기록')))
        conversation='<p><span>대화 주소: '+link(r['conversation_url'])+'</span></p>' if r.get('conversation_url') else ''
        sources=''.join('<li>'+link(s)+'</li>' for s in r.get('sources',[]))
        return ('<article><strong>'+esc(r['platform'])+' · '+esc(r['question_id'])+' · '+esc(r['status'])+'</strong><p>'+esc(r['observed_at'])+'</p><p><span>'+conditions+'</span></p>'+conversation
            +'<details><summary>답변 원문과 근거</summary><pre>'+esc(r['answer'])+'</pre><p>'+esc(r.get('evidence_quote',''))+'</p></details>'
            +'<details><summary>저장한 출처 '+str(len(r.get('sources',[])))+'개</summary><ul>'+sources+'</ul></details></article>')
    orows=('<h3>관찰 기록 · 최근 순</h3>'+''.join(observation_html(r) for r in records)) if records else ''
    summary=observation_summary(records)
    text=f'''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>다니는다니 · 검색과 AI 추천 관찰</title>
<style>body{{font:16px/1.65 -apple-system,BlinkMacSystemFont,sans-serif;color:#282824;background:#f8f7f3;margin:0}}main{{max-width:1080px;margin:auto;padding:42px 24px}}h1{{font-size:34px;line-height:1.3}}h2{{margin-top:42px}}.tag{{color:#c34c37}}article,.card{{background:white;padding:20px 24px;border:1px solid #e5e3dc;border-radius:12px;margin:12px 0}}table{{width:100%;border-collapse:collapse;font-size:14px}}td,th{{padding:12px 8px;border-bottom:1px solid #ddd;text-align:left;overflow-wrap:anywhere}}pre{{white-space:pre-wrap;font:inherit}}span{{font-size:13px;color:#766e62}}h3{{margin-top:28px}}a{{color:#c34c37;overflow-wrap:anywhere}}.scroll{{overflow:auto}}</style>
<main><p class="tag">DANEE · 11/6 강연 준비</p><h1>검색과 AI 추천 관찰</h1>
<div class="card"><strong>측정의 네 단계</strong><p>접근 가능성 → 사업 이해 → 실제 추천 → 신청 이동</p><p>이 보고서는 HTTP 공개 응답과 직접 저장한 AI 답변을 기록합니다. 검색엔진의 실제 색인이나 추천을 자동으로 보장하지 않습니다.</p></div>
<h2>1. 공개 사이트 상태</h2>{site}
<h2>2. 실제 AI 추천 기록</h2><p>완료한 비브랜드 질문 관찰 {summary['completed']}건 / 추천으로 검토한 답변 {summary['recommended']}건.</p><p>질문·서비스·검색 모드가 다른 결과를 일반적인 추천 확률로 해석하지 않습니다. 관찰이 없으면 미실시이며, 미추천과 다릅니다.</p>{samples}{orows or '<div class="card">아직 저장된 실제 AI 서비스 답변이 없습니다.</div>'}
<h2>3. 고정 질문</h2><p>새 대화에서 질문을 하나씩 실행합니다. q1~q5에는 브랜드명·URL을 추가하지 않습니다. 서비스·모델 표시·검색 모드·날짜·답변 원문·출처를 함께 보존합니다.</p>{qrows}
<h2>4. 신청 경로</h2><div class="card">측정 코드 배포 및 데이터베이스 적용 전에는 집계되지 않습니다. 진단·챌린지 링크 클릭은 결제 완료가 아니며, 상담 성공은 서버 저장 성공 후에만 기록합니다. 외부 네이버 폼 안의 제출은 확인할 수 없습니다.</div>
<h2>5. 해석 기준</h2><p>변경 전후에 여러 요소를 함께 바꾸므로 인과관계를 입증하는 실험이 아닙니다. 짧은 기간의 관찰 사례로 발표합니다. 수동 확인한 화면과 원문이 없는 결과는 성과로 세지 않습니다.</p></main></html>'''
    (out/'관찰-대시보드.html').write_text(text)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('action',choices=['audit','report','import']);ap.add_argument('--out',required=True);ap.add_argument('--input');args=ap.parse_args()
    out=Path(args.out).resolve();out.mkdir(parents=True,exist_ok=True)
    # 수집 실패도 기록으로 남기고 종료 코드는 0이다. 결과는 아래 출력과 audit.json의 collection_status로 판단한다.
    if args.action=='audit': print('HTTP 점검: '+describe_collection(audit(out)))
    if args.action=='import':
        path,created=import_observation(out,json.loads(Path(args.input).read_text()))
        # 같은 관찰을 다시 넣어도 안전하다. 판정을 고치려면 기존 파일을 직접 고친다.
        print(('등록: ' if created else '이미 등록된 관찰이라 건너뜀: ')+str(path))
    render(out)
    print(out/'관찰-대시보드.html')

if __name__=='__main__': main()
