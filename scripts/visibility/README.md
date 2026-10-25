# 검색·추천 관찰 도구

Python 3 표준 라이브러리만 사용. 유료 API 호출 없음.

```sh
python3 scripts/visibility/observer.py audit --out /absolute/output/path
python3 scripts/visibility/observer.py report --out /absolute/output/path
python3 scripts/visibility/observer.py import --input /absolute/observation.json --out /absolute/output/path
python3 -m unittest discover -s scripts/visibility -p 'test_*.py'
```

관찰 JSON 필수 필드: question_id(questions.json ID), platform, mode, observed_at(시간대 포함 ISO), answer(원문), status, evidence_quote, sources(URL 문자열 배열).
상태: recommended, mentioned, cited_only, not_mentioned, unable_to_check. 추천/언급/인용은 원문 내 근거 문장을 요구한다. 의미 판정은 기록자가 수행하고 원문과 함께 검토한다. 브랜드 질문 b1은 추천 집계에서 제외한다.

관찰 JSON의 observed_at 끝이 Z면 +00:00으로 바꿔 저장한다. 같은 관찰은 한 번만 등록한다. 대화 주소가 있으면 주소의 대화 ID로, 없으면 질문·서비스·시각(같은 순간이면 형식이 달라도 같음)으로 가린다. 다시 넣으면 건너뛰고, 같은 대화 주소가 다른 질문으로 들어오면 거부한다. 판정을 고치려면 observations의 기존 파일을 직접 고친다.

audit는 수집에 실패해도 기록을 남기고 종료 코드 0으로 끝난다. 결과는 출력 첫 줄(HTTP 점검: 정상 수집 / 일부 수집 실패 / 수집 실패)과 audit.json의 collection_status로 판단한다. HTTP 오류 응답(404 등)은 수집된 사이트 상태이고, 응답 자체를 못 받은 경우만 수집 실패다. 실패마다 error_kind(dns, timeout, connection, tls, size_limit, other)를 남긴다. latest.json은 최근 시도다. 대시보드는 최근 시도가 정상이 아니면 runs에서 모든 응답을 받은 가장 최근 점검을 "직전 정상 기준선"으로 따로 보여 준다. 대시보드의 조건별 표본 수는 서비스·로그인·모델 표시·검색 근거 문구가 정확히 같은 관찰끼리만 묶는다.

공개 HTTP 접근 점검은 검색엔진 색인 검사와 다르다. 이 도구의 HTML 본문 추출은 브라우저 렌더링을 대체하지 않는다. CSS로 숨겨진 콘텐츠, iframe 안 콘텐츠, JS로 추가한 본문은 별도 확인해야 한다. 직접 URL을 제시한 이해 점검은 비브랜드 자연 추천과 분리한다.

실측 활성화: supabase/08-visibility-events.sql(표)과 09-visibility-record-function.sql(기록 함수) 적용, Vercel Production에 NEXT_PUBLIC_VISIBILITY_MEASUREMENT=true 설정 후 재배포(2026-10-26 적용 끝). API는 기본 비활성. 서버는 방문자용 공개 키로 기록 함수 하나만 부르고, 데이터베이스 전체 권한을 가진 서비스 키는 쓰지 않는다. 표에 익명 직접 쓰기는 허용하지 않는다. 브라우저 신호는 위조 가능하므로 결제·검증된 문의 건수로 간주하지 않는다.

점검 전용 탭은 ?visibility_test=1로 시작한다. 이 탭의 세션 전체를 제외한다. 실제 폼을 운영 DB에 가짜 제출하지 않는다. 고유 방문자 ID를 저장하지 않으므로 고유 방문자 전환율을 계산하지 않는다.

원본 HTML·답변은 공개 Git에 올리지 않고 --out에 보관한다. python __pycache__ 파일은 커밋하지 않는다.
