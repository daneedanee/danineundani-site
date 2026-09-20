-- 관리자 페이지용 · Supabase SQL Editor에서 한 번 실행합니다.
--
-- 하는 일: 로그인한 사용자 중 "관리자 이메일과 정확히 같은 사람"만 신청 목록을 읽을 수 있게 한다.
-- 방문자(anon)는 지금처럼 신청을 넣기만 하고, 아무것도 읽지 못한다.
-- 관리자가 아닌 계정으로 로그인하면 목록이 비어 보인다 (읽히는 줄이 0개).
--
-- 관리자 이메일을 바꾸려면 아래 'marktive@naver.com' 두 군데를 고쳐서 다시 실행한다.

begin;

-- 읽기 권한은 로그인한 사용자에게만 준다. 어떤 줄이 보이는지는 아래 정책이 정한다.
grant select on table public.cab_inquiries to authenticated;

drop policy if exists "admin_can_read" on public.cab_inquiries;

create policy "admin_can_read" on public.cab_inquiries
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'marktive@naver.com');

commit;

-- 실행 후 확인용 (관리자 계정으로 로그인한 상태에서만 줄이 보인다):
--   select count(*) from public.cab_inquiries;
