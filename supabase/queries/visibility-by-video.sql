-- 유튜브 영상별 홈페이지 방문과 신청 클릭 (한국 시간) · Supabase SQL Editor에서 열어 Run 만 누르면 된다. 읽기만 한다.
-- 영상 이름은 설명란 링크의 utm_campaign(yt_올린날짜). 강연용 세 영상은 youtube_a·b·c.
-- 같은 방문에서 이어 본 페이지도 그 영상 몫으로 센다(브라우저 탭을 닫기 전까지). 횟수이지 사람 수가 아니다.
-- 래피드 결제 "이동"은 결제 완료가 아니다. 결제 건수는 래피드에서 본다.
select campaign as 영상,
       min((created_at at time zone 'Asia/Seoul')::date) as 첫날,
       count(*) filter (where event = 'page_view') as 페이지_방문,
       count(*) filter (where event = 'page_view' and path = '/diagnosis') as 진단상세_방문,
       count(*) filter (where event = 'diagnosis_click') as 래피드_결제이동,
       count(*) filter (where event = 'page_view' and path = '/about') as 소개_방문,
       count(*) filter (where event in ('letter_click', 'workbook_click')) as 다니레터_워크북_클릭,
       count(*) filter (where event = 'contact_start') as 상담_시작,
       count(*) filter (where event = 'contact_success') as 상담_신청
from public.cab_visibility_events
where campaign <> 'none'
group by campaign
order by 첫날 desc, 영상;
