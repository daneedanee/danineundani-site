import importlib.util
import unittest
import tempfile
import io
import json
import socket
import ssl
from urllib.error import HTTPError, URLError
from unittest.mock import patch
from pathlib import Path

class ObserverTests(unittest.TestCase):
    def load(self):
        spec = importlib.util.spec_from_file_location('observer', Path(__file__).with_name('observer.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def test_parser_excludes_script_style_and_hidden_text(self):
        m = self.load()
        parsed = m.parse_html('<title>A</title><h1>사업</h1><script>가짜 문구</script><style>숨김</style><div hidden>비공개</div><p>진단 서비스</p><a href="/blog">블로그</a><meta name="robots" content="index,follow"><link rel="canonical" href="https://www.daneedanee.com/">')
        self.assertEqual(parsed['h1'], ['사업'])
        self.assertNotIn('가짜', parsed['text'])
        self.assertNotIn('비공개', parsed['text'])
        self.assertIn('진단 서비스', parsed['text'])
        self.assertEqual(parsed['links'], ['/blog'])
        self.assertEqual(parsed['robots'], 'index,follow')

    def test_observation_requires_raw_answer_and_recommendation_quote(self):
        m = self.load()
        record = {'question_id':'q1','platform':'ChatGPT','mode':'web-search','observed_at':'2026-10-23T10:00:00+09:00','answer':'일반적인 방법만 설명합니다.','status':'recommended','evidence_quote':'다니는다니를 추천합니다.','sources':[]}
        with self.assertRaises(ValueError): m.validate_observation(record)
        record['status']='not_mentioned'; record['evidence_quote']=''
        self.assertEqual(m.validate_observation(record)['status'], 'not_mentioned')

    def test_unknown_is_not_negative_result(self):
        m=self.load()
        summary=m.observation_summary([])
        self.assertEqual(summary, {'completed':0,'recommended':0,'rate':None})

    def test_http_error_preserves_status_and_body(self):
        m=self.load()
        error=HTTPError('https://example.com',403,'Forbidden',{},io.BytesIO(b'blocked'))
        with patch.object(m.urllib.request,'urlopen',side_effect=error):
            r=m.fetch_public('https://example.com')
        self.assertEqual(r['status'],403)
        self.assertEqual(r['body'],'blocked')

    def test_empty_report_renders(self):
        m=self.load()
        with tempfile.TemporaryDirectory() as d:
            m.render(Path(d))
            self.assertIn('아직 저장된 실제', (Path(d)/'관찰-대시보드.html').read_text())

    def test_jsonld_is_parsed_but_not_added_to_visible_text(self):
        m=self.load()
        parsed=m.parse_html('<script type="application/ld+json">{"@type":"Organization","name":"마켓티브"}</script><p>내용</p>')
        self.assertEqual(parsed['jsonld'][0]['@type'],'Organization')
        self.assertNotIn('마켓티브',parsed['text'])

    def test_network_errors_are_classified(self):
        m=self.load()
        cases=[
            (URLError(socket.gaierror(8,'nodename nor servname provided')),'dns'),
            (URLError(socket.timeout('timed out')),'timeout'),
            (socket.timeout('timed out'),'timeout'),
            (URLError(ssl.SSLCertVerificationError(1,'certificate verify failed')),'tls'),
            (URLError(ConnectionRefusedError(61,'Connection refused')),'connection'),
        ]
        for error,kind in cases:
            with self.subTest(kind=kind), patch.object(m.urllib.request,'urlopen',side_effect=error):
                r=m.fetch_public('https://example.com')
                self.assertIsNone(r['status'])
                self.assertEqual(r['error_kind'],kind)

    def test_oversized_response_is_size_limit(self):
        m=self.load()
        class FakeResponse:
            url='https://example.com'; status=200; headers={}
            def __enter__(self): return self
            def __exit__(self,*args): return False
            def read(self,n=-1): return b'x'*n
        with patch.object(m.urllib.request,'urlopen',return_value=FakeResponse()):
            r=m.fetch_public('https://example.com')
        self.assertIsNone(r['status'])
        self.assertEqual(r['error_kind'],'size_limit')

    def test_collection_status_separates_http_errors_from_collection_failures(self):
        m=self.load()
        def report(*statuses):
            return {'pages':[{'status':s} for s in statuses[:-1]],'resources':{'/robots.txt':{'status':statuses[-1]}}}
        self.assertEqual(m.collection_status(report(200,404,200)),'ok')
        self.assertEqual(m.collection_status(report(200,None,200)),'partial')
        self.assertEqual(m.collection_status(report(None,None,None)),'failed')

    def test_last_success_skips_newer_failed_runs(self):
        m=self.load()
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)
            self.assertIsNone(m.last_success(out))
            write_run(out,'20261023-010527-995690',OK_RUN)
            write_run(out,'20261024-175738-614817',FAILED_RUN)
            self.assertEqual(m.last_success(out)['observed_at'],'2026-10-23T01:05:27+09:00')

    def test_dashboard_shows_failed_attempt_apart_from_previous_baseline(self):
        m=self.load()
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)
            write_run(out,'20261023-010527-995690',OK_RUN)
            write_run(out,'20261024-175738-614817',FAILED_RUN)
            (out/'latest.json').write_text(json.dumps(FAILED_RUN))
            m.render(out)
            page=(out/'관찰-대시보드.html').read_text()
        self.assertIn('수집 실패',page)
        self.assertIn('이름 해석 실패 2건',page)
        self.assertIn('직전 정상 기준선',page)
        self.assertIn('2026-10-23T01:05:27+09:00',page)
        self.assertIn('BASELINE-TITLE',page)

    def test_z_suffix_time_is_accepted_and_normalized(self):
        m=self.load()
        record=observation(observed_at='2026-10-24T09:00:00Z')
        self.assertEqual(m.validate_observation(record)['observed_at'],'2026-10-24T09:00:00+00:00')

    def test_reimport_of_same_conversation_is_skipped(self):
        m=self.load()
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)
            first=observation(conversation_url='https://chatgpt.com/c/6adc730d-ab18-83ea-a734-59ef82663006')
            self.assertTrue(m.import_observation(out,first)[1])
            again=observation(conversation_url='https://chatgpt.com/c/6adc730d-ab18-83ea-a734-59ef82663006',observed_at='2026-10-24T08:58:53Z',capture_note='메타데이터만 바뀜')
            self.assertFalse(m.import_observation(out,again)[1])
            other=observation(conversation_url='https://chatgpt.com/c/11111111-2222-3333-4444-555555555555')
            self.assertTrue(m.import_observation(out,other)[1])
            self.assertEqual(len(list((out/'observations').glob('*.json'))),2)

    def test_same_conversation_for_different_question_is_rejected(self):
        m=self.load()
        with tempfile.TemporaryDirectory() as d:
            out=Path(d); url='https://chatgpt.com/c/6adc730d-ab18-83ea-a734-59ef82663006'
            m.import_observation(out,observation(question_id='q1',conversation_url=url))
            with self.assertRaises(ValueError): m.import_observation(out,observation(question_id='q2',conversation_url=url))
            self.assertEqual(len(list((out/'observations').glob('*.json'))),1)

    def test_reimport_without_conversation_url_matches_same_instant(self):
        m=self.load()
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)
            self.assertTrue(m.import_observation(out,observation(observed_at='2026-10-24T17:58:53+09:00'))[1])
            self.assertFalse(m.import_observation(out,observation(observed_at='2026-10-24T08:58:53Z'))[1])
            self.assertTrue(m.import_observation(out,observation(observed_at='2026-10-25T17:58:53+09:00'))[1])

    def test_sample_table_groups_by_question_and_condition(self):
        m=self.load()
        records=[
            observation(question_id='q1'),
            observation(question_id='q1',status='recommended',answer='다니는다니를 추천합니다.',evidence_quote='다니는다니를 추천합니다.'),
            observation(question_id='q2',status='unable_to_check'),
            observation(question_id='q1',authenticated=True),
            observation(question_id='b1'),
        ]
        table=m.sample_table(records)
        self.assertEqual(table,[
            {'condition':('ChatGPT web',False,'화면 미표시','출처 링크만 확인'),
             'counts':{'q1':{'completed':2,'recommended':1,'unable':0},'q2':{'completed':0,'recommended':0,'unable':1},'b1':{'completed':1,'recommended':0,'unable':0}}},
            {'condition':('ChatGPT web',True,'화면 미표시','출처 링크만 확인'),
             'counts':{'q1':{'completed':1,'recommended':0,'unable':0}}},
        ])

    def test_dashboard_shows_observation_conditions_and_sources(self):
        m=self.load()
        with tempfile.TemporaryDirectory() as d:
            out=Path(d); (out/'observations').mkdir()
            record=observation(sources=['https://example.com/source'],conversation_url='https://chatgpt.com/c/6adc730d-ab18-83ea-a734-59ef82663006')
            (out/'observations'/'a.json').write_text(json.dumps(record,ensure_ascii=False))
            m.render(out)
            page=(out/'관찰-대시보드.html').read_text()
        self.assertIn('href="https://example.com/source"',page)
        self.assertIn('href="https://chatgpt.com/c/6adc730d-ab18-83ea-a734-59ef82663006"',page)
        self.assertIn('비로그인',page)
        self.assertIn('출처 링크만 확인',page)

