-- 방문 측정: 유튜브 영상별 캠페인 받기 · Supabase SQL Editor에서 한 번 실행합니다. (2026-10-28)
-- 설명란 링크에 utm_campaign=yt_올린날짜(같은 날 둘째부터 b, c…)를 붙여 영상마다 홈페이지 방문과 신청 클릭을 센다.
-- 강연용 세 영상(youtube_a·b·c)과 none 은 그대로 받는다. 코드(src/lib/visibility/measurement.ts 의 videoCampaignPattern)와 같은 꼴이어야 한다(테스트가 확인).
-- 사이트 배포보다 먼저 실행한다. 늦으면 그동안 영상별 기록이 거절된다.

alter table public.cab_visibility_events drop constraint if exists cab_visibility_events_campaign_check;
alter table public.cab_visibility_events
  add constraint cab_visibility_events_campaign_check
  check (campaign in ('none','youtube_a','youtube_b','youtube_c') or campaign ~ '^yt_[0-9]{8}[a-z]?$');
