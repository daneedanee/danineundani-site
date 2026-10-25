-- 방문 측정 날짜별 집계 (한국 시간) · Supabase SQL Editor에서 열어 Run 만 누르면 된다. 읽기만 한다.
-- 래피드 결제 "이동"은 결제 완료가 아니다. 결제 건수는 래피드에서 본다.
-- 같은 사람이 여러 번 눌러도 그때마다 센다(방문자 수가 아니라 횟수).
-- 2026-10-26 01:55 (한국 시간) 홈 방문 1건은 운영 적용 확인용으로 남긴 기록이다.
select (created_at at time zone 'Asia/Seoul')::date as 날짜,
       count(*) filter (where event = 'page_view' and path = '/') as 홈_방문,
       count(*) filter (where event = 'finder_start') as 고민찾기_시작,
       count(*) filter (where event = 'finder_result') as 고민찾기_결과,
       count(*) filter (where event = 'diagnosis_page_click') as 진단상세로_이동,
       count(*) filter (where event = 'page_view' and path = '/diagnosis') as 진단상세_방문,
       count(*) filter (where event = 'diagnosis_click') as 래피드결제로_이동,
       count(*) filter (where event = 'workbook_click') as 워크북_클릭,
       count(*) filter (where event = 'page_view' and path = '/letter') as 다니레터_방문,
       count(*) filter (where event = 'contact_success') as 상담_저장,
       count(*) filter (where campaign <> 'none') as 유튜브_캠페인_유입
from public.cab_visibility_events
group by 1
order by 1 desc;