def observation(**changes):
    record={'question_id':'q1','platform':'ChatGPT web','mode':'무료 비로그인','observed_at':'2026-10-24T17:58:53+09:00','answer':'일반적인 방법만 설명합니다.','status':'not_mentioned','evidence_quote':'','sources':[],'authenticated':False,'model':'화면 미표시','search_usage':'출처 링크만 확인'}
    record.update(changes)
    return record

def write_run(out,name,report):
    folder=out/'runs'/name; folder.mkdir(parents=True)
    (folder/'audit.json').write_text(json.dumps(report,ensure_ascii=False))

DNS_ERROR='<urlopen error [Errno 8] nodename nor servname provided, or not known>'
OK_RUN={'observed_at':'2026-10-23T01:05:27+09:00','pages':[{'url':'https://www.daneedanee.com/','status':200,'title':'BASELINE-TITLE','text':'본문'}],'resources':{'/robots.txt':{'status':200}}}
# error_kind가 없는 옛 기록도 오류 문구로 분류해야 한다.
FAILED_RUN={'observed_at':'2026-10-24T17:57:38+09:00','pages':[{'url':'https://www.daneedanee.com/','status':None,'error':DNS_ERROR}],'resources':{'/robots.txt':{'status':None,'error':DNS_ERROR}}}

if __name__=='__main__': unittest.main()
