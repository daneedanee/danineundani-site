-- 기존 문의·게시글 표를 변경하지 않는다. 프로젝트 ykwhdegzqcgtwynedxqv 전용.
-- 2026-10-26 적용. 쓰기는 09-visibility-record-function.sql 의 함수로만 한다(서비스 키를 쓰는 처음 설계에서 바뀜).
-- 이 표 생성 후 Vercel Production에서 NEXT_PUBLIC_VISIBILITY_MEASUREMENT=true 로 켠다.
-- 방문자 식별자, IP, 이메일, 상담 내용, 전체 URL, 임의 UTM 문자열은 저장하지 않는다.
-- 공개 웹에서 발생한 이벤트이므로 위조/봇을 완전히 배제한 매출 증거가 아니다.
-- 이벤트·경로 목록은 src/lib/visibility/measurement.ts 와 같아야 한다(measurement.test.ts 가 확인). 2026-10-26 진단 상세·워크북·고민 찾기 추가.
begin;
create table if not exists public.cab_visibility_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null check (event in ('page_view','diagnosis_click','challenge_click','agency_click','contact_start','kakao_click','contact_success','diagnosis_page_click','letter_click','workbook_click','finder_start','finder_result')),
  path text not null check (path in ('/','/notes','/notes/[slug]','/agency','/letter','/diagnosis')),
  campaign text not null check (campaign in ('none','youtube_a','youtube_b','youtube_c'))
);
create index if not exists cab_visibility_events_time_idx on public.cab_visibility_events (created_at);
alter table public.cab_visibility_events enable row level security;
revoke all on public.cab_visibility_events from anon, authenticated;
grant insert(event,path,campaign) on public.cab_visibility_events to service_role;
grant select on public.cab_visibility_events to authenticated;
drop policy if exists visibility_insert on public.cab_visibility_events;
-- 익명 직접 쓰기 금지. 기록은 09의 함수로만 한다.
drop policy if exists visibility_admin_read on public.cab_visibility_events;
create policy visibility_admin_read on public.cab_visibility_events for select to authenticated using ((auth.jwt()->>'email')='marktive@naver.com');
commit;

-- 운영자용 집계. 외부 판매 페이지 이동은 결제 완료가 아니다.
-- select (created_at at time zone 'Asia/Seoul')::date as date, campaign, event, count(*) as count
-- from public.cab_visibility_events
-- group by 1,2,3 order by 1 desc,2,3;
