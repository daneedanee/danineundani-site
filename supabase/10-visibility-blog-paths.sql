-- 방문 측정 경로 목록 바꾸기 · Supabase SQL Editor에서 한 번 실행합니다. (2026-10-26)
-- 게시판 주소를 /notes 에서 /blog 로 옮기고(메뉴 이름 "블로그"), 소개 페이지 /about 을 측정에 넣는다.
-- 옛 경로(/notes, /notes/[slug])는 이미 쌓인 기록이 있어 허용 목록에 남긴다. 코드는 더 이상 보내지 않는다.
-- 코드(src/lib/visibility/measurement.ts 의 measuredPaths + retiredPaths)와 목록이 같아야 한다(테스트가 확인).
-- 사이트 배포보다 먼저 실행한다. 늦으면 새 경로의 기록이 그동안 거절된다.

alter table public.cab_visibility_events drop constraint if exists cab_visibility_events_path_check;
alter table public.cab_visibility_events
  add constraint cab_visibility_events_path_check
  check (path in ('/','/blog','/blog/[slug]','/agency','/letter','/diagnosis','/about','/notes','/notes/[slug]'));
