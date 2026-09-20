-- 로그인한 사람도 상담 신청을 넣을 수 있게 한다 (2026-09-20)
-- Supabase SQL Editor에서 한 번 실행합니다.
--
-- 왜 필요한가:
--   /admin 에 로그인하면 같은 브라우저의 홈페이지에서도 "로그인한 사용자" 자격으로 요청이 나간다.
--   그런데 01번 파일에서 로그인 사용자의 권한을 모두 회수해 두어서, 관리자가 자기 홈페이지의
--   상담 폼을 시험하면 "신청을 보내지 못했습니다"가 떴다.
--
-- 바뀌는 것: 로그인 여부와 상관없이 누구나 신청을 넣을 수 있다.
-- 그대로인 것: 신청 목록을 읽는 것은 여전히 관리자 이메일만 가능하다.

begin;

grant insert (name, email, message) on table public.cab_inquiries to authenticated;

drop policy if exists "logged_in_can_submit" on public.cab_inquiries;

create policy "logged_in_can_submit" on public.cab_inquiries
  for insert to authenticated with check (true);

commit;
